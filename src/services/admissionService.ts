// Admission Service — manages patient hospital admissions
import apiClient from '@/lib/api-client';

export type AdmissionType = 'planned' | 'emergency' | 'transfer' | 'day_care';
export type AdmissionStatus = 'active' | 'discharged' | 'transferred';
export type PaymentMode = 'cash' | 'insurance' | 'card' | 'corporate' | 'government';

export interface Admission {
  id: string;
  admissionNumber: string;
  patientId: string;
  roomId: string;
  doctorId: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  admissionType: AdmissionType;
  status: AdmissionStatus;
  notes?: string;
  paymentMode?: PaymentMode;
  insuranceProvider?: string;
  insurancePolicyNo?: string;
  corporateAccount?: string;
  dischargeSummary?: string;
}

export interface CreateAdmissionPayload {
  patientId: string;
  roomId: string;
  doctorId: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  admissionType: AdmissionType;
  notes?: string;
  paymentMode?: PaymentMode;
  insuranceProvider?: string;
  insurancePolicyNo?: string;
  corporateAccount?: string;
}

function mapAdmission(raw: any): Admission {
  return {
    id: raw._id || raw.id || '',
    admissionNumber: raw.admission_number || '',
    patientId: String(raw.patient_id?._id || raw.patient_id || ''),
    roomId: String(raw.room_id?._id || raw.room_id || ''),
    doctorId: String(raw.doctor_id?._id || raw.doctor_id || ''),
    admissionDate: raw.admission_date ? raw.admission_date.split('T')[0] : '',
    expectedDischargeDate: raw.expected_discharge_date ? raw.expected_discharge_date.split('T')[0] : undefined,
    actualDischargeDate: raw.actual_discharge_date ? raw.actual_discharge_date.split('T')[0] : undefined,
    admissionType: (raw.admission_type as AdmissionType) || 'planned',
    status: (raw.status as AdmissionStatus) || 'active',
    notes: raw.notes,
    paymentMode: raw.payment_mode,
    insuranceProvider: raw.insurance_provider,
    insurancePolicyNo: raw.insurance_policy_no,
    corporateAccount: raw.corporate_account,
    dischargeSummary: raw.discharge_summary,
  };
}

/**
 * Create a new admission
 * POST /admissions
 */
export const createAdmission = async (payload: CreateAdmissionPayload): Promise<Admission> => {
  const body = {
    patient_id: payload.patientId,
    room_id: payload.roomId,
    doctor_id: payload.doctorId,
    admission_date: payload.admissionDate,
    expected_discharge_date: payload.expectedDischargeDate,
    admission_type: payload.admissionType,
    notes: payload.notes,
    payment_mode: payload.paymentMode,
    insurance_provider: payload.insuranceProvider,
    insurance_policy_no: payload.insurancePolicyNo,
    corporate_account: payload.corporateAccount,
  };
  const response = await apiClient.post('/admissions', body);
  return mapAdmission(response.data);
};

/**
 * Fetch all active admissions
 * GET /admissions?status=active
 */
export const fetchActiveAdmissions = async (): Promise<Admission[]> => {
  const response = await apiClient.get('/admissions', { params: { status: 'active', limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapAdmission);
};

/**
 * Fetch a single admission by ID
 * GET /admissions/:id
 */
export const fetchAdmissionById = async (id: string): Promise<Admission | null> => {
  try {
    const response = await apiClient.get(`/admissions/${id}`);
    return mapAdmission(response.data);
  } catch {
    return null;
  }
};

/**
 * Get admissions for a patient
 * GET /admissions?patient_id=X
 */
export const fetchAdmissionsByPatient = async (patientId: string): Promise<Admission[]> => {
  const response = await apiClient.get('/admissions', { params: { patient_id: patientId, limit: 50 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapAdmission);
};

/**
 * Discharge a patient
 * PATCH /admissions/:id
 */
export const dischargePatient = async (
  id: string,
  dischargeSummary: string,
  actualDischargeDate?: string,
): Promise<Admission | null> => {
  try {
    const body: any = {
      status: 'discharged',
      discharge_summary: dischargeSummary,
    };
    if (actualDischargeDate) body.actual_discharge_date = actualDischargeDate;
    const response = await apiClient.patch(`/admissions/${id}`, body);
    return mapAdmission(response.data);
  } catch {
    return null;
  }
};
