// Medication Service — catalog and prescriptions
import apiClient from '@/lib/api-client';

export interface Medication {
  id: string;
  drugCode: string;
  name: string;
  genericName: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops' | 'Inhaler' | 'Other';
  strength: string;
  price: number;
  stockQuantity: number;
  manufacturer: string;
  category: string;
  isActive: boolean;
}

export interface PatientMedication {
  id: string;
  patientId: string;
  patientName: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  instructions?: string;
  price: number;
  totalCost: number;
}

const FORM_MAP: Record<string, Medication['dosageForm']> = {
  tablet: 'Tablet', capsule: 'Capsule', syrup: 'Syrup', injection: 'Injection',
  cream: 'Cream', drops: 'Drops', inhaler: 'Inhaler', other: 'Other',
};

function mapMedication(raw: any): Medication {
  return {
    id: raw._id || raw.id || '',
    drugCode: raw.drug_code || '',
    name: raw.name || '',
    genericName: raw.generic_name || '',
    dosageForm: FORM_MAP[String(raw.dosage_form || '').toLowerCase()] || 'Other',
    strength: raw.strength || '',
    price: raw.price_per_unit ?? 0,
    stockQuantity: raw.stock_quantity ?? 0,
    manufacturer: raw.manufacturer || '',
    category: raw.category || '',
    isActive: raw.is_active ?? true,
  };
}

const PRESCRIPTION_STATUS: Record<string, PatientMedication['status']> = {
  active: 'Active', completed: 'Completed', discontinued: 'Discontinued',
};

function mapPrescription(raw: any): PatientMedication {
  const status = PRESCRIPTION_STATUS[String(raw.status || '').toLowerCase()] || 'Active';
  return {
    id: raw._id || raw.id || '',
    patientId: String(raw.patient_id?._id || raw.patient_id || ''),
    patientName: raw.patient_name || '',
    medicationId: String(raw.medication_id?._id || raw.medication_id || ''),
    medicationName: raw.medication_name || raw.medication_id?.name || '',
    dosage: raw.dosage || '',
    frequency: raw.frequency || '',
    duration: raw.duration || '',
    quantity: raw.quantity ?? 0,
    startDate: raw.start_date ? raw.start_date.split('T')[0] : '',
    endDate: raw.end_date ? raw.end_date.split('T')[0] : '',
    prescribedBy: raw.prescribed_by || '',
    status,
    instructions: raw.instructions,
    price: raw.price ?? 0,
    totalCost: raw.total_cost ?? 0,
  };
}

/**
 * Fetch medication catalog
 * GET /medications/catalog
 */
export const fetchMedications = async (): Promise<Medication[]> => {
  const response = await apiClient.get('/medications/catalog', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapMedication);
};

/**
 * Search medications
 * GET /medications/catalog?search=X
 */
export const searchMedications = async (query: string): Promise<Medication[]> => {
  const response = await apiClient.get('/medications/catalog', { params: { search: query, limit: 100 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapMedication);
};

/**
 * Fetch prescriptions for a patient
 * GET /medications/prescriptions?patient_id=X
 */
export const fetchPatientPrescriptions = async (patientId: string): Promise<PatientMedication[]> => {
  const response = await apiClient.get('/medications/prescriptions', { params: { patient_id: patientId, limit: 100 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapPrescription);
};
