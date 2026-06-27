// Room Service - Handles hospital room management and assignments
import apiClient from '@/lib/api-client';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: 'General' | 'Private' | 'ICU' | 'Semi-Private' | 'Deluxe' | 'Suite';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  bedCapacity: number;
  occupiedBeds: number;
  dailyRate: number;
  amenities: string[];
  department: string;
}

export interface RoomAssignment {
  id: string;
  patientId: string;
  patientName: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate?: string;
  dailyRate: number;
  totalDays: number;
  totalCharges: number;
  status: 'Active' | 'Completed';
  assignedBy: string;
  bedNumber?: number;
}

const ROOM_TYPE_MAP: Record<string, Room['type']> = {
  general: 'General',
  private: 'Private',
  icu: 'ICU',
  semi_private: 'Semi-Private',
  deluxe: 'Deluxe',
  suite: 'Suite',
};

const ROOM_STATUS_MAP: Record<string, Room['status']> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  reserved: 'Reserved',
};

function mapRoom(raw: any): Room {
  const type = ROOM_TYPE_MAP[String(raw.type || '').toLowerCase()] || 'General';
  const status = ROOM_STATUS_MAP[String(raw.status || '').toLowerCase()] || 'Available';
  return {
    id: raw._id || raw.id || '',
    roomNumber: raw.room_number || raw.roomNumber || '',
    floor: raw.floor ?? 1,
    type,
    status,
    bedCapacity: raw.bed_capacity ?? raw.bedCapacity ?? 1,
    occupiedBeds: raw.occupied_beds ?? raw.occupiedBeds ?? 0,
    dailyRate: raw.daily_rate ?? raw.dailyRate ?? 0,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    department: raw.department || '',
  };
}

function mapAdmissionToAssignment(raw: any): RoomAssignment {
  const checkIn = raw.check_in_date || raw.checkInDate || raw.admission_date || '';
  const checkOut = raw.check_out_date || raw.checkOutDate || raw.discharge_date || undefined;
  let totalDays = raw.total_days ?? raw.totalDays ?? 0;
  if (!totalDays && checkIn) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = checkOut ? new Date(checkOut) : new Date();
    totalDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  const dailyRate = raw.daily_rate ?? raw.dailyRate ?? 0;
  return {
    id: raw._id || raw.id || '',
    patientId: raw.patient_id || raw.patientId || '',
    patientName: raw.patient_name || raw.patientName || '',
    roomId: raw.room_id || raw.roomId || '',
    roomNumber: raw.room_number || raw.roomNumber || '',
    roomType: raw.room_type || raw.roomType || '',
    checkInDate: checkIn,
    checkOutDate: checkOut,
    dailyRate,
    totalDays,
    totalCharges: totalDays * dailyRate,
    status: (raw.status === 'active' || raw.status === 'Active') ? 'Active' : 'Completed',
    assignedBy: raw.assigned_by || raw.assignedBy || '',
    bedNumber: raw.bed_number ?? raw.bedNumber,
  };
}

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get('/rooms', { params: { limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapRoom);
};

export const fetchAvailableRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get('/rooms/available');
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapRoom);
};

export const searchRooms = async (query: string): Promise<Room[]> => {
  const response = await apiClient.get('/rooms', { params: { search: query, limit: 200 } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapRoom);
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const response = await apiClient.get(`/rooms/${id}`);
    return mapRoom(response.data);
  } catch {
    return null;
  }
};

export const fetchPatientRoomAssignments = async (patientId: string): Promise<RoomAssignment[]> => {
  const response = await apiClient.get('/admissions', { params: { patient_id: patientId, status: 'active' } });
  const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return data.map(mapAdmissionToAssignment);
};

export const assignRoom = async (assignment: Omit<RoomAssignment, 'id'>): Promise<RoomAssignment> => {
  const body = {
    patient_id: assignment.patientId,
    room_id: assignment.roomId,
    check_in_date: assignment.checkInDate,
    daily_rate: assignment.dailyRate,
    bed_number: assignment.bedNumber,
    assigned_by: assignment.assignedBy,
  };
  const response = await apiClient.post('/admissions', body);
  return mapAdmissionToAssignment(response.data);
};

export const updateRoomAssignment = async (id: string, updates: Partial<RoomAssignment>): Promise<RoomAssignment> => {
  const response = await apiClient.patch(`/admissions/${id}`, updates);
  return mapAdmissionToAssignment(response.data);
};

export const checkOutPatient = async (assignmentId: string, checkOutDate: string): Promise<RoomAssignment> => {
  const response = await apiClient.post(`/admissions/${assignmentId}/discharge`, { check_out_date: checkOutDate });
  return mapAdmissionToAssignment(response.data);
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  const body: any = {};
  if (updates.roomNumber !== undefined) body.room_number = updates.roomNumber;
  if (updates.type !== undefined) body.type = updates.type.toLowerCase().replace('-', '_').replace(' ', '_');
  if (updates.status !== undefined) body.status = updates.status.toLowerCase();
  if (updates.bedCapacity !== undefined) body.bed_capacity = updates.bedCapacity;
  if (updates.occupiedBeds !== undefined) body.occupied_beds = updates.occupiedBeds;
  if (updates.dailyRate !== undefined) body.daily_rate = updates.dailyRate;
  if (updates.amenities !== undefined) body.amenities = updates.amenities;
  if (updates.department !== undefined) body.department = updates.department;
  if (updates.floor !== undefined) body.floor = updates.floor;
  const response = await apiClient.patch(`/rooms/${id}`, body);
  return mapRoom(response.data);
};

export const addRoom = async (room: Omit<Room, 'id'>): Promise<Room> => {
  const body = {
    room_number: room.roomNumber,
    floor: room.floor,
    type: room.type.toLowerCase().replace('-', '_').replace(' ', '_'),
    status: room.status.toLowerCase(),
    bed_capacity: room.bedCapacity,
    occupied_beds: room.occupiedBeds,
    daily_rate: room.dailyRate,
    amenities: room.amenities,
    department: room.department,
  };
  const response = await apiClient.post('/rooms', body);
  return mapRoom(response.data);
};

export const getRoomStats = async () => {
  const response = await apiClient.get('/rooms/stats');
  return response.data;
};
