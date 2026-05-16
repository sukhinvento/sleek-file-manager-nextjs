import { Vendor } from '@/types/inventory';
import apiClient from '@/lib/api-client';

// Extended vendor interface with risk level
export interface VendorWithRisk extends Vendor {
  riskLevel: string;
}

// Backend API response interface
interface BackendVendor {
  _id: string;
  vendor_code: string;
  name: string;
  legal_name: string;
  tax_id: string;
  address: string;
  contact_persons: string[];
  default_lead_time_days: number;
  payment_terms: string;
  supported_tax_slabs?: string[]; // Legacy field
  applicable_tax_ids?: string[]; // Tax IDs (preferred)
  default_purchase_tax_id?: string; // Default tax ID (preferred)
  custom_fields: Record<string, any>;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Filter interface for backend queries
export interface VendorFilterParams {
  page?: number;
  limit?: number;
  sort?: string; // Format: "field_asc" or "field_desc" or "field1_asc,field2_desc"
  filter?: Record<string, any>; // MongoDB-style filter
  search?: string; // Search term for text search
}

// Response interface for paginated vendor list
interface VendorListResponse {
  data: BackendVendor[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Map backend vendor to frontend vendor interface
const mapBackendToFrontend = (backendVendor: BackendVendor): VendorWithRisk => {
  const customFields = backendVendor.custom_fields || {};
  
  // Parse address (assuming format: "street, city, state, zip, country")
  const addressParts = backendVendor.address?.split(',').map(p => p.trim()) || [];
  
  return {
    id: backendVendor._id,
    vendorId: backendVendor.vendor_code,
    name: backendVendor.name,
    contactPerson: backendVendor.contact_persons?.[0] || '',
    phone: customFields.phone || '',
    email: customFields.email || '',
    address: addressParts[0] || backendVendor.address,
    city: customFields.city || addressParts[1] || '',
    state: customFields.state || addressParts[2] || '',
    zipCode: customFields.zipCode || addressParts[3] || '',
    country: customFields.country || addressParts[4] || '',
    category: customFields.industry || customFields.category || '',
    status: (customFields.status || 'Active') as 'Active' | 'Inactive' | 'Pending',
    totalOrders: customFields.totalOrders || 0,
    lastOrderDate: customFields.lastOrderDate,
    totalValue: customFields.totalValue || 0,
    paymentTerms: backendVendor.payment_terms || '',
    taxId: backendVendor.tax_id || '',
    gstNumber: customFields.gstNumber || backendVendor.supported_tax_slabs?.[0] || '',
    website: customFields.website || '',
    bankName: customFields.bankName || '',
    accountNumber: customFields.accountNumber || '',
    ifscCode: customFields.ifscCode || '',
    creditLimit: customFields.creditLimit || 0,
    outstandingBalance: customFields.outstandingBalance || 0,
    registrationDate: customFields.registrationDate || backendVendor.createdAt || new Date().toISOString().split('T')[0],
    notes: customFields.notes || '',
    riskLevel: customFields.rating || customFields.riskLevel || 'Low',
  };
};

// Extended frontend vendor interface with tax IDs
interface VendorWithTaxIds extends VendorWithRisk {
  applicableTaxIds?: string[];
  defaultPurchaseTaxId?: string;
}

// Map frontend vendor to backend format
const mapFrontendToBackend = (vendor: Partial<VendorWithTaxIds>): Partial<BackendVendor> => {
  const addressParts = [
    vendor.address,
    vendor.city,
    vendor.state,
    vendor.zipCode,
    vendor.country,
  ].filter(Boolean);
  
  const backendData: Partial<BackendVendor> = {
    vendor_code: vendor.vendorId,
    name: vendor.name,
    legal_name: vendor.name, // Using name as legal_name if not provided separately
    tax_id: vendor.taxId || '',
    address: addressParts.join(', '),
    contact_persons: vendor.contactPerson ? [vendor.contactPerson] : [],
    default_lead_time_days: 14, // Default value
    payment_terms: vendor.paymentTerms || '',
    custom_fields: {
      industry: vendor.category,
      rating: vendor.riskLevel,
      status: vendor.status,
      totalOrders: vendor.totalOrders,
      totalValue: vendor.totalValue,
      creditLimit: vendor.creditLimit,
      outstandingBalance: vendor.outstandingBalance,
      registrationDate: vendor.registrationDate,
      website: vendor.website,
      bankName: vendor.bankName,
      accountNumber: vendor.accountNumber,
      ifscCode: vendor.ifscCode,
      phone: vendor.phone,
      email: vendor.email,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      country: vendor.country,
      category: vendor.category,
      lastOrderDate: vendor.lastOrderDate,
      notes: vendor.notes,
    },
  };
  
  // Use tax IDs if provided (preferred), otherwise fall back to legacy supported_tax_slabs
  if (vendor.applicableTaxIds && vendor.applicableTaxIds.length > 0) {
    backendData.applicable_tax_ids = vendor.applicableTaxIds;
  } else if (vendor.gstNumber) {
    // Legacy support for gstNumber
    backendData.supported_tax_slabs = [vendor.gstNumber];
  }
  
  if (vendor.defaultPurchaseTaxId) {
    backendData.default_purchase_tax_id = vendor.defaultPurchaseTaxId;
  }
  
  return backendData;
};

/**
 * Fetch vendors with filtering, sorting, and pagination
 * API call: GET /vendors with query parameters
 */
export const fetchVendors = async (
  params?: VendorFilterParams
): Promise<{ vendors: VendorWithRisk[]; total?: number; page?: number; limit?: number; totalPages?: number }> => {
  try {
      const queryParams: Record<string, any> = {};
      
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.sort) queryParams.sort = params.sort;
      
      // Send filter as a JSON string in the filter parameter
      if (params?.filter && Object.keys(params.filter).length > 0) {
        queryParams.filter = JSON.stringify(params.filter);
      }
    
    const response = await apiClient.get<BackendVendor[] | VendorListResponse>('/vendors', {
      params: queryParams,
    });
    
    // Handle both array response and paginated response
    if (Array.isArray(response.data)) {
      return {
        vendors: response.data.map(mapBackendToFrontend),
      };
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const listResponse = response.data as VendorListResponse;
      return {
        vendors: (listResponse.data || []).map(mapBackendToFrontend),
        total: listResponse.total,
        page: listResponse.page,
        limit: listResponse.limit,
        totalPages: listResponse.totalPages,
      };
    } else {
      // Fallback: empty result
      console.warn('Unexpected response format:', response.data);
      return {
        vendors: [],
      };
    }
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    // Return empty array instead of throwing to prevent blank page
    return {
      vendors: [],
    };
  }
};

/**
 * Fetch a single vendor by ID
 * API call: GET /vendors/:id
 */
export const fetchVendorById = async (id: string): Promise<VendorWithRisk | null> => {
  try {
    const response = await apiClient.get<BackendVendor>(`/vendors/${id}`);
    return mapBackendToFrontend(response.data);
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    return null;
  }
};

/**
 * Create a new vendor
 * API call: POST /vendors
 */
export const createVendor = async (
  vendorData: Omit<VendorWithRisk, 'id' | 'totalOrders' | 'totalValue' | 'outstandingBalance'>
): Promise<VendorWithRisk> => {
  try {
    const backendData = mapFrontendToBackend({
      ...vendorData,
      totalOrders: 0,
      totalValue: 0,
      outstandingBalance: 0,
    });
    
    const response = await apiClient.post<BackendVendor>('/vendors', backendData);
    return mapBackendToFrontend(response.data);
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

/**
 * Update an existing vendor
 * API call: PATCH /vendors/:id
 */
export const updateVendor = async (
  id: string,
  vendorData: Partial<VendorWithRisk>
): Promise<VendorWithRisk> => {
  try {
    const backendData = mapFrontendToBackend(vendorData);
    
    const response = await apiClient.patch<BackendVendor>(`/vendors/${id}`, backendData);
    return mapBackendToFrontend(response.data);
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

/**
 * Delete a vendor
 * API call: DELETE /vendors/:id
 */
export const deleteVendor = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/vendors/${id}`);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

/**
 * Fetch vendor statistics
 * Uses backend filtering for efficient aggregation
 */
export const fetchVendorStats = async () => {
  try {
    // Fetch vendors for stats (with reasonable limit)
    const result = await fetchVendors({ limit: 1000 });
    const vendors = result.vendors || [];
    
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === 'Active').length;
    const totalValue = vendors.reduce((sum, v) => sum + (v.totalValue || 0), 0);
    const outstandingBalance = vendors.reduce((sum, v) => sum + (v.outstandingBalance || 0), 0);
    const highRiskVendors = vendors.filter(v => v.riskLevel === 'High').length;
    
    return {
      totalVendors,
      activeVendors,
      totalValue,
      outstandingBalance,
      highRiskVendors,
      averageOrderValue: totalVendors > 0 ? totalValue / totalVendors : 0,
    };
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    // Return default stats on error
    return {
      totalVendors: 0,
      activeVendors: 0,
      totalValue: 0,
      outstandingBalance: 0,
      highRiskVendors: 0,
      averageOrderValue: 0,
    };
  }
};

/**
 * Search vendors using backend search endpoint
 */
export const searchVendors = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<{ vendors: VendorWithRisk[]; total?: number; page?: number; limit?: number }> => {
  try {
    const response = await apiClient.get<BackendVendor[]>('/vendors/search', {
      params: { q: query, page, limit },
    });
    
    if (Array.isArray(response.data)) {
      return {
        vendors: response.data.map(mapBackendToFrontend),
        page,
        limit,
      };
    }
    
    return { vendors: [] };
  } catch (error) {
    console.error('Error searching vendors:', error);
    throw error;
  }
};
