package com.exercise.engine

import com.exercise.model._
import com.exercise.utils.{SolrConf, SolrConnector}
import com.typesafe.scalalogging.LazyLogging
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._

class CohortSearchEngine(spark: SparkSession, solrConf: SolrConf) extends LazyLogging {
  private val connector = new SolrConnector(spark, solrConf)
  import spark.implicits._

  /**
   * Maps FHIR Resource name to Solr collection name
   */
  private def resourceToCollection(resource: String): String = {
    resource match {
      case "Patient" => "patientAphp"
      case "Encounter" => "encounterAphp"
      case "DocumentReference" => "documentReferenceAphp"
      case "Organization" => "organizationAphp"
      case _ => throw new IllegalArgumentException(s"Unknown resource type: $resource")
    }
  }

  /**
   * Extracts patient IDs from a DataFrame based on the resource type
   * - For Patient resource: use the 'id' field
   * - For other resources: extract from 'subject.reference' field (format: "Patient/P1" -> "P1")
   */
  private def extractPatientIds(df: DataFrame, resourceType: String): DataFrame = {
    if (resourceType == "Patient") {
      df.select(col("id").as("patientId"))
    } else {
      // Extract patient ID from subject.reference (format: "Patient/P1")
      // Use backticks to handle field names with dots
      df.select(
        regexp_extract(col("`subject.reference`"), "Patient/(.+)", 1).as("patientId")
      ).filter(col("patientId").isNotNull && col("patientId") =!= "")
    }
  }

  /**
   * Apply perimeter filter
   * Keeps only patients who have at least one Encounter in one of the given organizations.
   * Perimeters format: "Organization/aphp-psl" or "aphp-psl".
   *
   * @param cohortPatients  DataFrame with column "patientId" 
   * @param perimeters      Non-empty list of organization references
   * @return DataFrame of patientId restricted to patients in perimeter
   */
  private def applyPerimeterFilter(cohortPatients: DataFrame, perimeters: Seq[String]): DataFrame = {
    if (perimeters.isEmpty) {
      return cohortPatients
    }

    logger.info(s"Applying perimeter filter for organizations: ${perimeters.mkString(", ")}")

    val orgIds = perimeters.map { p =>
      if (p.startsWith("Organization/")) p.substring("Organization/".length) else p
    }.filter(_.nonEmpty)

    if (orgIds.isEmpty) {
      logger.warn("No valid organization IDs in Perimeters; skipping perimeter filter")
      return cohortPatients
    }

    val orgFilters = if (orgIds.length == 1) {
      Seq(s"serviceProvider.reference:Organization/${orgIds.head}")
    } else {
      val orClause = orgIds.map(id => s"serviceProvider.reference:Organization/$id").mkString(" OR ")
      Seq(s"($orClause)")
    }

    val encountersDf = connector.loadCollection("encounterAphp", orgFilters)
    val patientsInPerimeter = extractPatientIds(encountersDf, "Encounter").distinct()
    val perimeterCount = patientsInPerimeter.count()
    logger.info(s"Found $perimeterCount patients with encounters in perimeter organizations")

    cohortPatients.join(patientsInPerimeter, Seq("patientId"), "inner")
  }

  def runSearch(criteria: SearchCriteria): Long = {
    logger.info(s"Starting cohort search with ${criteria.Criteria.length} criteria")

    // Separate criteria into include and exclude
    val includeCriteria = criteria.Criteria.filter(_.Include == "true")
    val excludeCriteria = criteria.Criteria.filter(_.Include == "false")

    logger.info(s"Include criteria: ${includeCriteria.length}, Exclude criteria: ${excludeCriteria.length}")

    // Process include criteria: intersection of all patient IDs
    val includePatientIds: Option[DataFrame] = if (includeCriteria.nonEmpty) {
      val patientIdDataFrames = includeCriteria.map { criterion =>
        val collection = resourceToCollection(criterion.Resource)
        val filters = FhirSearchParamToSolr.translateSearchParamsToSolrFilters(criterion.searchParams)
        
        logger.info(s"Loading collection $collection with filters: ${filters.mkString(", ")}")
        val df = connector.loadCollection(collection, filters)
        val patientIds = extractPatientIds(df, criterion.Resource).distinct()
        
        logger.info(s"Found ${patientIds.count()} distinct patients for criterion ${criterion.Resource}")
        patientIds
      }

      // Intersection: keep only patients that appear in ALL include criteria
      val result = patientIdDataFrames.reduce { (df1, df2) =>
        df1.join(df2, Seq("patientId"), "inner")
      }
      Some(result)
    } else {
      None
    }

    // Process exclude criteria: remove patients that match any exclude criterion
    val afterExclusions: DataFrame = if (excludeCriteria.nonEmpty) {
      val excludePatientIds = excludeCriteria.flatMap { criterion =>
        val collection = resourceToCollection(criterion.Resource)
        val filters = FhirSearchParamToSolr.translateSearchParamsToSolrFilters(criterion.searchParams)
        
        logger.info(s"Loading collection $collection for exclusion with filters: ${filters.mkString(", ")}")
        val df = connector.loadCollection(collection, filters)
        val patientIds = extractPatientIds(df, criterion.Resource).distinct()
        
        logger.info(s"Excluding ${patientIds.count()} patients for criterion ${criterion.Resource}")
        Some(patientIds)
      }

      // Union of all exclude criteria (patients to remove)
      val excludeUnion = excludePatientIds.reduce { (df1, df2) =>
        df1.union(df2).distinct()
      }

      // Start with include results (or all patients if no include criteria)
      val basePatients = includePatientIds.getOrElse {
        // If no include criteria, start with all patients
        val allPatients = connector.loadCollection("patientAphp", Seq.empty)
        extractPatientIds(allPatients, "Patient")
      }

      // Remove excluded patients
      basePatients.join(excludeUnion, Seq("patientId"), "left_anti")
    } else {
      // No exclusions, return include results or all patients
      includePatientIds.getOrElse {
        val allPatients = connector.loadCollection("patientAphp", Seq.empty)
        extractPatientIds(allPatients, "Patient")
      }
    }

    val finalPatientIds: DataFrame = applyPerimeterFilter(afterExclusions, criteria.Perimeters)
    val count: Long = finalPatientIds.distinct().count()
    logger.info(s"Final patient count after all filters: $count")
    count
  }

  def stop(): Unit = spark.stop()
}
