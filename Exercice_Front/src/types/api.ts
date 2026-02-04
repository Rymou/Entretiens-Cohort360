export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  birth_date: string | null;
}

export interface Medication {
  id: number;
  code: string;
  label: string;
  status: "actif" | "suppr";
}

export type PrescriptionStatus = "valide" | "en_attente" | "suppr";

export interface Prescription {
  id: number;
  patient: number;
  medication: number;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment: string;
}

export interface PrescriptionFilters {
  patient?: number;
  medication?: number;
  status?: PrescriptionStatus;
  start_date_gte?: string;
  start_date_lte?: string;
  end_date_gte?: string;
  end_date_lte?: string;
}

export interface PrescriptionPayload {
  patient: number;
  medication: number;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment?: string;
}
