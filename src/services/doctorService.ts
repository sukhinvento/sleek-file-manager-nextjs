// Doctor Service — manages hospital doctors, their specialisations, schedules, and availability

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

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let mockDoctors: Doctor[] = [
  {
    id: 'DOC001', employeeId: 'EMP1001', name: 'Dr. Sarah Johnson', gender: 'Female',
    dob: '1978-03-14', phone: '+91 98765 43210', email: 'sarah.johnson@hospital.com',
    department: 'Cardiology', specialisation: 'Interventional Cardiology',
    qualification: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)'],
    experience: 18, status: 'Active',
    schedule: [
      { day: 'Mon', startTime: '09:00', endTime: '17:00' },
      { day: 'Wed', startTime: '09:00', endTime: '17:00' },
      { day: 'Fri', startTime: '09:00', endTime: '13:00' },
    ],
    consultationFee: 1200, opdSlots: 20, activePatients: 14,
    joinDate: '2008-07-01', registrationNo: 'MCI-KA-12345',
    bio: 'Dr. Johnson is a leading interventional cardiologist with expertise in complex coronary interventions and heart failure management.',
    languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    id: 'DOC002', employeeId: 'EMP1002', name: 'Dr. Michael Brown', gender: 'Male',
    dob: '1975-08-22', phone: '+91 98765 43211', email: 'michael.brown@hospital.com',
    department: 'Orthopaedics', specialisation: 'Joint Replacement & Sports Medicine',
    qualification: ['MBBS', 'MS (Orthopaedics)', 'Fellowship (Joint Replacement)'],
    experience: 21, status: 'Active',
    schedule: [
      { day: 'Mon', startTime: '08:00', endTime: '16:00' },
      { day: 'Tue', startTime: '08:00', endTime: '16:00' },
      { day: 'Thu', startTime: '08:00', endTime: '16:00' },
      { day: 'Sat', startTime: '09:00', endTime: '13:00' },
    ],
    consultationFee: 1000, opdSlots: 25, activePatients: 9,
    joinDate: '2005-01-15', registrationNo: 'MCI-KA-11234',
    bio: 'Specialist in total knee and hip replacement surgeries with over 2000 successful procedures.',
    languages: ['English', 'Hindi'],
  },
  {
    id: 'DOC003', employeeId: 'EMP1003', name: 'Dr. Lisa Anderson', gender: 'Female',
    dob: '1982-11-05', phone: '+91 98765 43212', email: 'lisa.anderson@hospital.com',
    department: 'Neurology', specialisation: 'Stroke & Epilepsy',
    qualification: ['MBBS', 'MD (Medicine)', 'DM (Neurology)'],
    experience: 14, status: 'On Leave',
    schedule: [
      { day: 'Tue', startTime: '10:00', endTime: '18:00' },
      { day: 'Thu', startTime: '10:00', endTime: '18:00' },
      { day: 'Fri', startTime: '10:00', endTime: '14:00' },
    ],
    consultationFee: 1500, opdSlots: 15, activePatients: 0,
    joinDate: '2012-03-20', registrationNo: 'MCI-KA-15678',
    bio: 'Expert in stroke management and complex epilepsy treatment with focus on minimising long-term disability.',
    languages: ['English', 'Tamil'],
  },
  {
    id: 'DOC004', employeeId: 'EMP1004', name: 'Dr. James Wilson', gender: 'Male',
    dob: '1970-06-18', phone: '+91 98765 43213', email: 'james.wilson@hospital.com',
    department: 'General Medicine', specialisation: 'Internal Medicine & Diabetes',
    qualification: ['MBBS', 'MD (General Medicine)'],
    experience: 26, status: 'Active',
    schedule: [
      { day: 'Mon', startTime: '09:00', endTime: '17:00' },
      { day: 'Tue', startTime: '09:00', endTime: '17:00' },
      { day: 'Wed', startTime: '09:00', endTime: '17:00' },
      { day: 'Thu', startTime: '09:00', endTime: '17:00' },
      { day: 'Fri', startTime: '09:00', endTime: '17:00' },
    ],
    consultationFee: 800, opdSlots: 30, activePatients: 22,
    joinDate: '2001-09-10', registrationNo: 'MCI-KA-10001',
    bio: 'Senior physician with extensive experience in managing chronic diseases including diabetes, hypertension, and thyroid disorders.',
    languages: ['English', 'Hindi', 'Bengali'],
  },
  {
    id: 'DOC005', employeeId: 'EMP1005', name: 'Dr. Emma Thompson', gender: 'Female',
    dob: '1985-02-28', phone: '+91 98765 43214', email: 'emma.thompson@hospital.com',
    department: 'Paediatrics', specialisation: 'Neonatology & Paediatric Critical Care',
    qualification: ['MBBS', 'MD (Paediatrics)', 'Fellowship (Neonatology)'],
    experience: 11, status: 'Active',
    schedule: [
      { day: 'Mon', startTime: '08:30', endTime: '16:30' },
      { day: 'Wed', startTime: '08:30', endTime: '16:30' },
      { day: 'Fri', startTime: '08:30', endTime: '13:00' },
      { day: 'Sat', startTime: '09:00', endTime: '12:00' },
    ],
    consultationFee: 900, opdSlots: 20, activePatients: 7,
    joinDate: '2015-06-01', registrationNo: 'MCI-KA-18901',
    bio: 'Specialises in newborn intensive care and paediatric emergencies.',
    languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    id: 'DOC006', employeeId: 'EMP1006', name: 'Dr. Raj Patel', gender: 'Male',
    dob: '1979-09-12', phone: '+91 98765 43215', email: 'raj.patel@hospital.com',
    department: 'Oncology', specialisation: 'Medical Oncology & Haematology',
    qualification: ['MBBS', 'MD (Medicine)', 'DM (Medical Oncology)'],
    experience: 17, status: 'Active',
    schedule: [
      { day: 'Tue', startTime: '09:00', endTime: '17:00' },
      { day: 'Thu', startTime: '09:00', endTime: '17:00' },
      { day: 'Sat', startTime: '09:00', endTime: '13:00' },
    ],
    consultationFee: 2000, opdSlots: 12, activePatients: 18,
    joinDate: '2009-11-15', registrationNo: 'MCI-KA-14567',
    bio: 'Experienced oncologist specialising in breast, lung, and haematological cancers with a focus on personalised therapy.',
    languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    id: 'DOC007', employeeId: 'EMP1007', name: 'Dr. Priya Sharma', gender: 'Female',
    dob: '1988-04-07', phone: '+91 98765 43216', email: 'priya.sharma@hospital.com',
    department: 'Emergency', specialisation: 'Emergency Medicine & Trauma',
    qualification: ['MBBS', 'MD (Emergency Medicine)'],
    experience: 8, status: 'Active',
    schedule: [
      { day: 'Mon', startTime: '20:00', endTime: '08:00' },
      { day: 'Wed', startTime: '20:00', endTime: '08:00' },
      { day: 'Fri', startTime: '20:00', endTime: '08:00' },
    ],
    consultationFee: 600, opdSlots: 0, activePatients: 5,
    joinDate: '2018-02-28', registrationNo: 'MCI-KA-22345',
    bio: 'Dedicated emergency physician trained in ATLS and rapid trauma assessment.',
    languages: ['English', 'Hindi', 'Punjabi'],
  },
  {
    id: 'DOC008', employeeId: 'EMP1008', name: 'Dr. Arun Kumar', gender: 'Male',
    dob: '1983-12-01', phone: '+91 98765 43217', email: 'arun.kumar@hospital.com',
    department: 'Radiology', specialisation: 'Diagnostic & Interventional Radiology',
    qualification: ['MBBS', 'MD (Radiology)', 'Fellowship (Interventional Radiology)'],
    experience: 13, status: 'Inactive',
    schedule: [],
    consultationFee: 800, opdSlots: 0, activePatients: 0,
    joinDate: '2013-05-10', registrationNo: 'MCI-KA-17890',
    bio: 'Expert in CT/MRI-guided interventional procedures.',
    languages: ['English', 'Hindi', 'Telugu'],
  },
];

