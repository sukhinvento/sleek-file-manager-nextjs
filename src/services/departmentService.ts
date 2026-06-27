// Department Service — fetches departments from the dedicated /departments API
import apiClient from '@/lib/api-client';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  status: 'active' | 'inactive';
  tenantId: string;
}

function mapDepartment(raw: any): Department {
  return {
    id: raw._id || raw.id || '',
    name: raw.name || '',
    code: raw.code || '',
    description: raw.description || '',
    color: raw.color || '',
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    tenantId: raw.tenantId || '',
  };
}

/**
 * Fetch the sorted list of active department names.
 * Used to populate department dropdowns across the app.
 * GET /departments/names
 */
export const fetchDepartmentNames = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get('/departments/names');
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/**
 * Fetch full department objects (paginated).
 * GET /departments?status=active&limit=25
 */
export const fetchDepartments = async (
  params: { page?: number; limit?: number; search?: string; status?: string } = {},
): Promise<{ data: Department[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get('/departments', {
    params: { status: 'active', limit: 25, ...params },
  });
  const raw = Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];
  return {
    data: raw.map(mapDepartment),
    total: response.data?.total ?? raw.length,
    page: response.data?.page ?? 1,
    limit: response.data?.limit ?? 25,
  };
};

/**
 * Create a new department (Admin / Manager only).
 * POST /departments
 */
export const createDepartment = async (
  dept: Omit<Department, 'id' | 'tenantId'>,
): Promise<Department> => {
  const response = await apiClient.post('/departments', dept);
  return mapDepartment(response.data);
};

/**
 * Update a department.
 * PATCH /departments/:id
 */
export const updateDepartment = async (
  id: string,
  updates: Partial<Department>,
): Promise<Department> => {
  const response = await apiClient.patch(`/departments/${id}`, updates);
  return mapDepartment(response.data);
};

/**
 * Delete a department (Admin only).
 * DELETE /departments/:id
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/departments/${id}`);
};
