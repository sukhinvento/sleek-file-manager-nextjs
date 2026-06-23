import apiClient from '@/lib/api-client';
import { FixedAsset, DepreciationScheduleEntry } from '@/types/finance';

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapAsset(raw: any): FixedAsset {
  return {
    id: raw._id || raw.id || '',
    assetCode: raw.asset_code || raw.assetCode || '',
    assetName: raw.asset_name || raw.assetName || '',
    category: raw.category || '',
    purchaseDate: raw.purchase_date || raw.purchaseDate || '',
    purchaseCost: raw.purchase_cost ?? raw.purchaseCost ?? 0,
    usefulLifeYears: raw.useful_life_years ?? raw.usefulLifeYears ?? 0,
    depreciationMethod: raw.depreciation_method || raw.depreciationMethod || 'Straight-Line',
    salvageValue: raw.salvage_value ?? raw.salvageValue ?? 0,
    accumulatedDepreciation: raw.accumulated_depreciation ?? raw.accumulatedDepreciation ?? 0,
    netBookValue: raw.net_book_value ?? raw.netBookValue ?? 0,
    linkedAccountId: raw.linked_account_id || raw.linkedAccountId || '',
    depreciationAccountId: raw.depreciation_account_id || raw.depreciationAccountId || '',
    status: raw.status || 'Active',
    createdAt: raw.created_at || raw.createdAt || '',
  };
}

function mapScheduleEntry(raw: any): DepreciationScheduleEntry {
  return {
    month: raw.month || '',
    openingValue: raw.opening_value ?? raw.openingValue ?? 0,
    depreciationAmount: raw.depreciation_amount ?? raw.depreciationAmount ?? 0,
    accumulatedDepreciation: raw.accumulated_depreciation ?? raw.accumulatedDepreciation ?? 0,
    closingValue: raw.closing_value ?? raw.closingValue ?? 0,
  };
}

