import type { Clinic } from "@/lib/types";

const STORAGE_KEY = "route2carerx-clinic-detail";

export function saveClinicForDetail(clinic: Clinic): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(clinic));
  } catch {
    // ignore quota / private mode
  }
}

export function loadClinicForDetail(id: string): Clinic | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const clinic = JSON.parse(raw) as Clinic;
    return clinic.id === id ? clinic : null;
  } catch {
    return null;
  }
}
