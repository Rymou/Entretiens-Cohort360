from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from medical.models import Patient, Medication, Prescription


class ApiListTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Patients
        Patient.objects.create(last_name="Martin", first_name="Jeanne", birth_date="1992-03-10")
        Patient.objects.create(last_name="Durand", first_name="Jean", birth_date="1980-05-20")
        Patient.objects.create(last_name="Bernard", first_name="Paul")

        # Medications
        Medication.objects.create(code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF)
        Medication.objects.create(code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_SUPPR)

    def test_patient_list(self):
        url = reverse("patient-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 3)

    def test_patient_filter_nom(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"nom": "mart"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all("mart" in p["last_name"].lower() for p in data))

    def test_patient_filter_date(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"date_naissance": "1980-05-20"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(p["birth_date"] == "1980-05-20" for p in data))

    def test_medication_list(self):
        url = reverse("medication-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 2)

    def test_medication_filter_status(self):
        url = reverse("medication-list")
        r = self.client.get(url, {"status": "actif"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(m["status"] == "actif" for m in data))


class PrescriptionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.patient1 = Patient.objects.create(last_name="Martin", first_name="Jeanne", birth_date="1992-03-10")
        self.patient2 = Patient.objects.create(last_name="Durand", first_name="Jean", birth_date="1980-05-20")
        self.med1 = Medication.objects.create(code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF)
        self.med2 = Medication.objects.create(code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_ACTIF)

        self.presc1 = Prescription.objects.create(
            patient=self.patient1, medication=self.med1,
            start_date="2025-01-01", end_date="2025-01-31",
            status=Prescription.STATUS_VALIDE, comment="Matin et soir",
        )
        self.presc2 = Prescription.objects.create(
            patient=self.patient2, medication=self.med2,
            start_date="2025-03-01", end_date="2025-06-30",
            status=Prescription.STATUS_EN_ATTENTE,
        )
        self.presc3 = Prescription.objects.create(
            patient=self.patient1, medication=self.med2,
            start_date="2025-02-01", end_date="2025-02-28",
            status=Prescription.STATUS_SUPPR,
        )

    def test_prescription_list(self):
        url = reverse("prescription-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 3)

    def test_filter_by_patient(self):
        url = reverse("prescription-list")
        r = self.client.get(url, {"patient": self.patient1.pk})
        data = r.json()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(data), 2)
        self.assertTrue(all(p["patient"] == self.patient1.pk for p in data))

    def test_filter_by_medication(self):
        url = reverse("prescription-list")
        r = self.client.get(url, {"medication": self.med1.pk})
        data = r.json()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["medication"], self.med1.pk)

    def test_filter_by_status(self):
        url = reverse("prescription-list")
        r = self.client.get(url, {"status": "valide"})
        data = r.json()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertTrue(all(p["status"] == "valide" for p in data))

    def test_filter_by_start_date_gte(self):
        url = reverse("prescription-list")
        r = self.client.get(url, {"start_date_gte": "2025-02-01"})
        data = r.json()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(data), 2)

    def test_filter_by_end_date_lte(self):
        url = reverse("prescription-list")
        r = self.client.get(url, {"end_date_lte": "2025-02-28"})
        data = r.json()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(data), 2)

    def test_filter_combined(self):
        url = reverse("prescription-list")
        r = self.client.get(url, {"patient": self.patient1.pk, "status": "suppr"})
        data = r.json()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["status"], "suppr")

    def test_create_prescription_valid(self):
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.pk,
            "medication": self.med1.pk,
            "start_date": "2025-06-01",
            "end_date": "2025-06-30",
            "status": "valide",
            "comment": "Test",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Prescription.objects.count(), 4)

    def test_create_prescription_invalid_dates(self):
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.pk,
            "medication": self.med1.pk,
            "start_date": "2025-06-30",
            "end_date": "2025-06-01",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("end_date", r.json())

    def test_create_prescription_missing_patient(self):
        url = reverse("prescription-list")
        payload = {
            "medication": self.med1.pk,
            "start_date": "2025-06-01",
            "end_date": "2025-06-30",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, 400)

    def test_create_prescription_nonexistent_patient(self):
        url = reverse("prescription-list")
        payload = {
            "patient": 99999,
            "medication": self.med1.pk,
            "start_date": "2025-06-01",
            "end_date": "2025-06-30",
            "status": "valide",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, 400)

    def test_update_prescription_partial(self):
        url = reverse("prescription-detail", args=[self.presc1.pk])
        r = self.client.patch(url, {"status": "suppr"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.presc1.refresh_from_db()
        self.assertEqual(self.presc1.status, "suppr")

    def test_update_prescription_full(self):
        url = reverse("prescription-detail", args=[self.presc1.pk])
        payload = {
            "patient": self.patient2.pk,
            "medication": self.med2.pk,
            "start_date": "2025-07-01",
            "end_date": "2025-07-31",
            "status": "en_attente",
            "comment": "Modifié",
        }
        r = self.client.put(url, payload, format="json")
        self.assertEqual(r.status_code, 200)
        self.presc1.refresh_from_db()
        self.assertEqual(self.presc1.patient, self.patient2)
        self.assertEqual(self.presc1.comment, "Modifié")

    def test_update_prescription_invalid_dates(self):
        url = reverse("prescription-detail", args=[self.presc1.pk])
        r = self.client.patch(url, {"end_date": "2024-01-01"}, format="json")
        self.assertEqual(r.status_code, 400)
