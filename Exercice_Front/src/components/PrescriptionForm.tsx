"use client";

import { useState, type FormEvent } from "react";
import type { Patient, Medication, PrescriptionStatus } from "@/types/api";
import { createPrescription } from "@/services/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import styles from "./PrescriptionForm.module.css";

interface Props {
  patients: Patient[];
  medications: Medication[];
  onCreated: () => void;
  onError: () => void;
}

const STATUS_OPTIONS: { value: PrescriptionStatus; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Valide" },
  { value: "suppr", label: "Supprimée" },
];

export default function PrescriptionForm({ patients, medications, onCreated, onError }: Props) {
  const [patientId, setPatientId] = useState("");
  const [medicationId, setMedicationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PrescriptionStatus>("en_attente");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeMedications = medications.filter((m) => m.status === "actif");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createPrescription({
        patient: Number(patientId),
        medication: Number(medicationId),
        start_date: startDate,
        end_date: endDate,
        status,
        comment: comment || undefined,
      });
      setPatientId("");
      setMedicationId("");
      setStartDate("");
      setEndDate("");
      setStatus("en_attente");
      setComment("");
      onCreated();
    } catch {
      onError();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Nouvelle prescription</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.label}>Patient</span>
          <SearchableSelect
            options={patients.map((p) => ({
              value: String(p.id),
              label: `${p.last_name} ${p.first_name}`,
            }))}
            value={patientId}
            onChange={setPatientId}
            placeholder="Rechercher un patient..."
            required
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Médicament</span>
          <SearchableSelect
            options={activeMedications.map((m) => ({
              value: String(m.id),
              label: `${m.label} (${m.code})`,
            }))}
            value={medicationId}
            onChange={setMedicationId}
            placeholder="Rechercher un médicament..."
            required
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Date début</span>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Date fin</span>
          <input
            type="date"
            required
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Statut</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PrescriptionStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Commentaire</span>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optionnel"
          />
        </label>
      </div>

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "Création..." : "Créer la prescription"}
      </button>
    </form>
  );
}
