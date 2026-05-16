import apiClient from '@/lib/api-client';

export interface Tax {
  _id: string;
  tax_code: string;
  name: string;
  description?: string;
  rate: number;
  rate_type: 'percentage' | 'fixed';
  applicable_on: 'sales' | 'purchase' | 'both';
  status: 'active' | 'inactive' | 'archived';
  jurisdiction?: string;
  tax_category?: string;
  effective_from?: string;
  effective_to?: string;
  priority?: number;
  is_inclusive?: boolean;
  is_compound?: boolean;
}

/**
 * Fetch active taxes
 * API call: GET /taxes/active/list?applicableOn=purchase
 */
export const fetchActiveTaxes = async (
  applicableOn?: 'sales' | 'purchase' | 'both'
): Promise<Tax[]> => {
  try {
    const params: Record<string, any> = {};
    if (applicableOn) {
      params.applicableOn = applicableOn;
    }
    
    const response = await apiClient.get<Tax[]>('/taxes/active/list', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching active taxes:', error);
    throw error;
  }
};

/**
 * Fetch taxes by IDs
 * API call: GET /taxes/by-ids?ids=id1,id2,id3
 */
export const fetchTaxesByIds = async (taxIds: string[]): Promise<Tax[]> => {
  try {
    if (!taxIds || taxIds.length === 0) {
      return [];
    }
    
    const response = await apiClient.get<Tax[]>('/taxes/by-ids', {
      params: { ids: taxIds.join(',') },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching taxes by IDs:', error);
    throw error;
  }
};

/**
 * Fetch a single tax by ID
 * API call: GET /taxes/:id
 */
export const fetchTaxById = async (id: string): Promise<Tax | null> => {
  try {
    const response = await apiClient.get<Tax>(`/taxes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tax by ID:', error);
    return null;
  }
};


