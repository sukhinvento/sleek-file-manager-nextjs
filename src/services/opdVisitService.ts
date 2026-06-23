import apiClient from '@/lib/api-client';

export interface OpdVisit {
  id: string;
  visitNumber: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  visitDate: string;
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
  chiefComplaint: string;
  consultationFee: number;
  paymentMode: string;
  vitals?: { bp?: string; pulse?: number; temperature?: number; weight?: number; spo2?: number };
  consultationNotes?: string;
  prescriptionNotes?: string;
  followUpDate?: string;
  queuePosition: number;
  createdAt: string;
}

export interface OpdStats {
  today: { total: number; waiting: number; inConsultation: number; completed: number; cancelled: number };
  byDepartment: { department: string; total: number; waiting: number }[];
}

function mapVisit(raw: any): OpdVisit {
  return {
    id: raw._id || raw.id || '',
    visitNumber: raw.visit_number || '',
    tokenNumber: raw.token_number || '',
    patientId: raw.patient_id || '',
    patientName: raw.patient_name || '',
    patientPhone: raw.patient_phone || '',
    doctorId: raw.doctor_id || '',
    doctorName: raw.doctor_name || '',
    department: raw.department || '',
    visitDate: raw.visit_date || raw.createdAt || '',
    status: raw.status || 'waiting',
    chiefComplaint: raw.chief_complaint || '',
    consultationFee: raw.consultation_fee ?? 0,
    paymentMode: raw.payment_mode || 'cash',
    vitals: raw.vitals,
    consultationNotes: raw.consultation_notes || '',
    prescriptionNotes: raw.prescription_notes || '',
    followUpDate: raw.follow_up_date || '',
    queuePosition: raw.queue_position ?? 0,
    createdAt: raw.createdAt || '',
  };
}

export const createOpdVisit = async (data: {
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  department: string;
  chief_complaint: string;
  consultation_fee?: number;
  payment_mode?: string;
}): Promise<OpdVisit> => {
  const response = await apiClient.post('/opd-visits', data);
  return mapVisit(response.data);
};

export const fetchTodayQueue = async (department?: string): Promise<OpdVisit[]> => {
  const params: Record<string, string> = {};
  if (department) params.department = department;
  const response = await apiClient.get('/opd-visits/today', { params });
  const data = Array.isArray(response.data) ? response.data : [];
  return data.map(mapVisit);
};

export const fetchOpdStats = async (): Promise<OpdStats> => {
  const response = await apiClient.get('/opd-visits/stats');
  return response.data;
};

export const updateOpdVisitStatus = async (id: string, status: string): Promise<OpdVisit> => {
  const response = await apiClient.patch(`/opd-visits/${id}/status`, { status });
  return mapVisit(response.data);
};

export const updateOpdVisit = async (id: string, data: Record<string, any>): Promise<OpdVisit> => {
  const response = await apiClient.patch(`/opd-visits/${id}`, data);
  return mapVisit(response.data);
};

export const fetchOpdVisits = async (params?: Record<string, string>): Promise<{ data: OpdVisit[]; total: number }> => {
  const response = await apiClient.get('/opd-visits', { params });
  const raw = response.data;
  return {
    data: (raw.data || []).map(mapVisit),
    total: raw.total || 0,
  };
};