function toBackend(data: Partial<FixedAsset>): Record<string, any> {
  return {
    asset_code: data.assetCode,
    asset_name: data.assetName,
    category: data.category,
    purchase_date: data.purchaseDate,
    purchase_cost: data.purchaseCost,
    useful_life_years: data.usefulLifeYears,
    depreciation_method: data.depreciationMethod,
    salvage_value: data.salvageValue,
    linked_account_id: data.linkedAccountId,
    depreciation_account_id: data.depreciationAccountId,
    status: data.status,
  };
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ASSETS: FixedAsset[] = [
  { id: 'fa-1', assetCode: 'FA-001', assetName: 'MRI Machine', category: 'Medical Equipment', purchaseDate: '2024-06-15', purchaseCost: 5500000, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', salvageValue: 500000, accumulatedDepreciation: 1000000, netBookValue: 4500000, linkedAccountId: '5', depreciationAccountId: '', status: 'Active', createdAt: '2024-06-15T00:00:00Z' },
  { id: 'fa-2', assetCode: 'FA-002', assetName: 'CT Scanner', category: 'Medical Equipment', purchaseDate: '2025-01-10', purchaseCost: 3200000, usefulLifeYears: 8, depreciationMethod: 'Straight-Line', salvageValue: 300000, accumulatedDepreciation: 435000, netBookValue: 2765000, linkedAccountId: '5', depreciationAccountId: '', status: 'Active', createdAt: '2025-01-10T00:00:00Z' },
  { id: 'fa-3', assetCode: 'FA-003', assetName: 'ICU Ventilators (x5)', category: 'Medical Equipment', purchaseDate: '2025-03-20', purchaseCost: 1250000, usefulLifeYears: 7, depreciationMethod: 'Straight-Line', salvageValue: 100000, accumulatedDepreciation: 205000, netBookValue: 1045000, linkedAccountId: '5', depreciationAccountId: '', status: 'Active', createdAt: '2025-03-20T00:00:00Z' },
  { id: 'fa-4', assetCode: 'FA-004', assetName: 'Hospital Building Wing B', category: 'Building', purchaseDate: '2023-01-01', purchaseCost: 15000000, usefulLifeYears: 30, depreciationMethod: 'Straight-Line', salvageValue: 3000000, accumulatedDepreciation: 1400000, netBookValue: 13600000, linkedAccountId: '', depreciationAccountId: '', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: 'fa-5', assetCode: 'FA-005', assetName: 'Ambulance — KA-01-AB-1234', category: 'Vehicle', purchaseDate: '2025-06-01', purchaseCost: 1800000, usefulLifeYears: 8, depreciationMethod: 'Straight-Line', salvageValue: 200000, accumulatedDepreciation: 200000, netBookValue: 1600000, linkedAccountId: '', depreciationAccountId: '', status: 'Active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 'fa-6', assetCode: 'FA-006', assetName: 'Office Furniture', category: 'Furniture', purchaseDate: '2024-01-01', purchaseCost: 450000, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', salvageValue: 50000, accumulatedDepreciation: 100000, netBookValue: 350000, linkedAccountId: '', depreciationAccountId: '', status: 'Active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'fa-7', assetCode: 'FA-007', assetName: 'X-Ray Machine (old)', category: 'Medical Equipment', purchaseDate: '2020-01-01', purchaseCost: 800000, usefulLifeYears: 7, depreciationMethod: 'Straight-Line', salvageValue: 100000, accumulatedDepreciation: 800000, netBookValue: 0, linkedAccountId: '', depreciationAccountId: '', status: 'Disposed', createdAt: '2020-01-01T00:00:00Z' },
];

const MOCK_SCHEDULE: Record<string, DepreciationScheduleEntry[]> = {
  'fa-1': [
    { month: '2024-07', openingValue: 5500000, depreciationAmount: 41667, accumulatedDepreciation: 41667, closingValue: 5458333 },
    { month: '2024-08', openingValue: 5458333, depreciationAmount: 41667, accumulatedDepreciation: 83334, closingValue: 5416666 },
    { month: '2024-09', openingValue: 5416666, depreciationAmount: 41667, accumulatedDepreciation: 125001, closingValue: 5374999 },
    { month: '2024-10', openingValue: 5374999, depreciationAmount: 41667, accumulatedDepreciation: 166668, closingValue: 5333332 },
    { month: '2024-11', openingValue: 5333332, depreciationAmount: 41667, accumulatedDepreciation: 208335, closingValue: 5291665 },
    { month: '2024-12', openingValue: 5291665, depreciationAmount: 41667, accumulatedDepreciation: 250002, closingValue: 5249998 },
  ],
};

// ── Service methods ──────────────────────────────────────────────────────────

export async function listAssets(
  params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}
): Promise<{ data: FixedAsset[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 25, search = '', category = '', status = '' } = params;
  try {
    const queryParams: Record<string, any> = { page, limit };
    if (search) queryParams.search = search;
    if (category) queryParams.category = category;
    if (status) queryParams.status = status;

    const res = await apiClient.get('/fixed-assets', { params: queryParams });
    const body = res.data;
    const data = (body.data || []).map(mapAsset);
    const total = body.total ?? data.length;
    return { data, total, page: body.page ?? page, limit: body.limit ?? limit, totalPages: Math.ceil(total / (body.limit ?? limit)) };
  } catch {
    console.warn('fixedAssetService.listAssets: backend unavailable, using mock data');
    let filtered = MOCK_ASSETS;
    if (search) filtered = filtered.filter(a => a.assetCode.toLowerCase().includes(search.toLowerCase()) || a.assetName.toLowerCase().includes(search.toLowerCase()));
    if (category) filtered = filtered.filter(a => a.category === category);
    if (status) filtered = filtered.filter(a => a.status === status);
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) };
  }
}

export async function createAsset(data: Partial<FixedAsset>): Promise<FixedAsset> {
  try {
    const res = await apiClient.post('/fixed-assets', toBackend(data));
    return mapAsset(res.data);
  } catch {
    const asset: FixedAsset = {
      ...data as FixedAsset,
      id: `fa-${Date.now()}`,
      accumulatedDepreciation: 0,
      netBookValue: (data.purchaseCost || 0),
      createdAt: new Date().toISOString(),
    };
    MOCK_ASSETS.push(asset);
    return asset;
  }
}

export async function updateAsset(id: string, data: Partial<FixedAsset>): Promise<FixedAsset> {
  try {
    const res = await apiClient.patch(`/fixed-assets/${id}`, toBackend(data));
    return mapAsset(res.data);
  } catch {
    const idx = MOCK_ASSETS.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Asset not found');
    MOCK_ASSETS[idx] = { ...MOCK_ASSETS[idx], ...data };
    return MOCK_ASSETS[idx];
  }
}

export async function runDepreciation(): Promise<void> {
  try {
    await apiClient.post('/fixed-assets/depreciation/run');
  } catch {
    console.warn('fixedAssetService.runDepreciation: backend unavailable');
  }
}

export async function getDepreciationSchedule(assetId: string): Promise<DepreciationScheduleEntry[]> {
  try {
    const res = await apiClient.get(`/fixed-assets/depreciation/schedule/${assetId}`);
    return (res.data.data || res.data || []).map(mapScheduleEntry);
  } catch {
    return MOCK_SCHEDULE[assetId] || [];
  }
}
