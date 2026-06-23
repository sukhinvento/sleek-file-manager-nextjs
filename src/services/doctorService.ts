// Doctor Service — manages hospital doctors, their specialisations, schedules, and availability
import apiClient from '@/lib/api-client';

export type DoctorStatus = 'Active' | 'On Leave' | 'Inactive';
export type DoctorGender = 'Male' | 'Female' | 'Other';

export interface DoctorSchedule {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface Doctor {
  id: string;
  employeeId: string;
  name: string;
  gender: DoctorGender;
  dob: string;
  phone: string;
  email: string;
  department: string;
  specialisation: string;
  qualification: string[];
  experience: number; // years
  status: DoctorStatus;
  schedule: DoctorSchedule[];
  consultationFee: number;
  opdSlots: number;      // max OPD patients per day
  activePatients: number;
  joinDate: string;
  registrationNo: string;
  bio: string;
  languages: string[];
  avatar?: string;
}

const STATUS_MAP: Record<string, DoctorStatus> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
};

const DAY_NORMALIZE: Record<string, DoctorSchedule['day']> = {
  mon: 'Mon', monday: 'Mon',
  tue: 'Tue', tuesday: 'Tue',
  wed: 'Wed', wednesday: 'Wed',
  thu: 'Thu', thursday: 'Thu',
  fri: 'Fri', friday: 'Fri',
  sat: 'Sat', saturday: 'Sat',
  sun: 'Sun', sunday: 'Sun',
};

function mapDoctor(raw: any): Doctor {
  const status = STATUS_MAP[String(raw.status || '').toLowerCase()] || 'Active';
  const schedule: DoctorSchedule[] = (raw.schedule || []).map((s: any) => ({
    day: DAY_NORMALIZE[String(s.day || '').toLowerCase()] ?? s.day,
    startTime: s.start_time || s.startTime || '',
    endTime: s.end_time || s.endTime || '',
  }));
  return {
    id: raw._id || raw.id || '',
    employeeId: raw.employee_id || '',
    name: raw.name || '',
    gender: (raw.gender as DoctorGender) || 'Male',
    dob: raw.dob || '',
    phone: raw.phone || '',
    email: raw.email || '',
    department: raw.department || '',
    specialisation: raw.specialisation || '',
    qualification: Array.isArray(raw.qualification) ? raw.qualification : [],
    experience: raw.experience_years ?? raw.experience ?? 0,
    status,
    schedule,
    consultationFee: raw.consultation_fee ?? raw.consultationFee ?? 0,
    opdSlots: raw.opd_slots_per_day ?? raw.opdSlots ?? 0,
    activePatients: raw.active_patient_count ?? raw.activePatients ?? 0,
    joinDate: raw.join_date || raw.joinDate || '',
    registrationNo: raw.registration_no || raw.registrationNo || '',
    bio: raw.bio || '',
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    avatar: raw.avatar,
  };
}

function toSnakeCase(doctor: Partial<Doctor>): Record<string, any> {
  const body: Record<string, any> = {};
  if (doctor.name !== undefined) body.name = doctor.name;
  if (doctor.gender !== undefined) body.gender = doctor.gender;
  if (doctor.dob !== undefined) body.dob = doctor.dob;
  if (doctor.phone !== undefined) body.phone = doctor.phone;
  if (doctor.email !== undefined) body.email = doctor.email;
  if (doctor.department !== undefined) body.department = doctor.department;
  if (doctor.specialisation !== undefined) body.specialisation = doctor.specialisation;
  if (doctor.qualification !== undefined) body.qualification = doctor.qualification;
  if (doctor.experience !== undefined) body.experience_years = doctor.experience;
  if (doctor.status !== undefined) {
    const reverse: Record<string, string> = { Active: 'active', 'On Leave': 'on_leave', Inactive: 'inactive' };
    body.status = reverse[doctor.status] || doctor.status.toLowerCase();
  }
  if (doctor.schedule !== undefined) {
    body.schedule = doctor.schedule.map(s => ({
      day: s.day,
      start_time: s.startTime,
      end_time: s.endTime,
    }));
  }
  if (doctor.consultationFee !== undefined) body.consultation_fee = doctor.consultationFee;
  if (doctor.opdSlots !== undefined) body.opd_slots_per_day = doctor.opdSlots;
  if (doctor.joinDate !== undefined) body.join_date = doctor.joinDate;
  if (doctor.registrationNo !== undefined) body.registration_no = doctor.registrationNo;
  if (doctor.bio !== undefined) body.bio = doctor.bio;
  if (doctor.languages !== undefined) body.languages = doctor.languages;
  if (doctor.employeeId !== undefined) body.employee_id = doctor.employeeId;
  return body;
}

export const fetchDoctors = async (page = 1, limit = 25): Promise<{ data: Doctor[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get('/doctors', { params: { page, limit } });
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return {
    data: raw.map(mapDoctor),
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? page,
    limit: response.data?.limit ?? limit,
  };
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  try {
    const response = await apiClient.get(`/doctors/${id}`);
    return mapDoctor(response.data);
  } catch {
    return null;
  }
};

export const addDoctor = async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
  const body = toSnakeCase(doctor);
  const response = await apiClient.post('/doctors', body);
  return mapDoctor(response.data);
};

export const updateDoctor = async (id: string, updates: Partial<Doctor>): Promise<Doctor> => {
  const body = toSnakeCase(updates);
  const response = await apiClient.patch(`/doctors/${id}`, body);
  return mapDoctor(response.data);
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await apiClient.delete(`/doctors/${id}`);
};

export const fetchDoctorStats = async () => {
  const response = await apiClient.get('/doctors/stats');
  return response.data;
};

export const searchDoctors = async (query: string): Promise<Doctor[]> => {
  const response = await apiClient.get('/doctors', { params: { search: query, limit: 50 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapDoctor);
};

