package com.exercise.engine

/**
 * Translates FHIR search parameters (query string) to Solr filter queries (fq).
 * Used by CohortSearchEngine for Phase 1 criteria filtering.
 */
object FhirSearchParamToSolr {

  /**
   * Translates FHIR search parameters to Solr filter queries.
   * Examples:
   *   - birthDate=ge2005-01-01 -> birthDate:[2005-01-01T00:00:00Z TO *]
   *   - length=lt12 -> length:[* TO 11]
   *   - gender=male -> gender:male
   *
   * @param searchParams query string format: param1=value1&param2=value2
   * @return sequence of Solr filter query strings
   */
  def translateSearchParamsToSolrFilters(searchParams: String): Seq[String] = {
    if (searchParams == null || searchParams.trim.isEmpty) {
      return Seq.empty
    }

    searchParams.split("&").flatMap { param =>
      if (param.contains("=")) {
        val parts = param.split("=", 2)
        if (parts.length == 2) {
          val field = parts(0)
          val value = parts(1)

          if (value.startsWith("ge")) {
            val dateValue = value.substring(2)
            val solrDate = if (dateValue.contains("T")) dateValue else s"${dateValue}T00:00:00Z"
            Some(s"$field:[$solrDate TO *]")
          } else if (value.startsWith("gt")) {
            val dateValue = value.substring(2)
            val solrDate = if (dateValue.contains("T")) dateValue else s"${dateValue}T00:00:00Z"
            Some(s"$field:[$solrDate TO *]")
          } else if (value.startsWith("le")) {
            val dateValue = value.substring(2)
            val solrDate = if (dateValue.contains("T")) dateValue else s"${dateValue}T23:59:59Z"
            Some(s"$field:[* TO $solrDate]")
          } else if (value.startsWith("lt")) {
            val numValue = value.substring(2)
            try {
              val num = numValue.toInt
              Some(s"$field:[* TO ${num - 1}]")
            } catch {
              case _: NumberFormatException =>
                val dateValue = numValue
                val solrDate = if (dateValue.contains("T")) dateValue else s"${dateValue}T00:00:00Z"
                Some(s"$field:[* TO $solrDate]")
            }
          } else {
            Some(s"$field:$value")
          }
        } else {
          None
        }
      } else {
        None
      }
    }.toSeq
  }
}
