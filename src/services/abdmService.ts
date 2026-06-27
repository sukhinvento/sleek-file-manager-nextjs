/**
 * ABDM Service — Ayushman Bharat Digital Mission
 * All API calls are mocked for development/demo.
 * In production, these would proxy through the backend to the ABDM sandbox/production API.
 *
 * Mock OTP: 123456
 * Mock Aadhaar: any 12-digit number
 * Mock ABHA format: XX-XXXX-XXXX-XXXX
 */

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AbhaProfile {
  abhaNumber: string;     // "43-1234-5678-1234"
  abhaAddress: string;    // "firstname.lastname@abdm"
  name: string;
  gender: string;
  dob: string;
  mobile: string;         // masked: "*****12345"
  stateCode: string;
  districtCode: string;
  pinCode: string;
  linkedAt?: string;      // ISO timestamp when linked to this patient
  patientId?: string;
}

export interface AbdmOtpResponse {
  txnId: string;
  maskedMobile: string;   // "*****12345"
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function mockAbhaNumber(): string {
  const p1 = String(Math.floor(10  + Math.random() * 89));
  const p2 = String(Math.floor(1000 + Math.random() * 8999));
  const p3 = String(Math.floor(1000 + Math.random() * 8999));
  const p4 = String(Math.floor(1000 + Math.random() * 8999));
  return `${p1}-${p2}-${p3}-${p4}`;
}

function abhaAddress(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + '@abdm';
}

const MOCK_OTP = '123456';

// ── API Mocks ──────────────────────────────────────────────────────────────────

/**
 * Step 1 of ABHA creation: send OTP to Aadhaar-linked mobile.
 * Real API: POST /v1/registration/aadhaar/generateOtp
 */
export async function initiateAbhaCreation(
  aadhaarNumber: string
): Promise<AbdmOtpResponse> {
  await delay(1400);
  if (!/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ''))) {
    throw new Error('Aadhaar number must be exactly 12 digits.');
  }
  const last4 = aadhaarNumber.slice(-4);
  return {
    txnId: `TXN-ABDM-${Date.now()}`,
    maskedMobile: `*****${last4}`,
  };
}

/**
 * Step 2 of ABHA creation: verify OTP and receive ABHA.
 * Real API: POST /v1/registration/aadhaar/verifyOTP
 */
export async function createAbha(
  txnId: string,
  otp: string,
  patientName: string
): Promise<AbhaProfile> {
  await delay(1800);
  if (otp !== MOCK_OTP) {
    throw new Error(`Incorrect OTP. Use ${MOCK_OTP} for testing.`);
  }
  if (!txnId.startsWith('TXN-')) {
    throw new Error('Invalid transaction. Please restart the flow.');
  }
  return {
    abhaNumber:   mockAbhaNumber(),
    abhaAddress:  abhaAddress(patientName),
    name:         patientName,
    gender:       'M',
    dob:          '1990-01-01',
    mobile:       '*****12345',
    stateCode:    '27',
    districtCode: '001',
    pinCode:      '400001',
    linkedAt:     new Date().toISOString(),
  };
}

/**
 * Verify an existing ABHA number or address.
 * Real API: GET /v1/search/searchByHealthId
 */
export async function verifyAbha(abhaInput: string): Promise<AbhaProfile> {
  await delay(1100);
  const numberPattern = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  const addressPattern = /^[a-z0-9._]+@abdm$/i;
  if (!numberPattern.test(abhaInput) && !addressPattern.test(abhaInput)) {
    throw new Error('Enter a valid ABHA number (XX-XXXX-XXXX-XXXX) or address (name@abdm).');
  }
  const isNumber = numberPattern.test(abhaInput);
  return {
    abhaNumber:   isNumber ? abhaInput : mockAbhaNumber(),
    abhaAddress:  isNumber ? `patient@abdm` : abhaInput,
    name:         'Verified Patient',
    gender:       'F',
    dob:          '1985-05-15',
    mobile:       '*****67890',
    stateCode:    '27',
    districtCode: '001',
    pinCode:      '400001',
    linkedAt:     new Date().toISOString(),
  };
}

/**
 * Send OTP to verify patient's ABHA before linking.
 * Real API: POST /v1/patients/profile/share/verify
 */
export async function initiateAbhaLink(abhaNumber: string): Promise<AbdmOtpResponse> {
  await delay(900);
  return {
    txnId:        `TXN-LINK-${Date.now()}`,
    maskedMobile: '*****67890',
  };
}

/**
 * Confirm OTP and link ABHA to patient.
 * Real API: POST /v1/patients/profile/link/confirm
 */
export async function confirmAbhaLink(
  txnId: string,
  otp: string
): Promise<boolean> {
  await delay(1000);
  if (otp !== MOCK_OTP) throw new Error(`Incorrect OTP. Use ${MOCK_OTP} for testing.`);
  return true;
}

/**
 * Push health record to ABHA after discharge / OPD visit.
 * Real API: POST /v0.5/health-information/cm/request
 */
export async function pushHealthRecord(
  abhaNumber: string,
  recordType: 'OPDischargeRecord' | 'DischargeSummary' | 'DiagnosticReport' | 'Prescription',
  patientId: string
): Promise<string> {
  await delay(1200);
  return `ABDM-LINK-${Date.now()}`;
}

// ── Local Storage (mock persistence) ──────────────────────────────────────────

const STORAGE_KEY = (patientId: string) => `medsystem_abha_${patientId}`;

export function saveAbhaToPatient(patientId: string, profile: AbhaProfile): void {
  localStorage.setItem(STORAGE_KEY(patientId), JSON.stringify({ ...profile, patientId }));
}

export function getAbhaForPatient(patientId: string): AbhaProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(patientId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function removeAbhaFromPatient(patientId: string): void {
  localStorage.removeItem(STORAGE_KEY(patientId));
}

/** Format ABHA number for display (adds dashes if missing) */
export function formatAbhaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 14) {
    return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6,10)}-${digits.slice(10,14)}`;
  }
  return raw;
}
