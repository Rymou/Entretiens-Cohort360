"use client";

import type { Prescription, Patient, Medication } from "@/types/api";
import styles from "./PrescriptionTable.module.css";

interface Props {
  prescriptions: Prescription[];
  patientsMap: Map<number, Patient>;
  medicationsMap: Map<number, Medication>;
}

const STATUS_LABELS: Record<string, string> = {
  valide: "Valide",
  en_attente: "En attente",
  suppr: "Supprimée",
};

export default function PrescriptionTable({ prescriptions, patientsMap, medicationsMap }: Props) {
  if (prescriptions.length === 0) {
    return <p className={styles.empty}>Aucune prescription trouvée.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Médicament</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Statut</th>
            <th>Commentaire</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((p) => {
            const patient = patientsMap.get(p.patient);
            const medication = medicationsMap.get(p.medication);
            return (
              <tr key={p.id}>
                <td>{patient ? `${patient.last_name} ${patient.first_name}` : `#${p.patient}`}</td>
                <td>{medication ? medication.label : `#${p.medication}`}</td>
                <td>{p.start_date}</td>
                <td>{p.end_date}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`badge_${p.status}`]}`}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </td>
                <td>{p.comment || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
