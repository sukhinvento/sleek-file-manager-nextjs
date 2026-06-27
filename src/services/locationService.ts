import apiClient from '@/lib/api-client';
import { Location, LocationLookupOption } from '@/types/inventory';

function mapLocation(raw: any): Location {
  return {
    id: raw._id || raw.id || '',
    name: raw.name || '',
    code: raw.code || '',
    type: raw.type || 'warehouse',
    address: raw.address || '',
    city: raw.city || '',
    state: raw.state || '',
    pincode: raw.pincode || '',
    contactPerson: raw.contact_person || '',
    phone: raw.phone || '',
    email: raw.email || '',
    isActive: raw.is_active ?? true,
    subLocations: (raw.sub_locations || []).map((s: any) => ({
      name: s.name || '',
      type: s.type || 'shelf',
      capacity: s.capacity,
    })),
  };
}

function toBackend(data: Partial<Location>): Record<string, any> {
  const body: Record<string, any> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.code !== undefined) body.code = data.code;
  if (data.type !== undefined) body.type = data.type;
  if (data.address !== undefined) body.address = data.address;
  if (data.city !== undefined) body.city = data.city;
  if (data.state !== undefined) body.state = data.state;
  if (data.pincode !== undefined) body.pincode = data.pincode;
  if (data.contactPerson !== undefined) body.contact_person = data.contactPerson;
  if (data.phone !== undefined) body.phone = data.phone;
  if (data.email !== undefined) body.email = data.email;
  if (data.isActive !== undefined) body.is_active = data.isActive;
  if (data.subLocations !== undefined) {
    body.sub_locations = data.subLocations.map(s => ({
      name: s.name,
      type: s.type,
      capacity: s.capacity,
    }));
  }
  return body;
}

export const fetchLocations = async (page = 1, limit = 25): Promise<{ data: Location[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get('/locations', { params: { page, limit } });
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return {
    data: raw.map(mapLocation),
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? page,
    limit: response.data?.limit ?? limit,
  };
};

export const fetchLocationById = async (id: string): Promise<Location | null> => {
  try {
    const response = await apiClient.get(`/locations/${id}`);
    return mapLocation(response.data);
  } catch {
    return null;
  }
};

export const fetchLocationLookup = async (search?: string): Promise<LocationLookupOption[]> => {
  try {
    const params: any = { limit: 25 };
    if (search) params.search = search;
    const response = await apiClient.get('/locations/lookup', { params });
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((item: any) => ({
      value: item.value || item._id || item.id || '',
      label: item.label || item.name || '',
      code: item.code || '',
      type: item.type || '',
      address: item.address || '',
      sub_locations: item.sub_locations || [],
    }));
  } catch {
    return [];
  }
};

export const createLocation = async (data: Omit<Location, 'id'>): Promise<Location> => {
  const response = await apiClient.post('/locations', toBackend(data));
  return mapLocation(response.data);
};

export const updateLocation = async (id: string, data: Partial<Location>): Promise<Location> => {
  const response = await apiClient.patch(`/locations/${id}`, toBackend(data));
  return mapLocation(response.data);
};

export const deleteLocation = async (id: string): Promise<void> => {
  await apiClient.delete(`/locations/${id}`);
};
