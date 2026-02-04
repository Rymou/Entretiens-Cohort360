"use client";

import { useState } from "react";
import type {
  Patient,
  Medication,
  PrescriptionFilters,
  PrescriptionStatus,
} from "@/types/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import styles from "./PrescriptionFiltersBar.module.css";

interface Props {
  patients: Patient[];
  medications: Medication[];
  search: string;
  onSearchChange: (value: string) => void;
  filters: PrescriptionFilters;
  onFiltersChange: (filters: PrescriptionFilters) => void;
}

const STATUS_OPTIONS = [
  { value: "valide", label: "Valide" },
  { value: "en_attente", label: "En attente" },
  { value: "suppr", label: "Supprimée" },
];

export default function PrescriptionFiltersBar({
  patients,
  medications,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update(patch: Partial<PrescriptionFilters>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function reset() {
    onFiltersChange({});
  }

  const hasAdvancedFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className={styles.bar}>
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par patient, médicament, date, statut, commentaire..."
        />
        <button
          type="button"
          className={`${styles.advancedToggle} ${
            showAdvanced ? styles.active : ""
          }`}
          onClick={() => setShowAdvanced((v) => !v)}
        >
          Recherche avancée
        </button>
      </div>

      {showAdvanced && (
        <div className={styles.advanced}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>Patient</span>
              <SearchableSelect
                options={patients.map((p) => ({
                  value: String(p.id),
                  label: `${p.last_name} ${p.first_name}`,
                }))}
                value={filters.patient ? String(filters.patient) : ""}
                onChange={(v) => update({ patient: v ? Number(v) : undefined })}
                placeholder="Tous les patients"
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Médicament</span>
              <SearchableSelect
                options={medications.map((m) => ({
                  value: String(m.id),
                  label: `${m.label} (${m.code})`,
                }))}
                value={filters.medication ? String(filters.medication) : ""}
                onChange={(v) =>
                  update({ medication: v ? Number(v) : undefined })
                }
                placeholder="Tous les médicaments"
              />
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Statut</span>
              <select
                value={filters.status ?? ""}
                onChange={(e) =>
                  update({
                    status: (e.target.value || undefined) as
                      | PrescriptionStatus
                      | undefined,
                  })
                }
              >
                <option value="">Tous</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date début (du)</span>
              <input
                type="date"
                value={filters.start_date_gte ?? ""}
                onChange={(e) =>
                  update({ start_date_gte: e.target.value || undefined })
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date début (au)</span>
              <input
                type="date"
                value={filters.start_date_lte ?? ""}
                onChange={(e) =>
                  update({ start_date_lte: e.target.value || undefined })
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date fin (du)</span>
              <input
                type="date"
                value={filters.end_date_gte ?? ""}
                onChange={(e) =>
                  update({ end_date_gte: e.target.value || undefined })
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date fin (au)</span>
              <input
                type="date"
                value={filters.end_date_lte ?? ""}
                onChange={(e) =>
                  update({ end_date_lte: e.target.value || undefined })
                }
              />
            </label>
          </div>

          {hasAdvancedFilters && (
            <button className={styles.reset} type="button" onClick={reset}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
