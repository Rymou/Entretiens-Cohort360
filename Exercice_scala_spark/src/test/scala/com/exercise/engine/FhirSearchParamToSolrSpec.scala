package com.exercise.engine

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class FhirSearchParamToSolrSpec extends AnyFlatSpec with Matchers {

  "translateSearchParamsToSolrFilters" should "return empty for null or empty input" in {
    FhirSearchParamToSolr.translateSearchParamsToSolrFilters(null) shouldBe Seq.empty
    FhirSearchParamToSolr.translateSearchParamsToSolrFilters("") shouldBe Seq.empty
    FhirSearchParamToSolr.translateSearchParamsToSolrFilters("   ") shouldBe Seq.empty
  }

  it should "translate ge (greater or equal) to Solr range" in {
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters("birthDate=ge2005-01-01")
    result should have size 1
    result.head shouldBe "birthDate:[2005-01-01T00:00:00Z TO *]"
  }

  it should "translate lt (less than) numeric to Solr range" in {
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters("length=lt12")
    result should have size 1
    result.head shouldBe "length:[* TO 11]"
  }

  it should "translate equality params" in {
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters("gender=male&active=true")
    result should have size 2
    result should contain("gender:male")
    result should contain("active:true")
  }

  it should "translate combined query from query.json example" in {
    val params = "birthDate=ge2005-01-01&gender=male&active=true"
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters(params)
    result should have size 3
    result should contain("birthDate:[2005-01-01T00:00:00Z TO *]")
    result should contain("gender:male")
    result should contain("active:true")
  }

  it should "translate description equality for exclusion" in {
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters("description=cancer")
    result should have size 1
    result.head shouldBe "description:cancer"
  }

  it should "handle le (less or equal) for dates" in {
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters("birthDate=le2020-12-31")
    result should have size 1
    result.head shouldBe "birthDate:[* TO 2020-12-31T23:59:59Z]"
  }

  it should "handle gt (greater than) for dates" in {
    val result = FhirSearchParamToSolr.translateSearchParamsToSolrFilters("birthDate=gt1990-01-01")
    result should have size 1
    result.head shouldBe "birthDate:[1990-01-01T00:00:00Z TO *]"
  }
}
