import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionFilters,
  PrescriptionPayload,
} from "@/types/api";
import { API_BASE } from "@/config";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw { status: res.status, body };
  }
  return res.json();
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ""
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export function getPatients(): Promise<Patient[]> {
  return fetchJson<Patient[]>(`${API_BASE}/Patient`);
}

export function getMedications(): Promise<Medication[]> {
  return fetchJson<Medication[]>(`${API_BASE}/Medication`);
}

export function getPrescriptions(filters?: PrescriptionFilters): Promise<Prescription[]> {
  const qs = filters ? toQueryString(filters as Record<string, string | number | undefined>) : "";
  return fetchJson<Prescription[]>(`${API_BASE}/Prescription${qs}`);
}

export function createPrescription(payload: PrescriptionPayload): Promise<Prescription> {
  return fetchJson<Prescription>(`${API_BASE}/Prescription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updatePrescription(
  id: number,
  payload: Partial<PrescriptionPayload>,
): Promise<Prescription> {
  return fetchJson<Prescription>(`${API_BASE}/Prescription/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
