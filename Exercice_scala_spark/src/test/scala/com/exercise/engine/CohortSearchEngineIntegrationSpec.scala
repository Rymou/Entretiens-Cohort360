package com.exercise.engine

import com.exercise.model.{Criterion, SearchCriteria}
import com.exercise.utils.SolrConf
import org.apache.spark.sql.SparkSession
import org.scalatest.BeforeAndAfterAll
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

/**
 * Integration test for CohortSearchEngine.
 * Requires Solr to be running (docker compose up -d) and seed data loaded.
 * Run with: sbt test
 */
class CohortSearchEngineIntegrationSpec extends AnyFlatSpec with Matchers with BeforeAndAfterAll {

  private var spark: SparkSession = _
  private var engine: CohortSearchEngine = _

  override def beforeAll(): Unit = {
    spark = SparkSession.builder()
      .appName("CohortSearchEngineIntegrationTest")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()
    val solrConf = SolrConf("http://localhost:8983/solr", "localhost:9983")
    engine = new CohortSearchEngine(spark, solrConf)
  }

  override def afterAll(): Unit = {
    if (engine != null) engine.stop()
  }

  "CohortSearchEngine.runSearch" should "return a non-negative count" in {
    val criteria = SearchCriteria(
      Perimeters = Seq("Organization/aphp-psl"),
      Criteria = Seq(
        Criterion("Patient", "true", "gender=male&active=true"),
        Criterion("Encounter", "true", "length=lt100")
      )
    )
    val count = engine.runSearch(criteria)
    count should be >= 0L
  }

  it should "return 3 for the default query.json criteria (with seed data)" in {
    val criteria = SearchCriteria(
      Perimeters = Seq("Organization/aphp-psl"),
      Criteria = Seq(
        Criterion("Patient", "true", "birthDate=ge2005-01-01&gender=male&active=true"),
        Criterion("Encounter", "true", "length=lt12"),
        Criterion("DocumentReference", "false", "description=cancer")
      )
    )
    val count = engine.runSearch(criteria)
    count shouldBe 3
  }

  it should "return 0 or more when Perimeters is empty (no perimeter filter)" in {
    val criteria = SearchCriteria(
      Perimeters = Seq.empty,
      Criteria = Seq(Criterion("Patient", "true", "active=true"))
    )
    val count = engine.runSearch(criteria)
    count should be >= 0L
  }
}
