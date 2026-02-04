"use client";

import { useCallback, useState } from "react";
import { usePrescriptionData } from "@/hooks/usePrescriptionData";
import PrescriptionTable from "@/components/PrescriptionTable";
import PrescriptionForm from "@/components/PrescriptionForm";
import Modal from "@/components/ui/Modal";
import Snackbar, { type SnackbarType } from "@/components/ui/Snackbar";
import styles from "./page.module.css";

interface SnackbarState {
  message: string;
  type: SnackbarType;
}

export default function Home() {
  const { prescriptions, patients, medications, patientsMap, medicationsMap, loading, error, reload } =
    usePrescriptionData();
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

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

      {loading && <p>Chargement...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <PrescriptionTable
          prescriptions={prescriptions}
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
