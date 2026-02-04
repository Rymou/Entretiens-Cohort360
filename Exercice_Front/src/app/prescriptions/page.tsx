"use client";

import { useCallback, useMemo, useState } from "react";
import type { PrescriptionFilters } from "@/types/api";
import { usePrescriptionData } from "@/hooks/usePrescriptionData";
import PrescriptionTable from "@/components/prescription/PrescriptionTable";
import PrescriptionForm from "@/components/prescription/PrescriptionForm";
import PrescriptionFiltersBar from "@/components/prescription/PrescriptionFiltersBar";
import Modal from "@/components/ui/Modal";
import Snackbar, { type SnackbarType } from "@/components/ui/Snackbar";
import styles from "./page.module.css";

interface SnackbarState {
  message: string;
  type: SnackbarType;
}

const STATUS_LABELS: Record<string, string> = {
  valide: "valide",
  en_attente: "en attente",
  suppr: "supprimée",
};

export default function Home() {
  const [filters, setFilters] = useState<PrescriptionFilters>({});
  const [search, setSearch] = useState("");
  const { prescriptions, patients, medications, patientsMap, medicationsMap, loading, error, reload } =
    usePrescriptionData(filters);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return prescriptions;
    const term = search.toLowerCase();
    return prescriptions.filter((p) => {
      const patient = patientsMap.get(p.patient);
      const medication = medicationsMap.get(p.medication);
      const patientName = patient ? `${patient.last_name} ${patient.first_name}` : "";
      const medicationLabel = medication ? `${medication.label} ${medication.code}` : "";
      const statusLabel = STATUS_LABELS[p.status] ?? p.status;
      return (
        patientName.toLowerCase().includes(term) ||
        medicationLabel.toLowerCase().includes(term) ||
        statusLabel.toLowerCase().includes(term) ||
        p.comment.toLowerCase().includes(term) ||
        p.start_date.includes(term) ||
        p.end_date.includes(term)
      );
    });
  }, [prescriptions, search, patientsMap, medicationsMap]);

  function handleCreated() {
    setShowForm(false);
    reload();
    setSnackbar({ message: "Prescription créée avec succès.", type: "success" });
  }

  function handleError() {
    setSnackbar({ message: "Erreur lors de la création de la prescription.", type: "error" });
  }

  const closeSnackbar = useCallback(() => setSnackbar(null), []);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prescriptions</h1>
        {!loading && !error && (
          <button className={styles.createBtn} onClick={() => setShowForm(true)}>
            Créer une prescription
          </button>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <PrescriptionForm
          patients={patients}
          medications={medications}
          onCreated={handleCreated}
          onError={handleError}
        />
      </Modal>

      {patients.length > 0 && !error && (
        <PrescriptionFiltersBar
          patients={patients}
          medications={medications}
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {loading && <p>Chargement...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <PrescriptionTable
          prescriptions={filtered}
          patientsMap={patientsMap}
          medicationsMap={medicationsMap}
        />
      )}

      {snackbar && (
        <Snackbar message={snackbar.message} type={snackbar.type} onClose={closeSnackbar} />
      )}
    </main>
  );
}
