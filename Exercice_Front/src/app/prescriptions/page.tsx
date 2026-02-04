"use client";

import { usePrescriptionData } from "@/hooks/usePrescriptionData";
import PrescriptionTable from "@/components/PrescriptionTable";
import styles from "./page.module.css";

export default function Home() {
  const { prescriptions, patientsMap, medicationsMap, loading, error } =
    usePrescriptionData();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Prescriptions</h1>

      {loading && <p>Chargement...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <PrescriptionTable
          prescriptions={prescriptions}
          patientsMap={patientsMap}
          medicationsMap={medicationsMap}
        />
      )}
    </main>
  );
}
