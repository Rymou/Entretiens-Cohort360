"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionFilters,
} from "@/types/api";
import { getPatients, getMedications, getPrescriptions } from "@/services/api";

interface PrescriptionData {
  prescriptions: Prescription[];
  patients: Patient[];
  medications: Medication[];
  patientsMap: Map<number, Patient>;
  medicationsMap: Map<number, Medication>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function usePrescriptionData(
  filters?: PrescriptionFilters
): PrescriptionData {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prescriptionsData, patientsData, medicationsData] =
        await Promise.all([
          getPrescriptions(filters),
          getPatients(),
          getMedications(),
        ]);
      setPrescriptions(prescriptionsData);
      setPatients(patientsData);
      setMedications(medicationsData);
    } catch {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    load();
  }, [load]);

  const patientsMap = new Map(patients.map((p) => [p.id, p]));
  const medicationsMap = new Map(medications.map((m) => [m.id, m]));

  return {
    prescriptions,
    patients,
    medications,
    patientsMap,
    medicationsMap,
    loading,
    error,
    reload: load,
  };
}