export const fetchDoctors = async (): Promise<Doctor[]> => {
  await delay(300);
  return [...mockDoctors];
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  await delay(200);
  return mockDoctors.find(d => d.id === id) ?? null;
};

export const addDoctor = async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
  await delay(400);
  const newDoc: Doctor = {
    ...doctor,
    id: `DOC${String(mockDoctors.length + 1).padStart(3, '0')}`,
  };
  mockDoctors.push(newDoc);
  return { ...newDoc };
};

export const updateDoctor = async (id: string, updates: Partial<Doctor>): Promise<Doctor> => {
  await delay(350);
  const idx = mockDoctors.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Doctor not found');
  mockDoctors[idx] = { ...mockDoctors[idx], ...updates };
  return { ...mockDoctors[idx] };
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await delay(300);
  mockDoctors = mockDoctors.filter(d => d.id !== id);
};

export const fetchDoctorStats = async () => {
  await delay(200);
  return {
    total: mockDoctors.length,
    active: mockDoctors.filter(d => d.status === 'Active').length,
    onLeave: mockDoctors.filter(d => d.status === 'On Leave').length,
    inactive: mockDoctors.filter(d => d.status === 'Inactive').length,
    departments: [...new Set(mockDoctors.map(d => d.department))].length,
    totalActivePatients: mockDoctors.reduce((s, d) => s + d.activePatients, 0),
  };
};
