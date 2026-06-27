# Frontend - AI Assistant Context

## Project Overview

**MedSystem Frontend** - Next.js-based healthcare management UI providing intuitive interfaces for all hospital operations. Supports multi-tenant access with role-based features, real-time data management, and responsive design.

**Status**: Production-ready with active feature development
**Last Updated**: 2026-05-24

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14+ |
| **Language** | TypeScript | 5+ |
| **UI Library** | shadcn/ui | Latest |
| **Styling** | Tailwind CSS | 3+ |
| **State** | React Context API | 18+ |
| **HTTP Client** | Fetch API / Axios | (Custom service layer) |
| **Icons** | Lucide React | Latest |
| **Date Handling** | date-fns, react-day-picker | Latest |

---

## Project Structure

```
sleek-file-manager-nextjs/
├── public/
│   └── [Static assets - logos, images]
│
├── src/
│   ├── app/                             [Next.js app router config]
│   │   └── layout.tsx
│   │
│   ├── pages/                           [Page components - one per module]
│   │   ├── Index.tsx                    [Dashboard/home]
│   │   ├── Dashboard.tsx                [Main dashboard]
│   │   ├── HospitalDashboard.tsx        [Clinical dashboard]
│   │   ├── VendorManagement.tsx         [Vendor CRUD]
│   │   ├── PurchaseOrders.tsx           [PO list/create/edit]
│   │   ├── SalesOrders.tsx              [SO list/create/edit]
│   │   ├── Inventory.tsx                [Stock management]
│   │   ├── InventoryDashboard.tsx       [Stock analytics]
│   │   ├── DoctorManagement.tsx         [Doctor staff]
│   │   ├── Patients.tsx                 [Patient records]
│   │   ├── PatientAdmission.tsx         [Admission workflow]
│   │   ├── Diagnostics.tsx              [Lab test bookings]
│   │   ├── Billing.tsx                  [Invoice & bills]
│   │   ├── Login.tsx                    [Auth entry]
│   │   ├── Settings.tsx                 [User preferences]
│   │   └── [other pages]
│   │
│   ├── components/                      [Reusable UI components]
│   │   ├── ui/                          [shadcn/ui base components]
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── date-picker-with-range.tsx
│   │   │   ├── mobile-table-view.tsx
│   │   │   ├── responsive-dialog.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── [other base components]
│   │   │
│   │   ├── purchase-orders/             [PO-specific components]
│   │   │   ├── ModernPOOverlay.tsx       [Detail view modal]
│   │   │   ├── PurchaseOrderFilterModal.tsx
│   │   │   ├── PurchaseOrderSortModal.tsx
│   │   │   └── [other PO components]
│   │   │
│   │   ├── sales-orders/                [SO-specific components]
│   │   │   └── [similar structure]
│   │   │
│   │   ├── vendor/                      [Vendor-specific components]
│   │   │   ├── ModernVendorOverlay.tsx
│   │   │   ├── VendorFilterModal.tsx
│   │   │   └── VendorSortModal.tsx
│   │   │
│   │   ├── diagnostics/                 [Diagnostic-specific components]
│   │   │   ├── DiagnosticFilterModal.tsx
│   │   │   └── [other diagnostic components]
│   │   │
│   │   └── [other module-specific folders]
│   │
│   ├── types/                           [TypeScript interfaces]
│   │   ├── inventory.ts                 [Vendor, Inventory, SO types]
│   │   ├── purchaseOrder.ts             [PO types]
│   │   └── [other type definitions]
│   │
│   ├── services/                        [API communication layer]
│   │   ├── api-client.ts                [Base HTTP client with auth]
│   │   ├── vendorService.ts             [Vendor API calls]
│   │   ├── purchaseOrderService.ts      [PO API calls]
│   │   ├── salesOrderService.ts         [SO API calls]
│   │   ├── inventoryService.ts          [Inventory API calls]
│   │   ├── patientService.ts            [Patient API calls]
│   │   ├── doctorService.ts             [Doctor API calls]
│   │   ├── diagnosticService.ts         [Diagnostic API calls]
│   │   ├── billingService.ts            [Billing API calls]
│   │   ├── authService.ts               [Auth/login API calls]
│   │   └── [other service files]
│   │
│   ├── hooks/                           [React custom hooks]
│   │   ├── use-toast.ts                 [Toast notifications]
│   │   ├── use-mobile.ts                [Responsive detection]
│   │   ├── use-infinite-scroll.ts       [Pagination handling]
│   │   └── [other custom hooks]
│   │
│   ├── lib/                             [Utility functions]
│   │   ├── utils.ts                     [General utilities]
│   │   ├── filterUtils.ts               [Filter/search logic]
│   │   ├── api-client.ts                [HTTP client setup]
│   │   └── [other utilities]
│   │
│   ├── context/                         [React Context for state]
│   │   ├── AuthContext.tsx              [Auth state (user, token)]
│   │   ├── ThemeContext.tsx             [Theme state]
│   │   └── [other contexts]
│   │
│   ├── App.tsx                          [Root app component]
│   └── index.tsx                        [Entry point]
│
├── Dockerfile
├── docker-compose.yml                   [Container config]
├── next.config.js                       [Next.js config]
├── tailwind.config.ts                   [Tailwind CSS config]
├── tsconfig.json
├── package.json
└── CLAUDE.md                            [This file]
```

---

## Key Architectural Patterns

### 1. **Service Layer Pattern**
All API calls go through service files (not direct fetch in components):

```typescript
// ✅ GOOD: pages/VendorManagement.tsx
const vendors = await vendorService.getAll(tenantId, filters);

// ❌ BAD: Direct API call in component
const response = await fetch('/vendors', ...);
```

Benefits:
- Centralized API logic
- Reusable across components
- Easy to mock for testing
- Consistent error handling

### 2. **Type-Safe Data Flow**
```typescript
// types/inventory.ts defines Vendor interface
interface Vendor {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  // ...
}

// Service returns typed data
async function getAll(): Promise<Vendor[]> { ... }

// Component uses typed data
const vendors: Vendor[] = await vendorService.getAll();
```

### 3. **Field Naming Convention**
- **Backend API**: snake_case (`vendor_name`, `po_number`)
- **Frontend code**: camelCase (`vendorName`, `poNumber`)
- **Conversion**: Service layer transforms responses

```typescript
// backend returns: { vendor_id: "V001", vendor_name: "Corp" }
// Service transforms to: { vendorId: "V001", vendorName: "Corp" }
// Component uses: vendor.vendorName
```

### 4. **Responsive Component Design**
```typescript
// Components detect mobile vs desktop
const isMobile = useIsMobile(); // hook detects screen size

return isMobile ? (
  <MobileTableView {...props} />      // Mobile optimized
) : (
  <DesktopTableView {...props} />     // Desktop optimized
);
```

### 5. **Filter & Sort Pattern**
Most pages have:
```typescript
<PurchaseOrderFilterModal />    // Multi-field filtering
<PurchaseOrderSortModal />      // Sort options
<Pagination />                  // Page navigation

// All feed into service call:
const data = await poService.getAll({
  filters: { status: 'Pending', vendor: 'X' },
  sort: { field: 'total', order: 'desc' },
  page: 1,
  limit: 20
});
```

---

## Data Flow

### Authentication Flow
```
1. User submits login form
   ↓
2. authService.login(username, password)
   ↓
3. API returns JWT token & user data
   ↓
4. Store in localStorage & AuthContext
   ↓
5. All subsequent requests include token in Authorization header
   ↓
6. Token expires → Redirect to login
```

### Data Fetching Flow
```
1. Page/component mounts
   ↓
2. useEffect(() => { fetch data }, [dependencies])
   ↓
3. Call service method (e.g., vendorService.getAll())
   ↓
4. Service adds auth token & makes HTTP request
   ↓
5. Backend validates JWT & returns data
   ↓
6. Service transforms snake_case → camelCase
   ↓
7. Component receives typed data
   ↓
8. Update state with setState or reducer
   ↓
9. Component re-renders with new data
```

### Create/Update Flow
```
1. User fills form
   ↓
2. Form validation (required fields, format)
   ↓
3. User clicks Submit
   ↓
4. Call service (vendorService.create(data))
   ↓
5. Service transforms camelCase → snake_case
   ↓
6. POST to /vendors
   ↓
7. Backend validates against schema
   ↓
8. Success: Show toast, refresh list, close modal
   ↓
9. Error: Show error toast with message
```

---

## Enum Pattern

All status, category, payment method, and fixed-option fields should use enums with **Code** (backend value) and **Label** (display name):

```typescript
// Enum structure - ALWAYS use this pattern
export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  PARTIAL = 'Partial',
  RECEIVED = 'Received'
}

export const OrderStatusMap: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.APPROVED]: 'Approved',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.PARTIAL]: 'Partial',
  [OrderStatus.RECEIVED]: 'Received'
};

// Usage: Use the enum value in code, display the Map value in UI
const statusLabel = OrderStatusMap[order.status];
```

---

## Important Type Definitions

### Referential Integrity & Enum Patterns (types/inventory.ts)

```typescript
// ===== ENUMS =====
export enum VendorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending'
}

export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  UPI = 'UPI',
  NET_30 = 'Net-30',
  NET_60 = 'Net-60',
  COD = 'COD'
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  PARTIAL = 'Partial',
  RECEIVED = 'Received'
}

// ===== VENDOR TYPE =====
interface Vendor {
  id: string;
  vendorId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;  // enum: Pharmaceutical, Medical Devices, etc.
  status: VendorStatus;
  gstNumber?: string;
  paymentMethods: PaymentMethod[];  // FINITE SET - can select multiple
  paymentTerms: string;
  // ... more fields
}

// ===== INVENTORY TYPE with VENDOR REFERENTIAL INTEGRITY =====
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  
  // REFERENTIAL INTEGRITY: Links to Vendor
  supplierId: string;      // Foreign key to Vendor.id
  supplierName: string;    // Denormalized for display
  supplierPhone: string;   // Denormalized for quick access
  supplierEmail: string;   // Denormalized for quick access
  
  expiryDate?: string;     // Auto-populate: current date + default shelf life
  manufacturerDate?: string; // Auto-populate if available
  // ... more fields
}

// ===== PURCHASE ORDER TYPE with INVENTORY REFERENTIAL INTEGRITY =====
interface PurchaseOrder {
  id: string;
  poNumber: string;
  
  // REFERENTIAL INTEGRITY: Links to Vendor
  vendorId: string;        // Foreign key to Vendor.id
  vendorName: string;      // Denormalized for display
  vendorContact: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorAddress: string;
  
  shippingAddress: string;
  
  // AUTO-POPULATED: from current date/time
  orderDate: string;       // Auto: new Date().toISOString()
  deliveryDate: string;    // Auto: orderDate + default lead time
  
  status: OrderStatus;
  
  // INVENTORY REFERENTIAL INTEGRITY
  items: PurchaseOrderItem[];  // Each item has inventoryId reference
  
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;  // ENUM - finite set
  notes: string;
  // ... more fields
}

interface PurchaseOrderItem {
  id: string;
  poId: string;
  
  // REFERENTIAL INTEGRITY: Links to InventoryItem
  inventoryId: string;     // Foreign key to InventoryItem.id
  inventoryName: string;   // Denormalized (SKU + Name)
  sku: string;            // Denormalized for quick reference
  
  quantity: number;
  unitPrice: number;
  total: number;
  // ... more fields
}

// ===== SALES ORDER TYPE with INVENTORY REFERENTIAL INTEGRITY =====
interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // AUTO-POPULATED: from current date/time
  orderDate: string;       // Auto: new Date().toISOString()
  deliveryDate: string;    // Auto: orderDate + default delivery days
  
  status: OrderStatus;
  
  // INVENTORY REFERENTIAL INTEGRITY
  items: SalesOrderItem[];  // Each item has inventoryId reference
  
  total: number;
  paymentStatus: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  paymentMethod: PaymentMethod;  // ENUM - finite set
  // ... more fields
}

interface SalesOrderItem {
  id: string;
  soId: string;
  
  // REFERENTIAL INTEGRITY: Links to InventoryItem
  inventoryId: string;     // Foreign key to InventoryItem.id
  inventoryName: string;   // Denormalized (SKU + Name)
  sku: string;            // Denormalized for quick reference
  
  quantity: number;
  unitPrice: number;
  total: number;
  // ... more fields
}
```

---

## Pagination Pattern - MANDATORY FOR ALL LIST ENDPOINTS

**CRITICAL**: All list fetching (vendors, inventory, patients, orders, etc.) MUST be paginated with a maximum of **25 items per page**. Never fetch all items at once.

### Pagination Implementation

```typescript
// types/common.ts - Reusable pagination types
export interface PaginationParams {
  page: number;      // 1-indexed page number
  limit: number;     // Items per page (always 25 max)
  sort?: string;     // Sort field (optional)
  search?: string;   // Search query (optional)
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;          // Total count of all items
  page: number;           // Current page
  limit: number;          // Items per page
  totalPages: number;     // Total number of pages
  hasMore: boolean;       // True if more pages exist
}

// Service layer pattern - EVERY list endpoint
export async function getAll(
  tenantId: string,
  params: PaginationParams = { page: 1, limit: 25 }
): Promise<PaginatedResponse<Vendor>> {
  const searchParams = new URLSearchParams();
  searchParams.append('page', params.page.toString());
  searchParams.append('limit', Math.min(params.limit || 25, 25)); // Cap at 25
  
  if (params.search) searchParams.append('search', params.search);
  if (params.sort) searchParams.append('sort', params.sort);
  
  const response = await fetch(
    `${API_BASE}/vendors?${searchParams}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) throw new Error('Failed to fetch vendors');
  
  const data = await response.json();
  return {
    items: data.items.map(transformVendor),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: Math.ceil(data.total / data.limit),
    hasMore: data.page < Math.ceil(data.total / data.limit)
  };
}

// Component: Handle pagination state and UI
export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 25
  });

  // Fetch data whenever page or filters change
  useEffect(() => {
    fetchVendors();
  }, [filters.page, filters.search, filters.sort]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAll('default_tenant', filters);
      setVendors(data.items);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        hasMore: data.hasMore
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load vendors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Handlers for pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 })); // Reset to page 1
  };

  const handleSort = (sortField: string) => {
    setFilters(prev => ({ ...prev, sort: sortField, page: 1 })); // Reset to page 1
  };

  return (
    <div className="p-6">
      <Card>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Vendors</h1>
            <Button onClick={() => setIsCreateModalOpen(true)}>Add Vendor</Button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <Input
              placeholder="Search vendors..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div>Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No vendors found</div>
          ) : (
            <>
              {/* List */}
              <div className="space-y-4">
                {vendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} items
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    pageNum => (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    disabled={!pagination.hasMore}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
```

### Pagination Rules

1. **Fixed Limit**: Always use `limit: 25` (never more, even if backend allows)
2. **Page-Based**: Use page number (1-indexed), not offset
3. **Reset on Filter**: When user changes search/sort, reset to page 1
4. **Show Metadata**: Display "Showing X to Y of Z items" to user
5. **Disable Buttons**: Disable "Previous" on page 1, disable "Next" when no more pages
6. **Update on All Changes**: Re-fetch when page, search, or sort changes
7. **Apply Everywhere**: All list endpoints use this pattern (vendors, inventory, patients, orders, doctors, diagnostics, billing, etc.)

### Frontend Pagination Component

```typescript
// components/ui/pagination-controls.tsx - Reusable component
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  isLoading
}: PaginationControlsProps) {
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <div className="mt-6 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        Showing {start} to {end} of {total} items
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {/* Show page numbers 1-5 or around current page */}
        {Array.from(
          { length: Math.min(5, totalPages) },
          (_, i) => {
            const start = Math.max(1, currentPage - 2);
            return start + i;
          }
        )
          .filter(pageNum => pageNum <= totalPages)
          .map(pageNum => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? 'default' : 'outline'}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </Button>
          ))}

        {totalPages > 5 && currentPage < totalPages - 2 && <span>...</span>}

        <Button
          variant="outline"
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

---

## Auto-Suggest Fields (Dropdown/Select with API)

Several fields need to fetch data from backend as auto-suggest dropdowns:

```typescript
// These fields should call APIs to get list of options:
// - supplier/vendor: GET /tenants/{id}/vendors (for InventoryItem.supplierId)
// - patient: GET /tenants/{id}/patients (for Diagnostics.patientId)
// - doctor: GET /tenants/{id}/doctors (for Diagnostics.orderedBy, PatientAdmission.assignedDoctor)
// - inventory: GET /tenants/{id}/inventory (for PurchaseOrderItem, SalesOrderItem)
// - tax_slab: GET /tenants/{id}/tax-slabs (for billing calculations)
// - discount: GET /tenants/{id}/discounts (for billing, orders)
// - payment_method: GET /tenants/{id}/payment-methods (for PO, SO, Billing)
// - shipment_address: GET /tenants/{id}/addresses (for PO, SO shipping)

// Service pattern for auto-suggest:
export async function getAutoSuggestOptions(
  tenantId: string,
  type: 'vendor' | 'patient' | 'doctor' | 'inventory' | 'tax_slab' | 'discount' | 'payment_method' | 'address',
  searchTerm?: string
): Promise<AutoSuggestOption[]> {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  
  const endpoints: Record<string, string> = {
    vendor: '/vendors',
    patient: '/patients',
    doctor: '/doctors',
    inventory: '/inventory',
    tax_slab: '/tax-slabs',
    discount: '/discounts',
    payment_method: '/payment-methods',
    address: '/addresses'
  };
  
  const response = await fetch(
    `${API_BASE}/tenants/${tenantId}${endpoints[type]}?${params}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) throw new Error(`Failed to fetch ${type} options`);
  
  const data = await response.json();
  return data.items.map((item: any) => ({
    value: item.id,
    label: item.name || item.description,
    ...item  // Include all item data
  }));
}

interface AutoSuggestOption {
  value: string;        // ID for storage
  label: string;        // Display text
  [key: string]: any;   // Additional fields (phone, email, etc.)
}
```

---

## Date & Time Auto-Population

All date/time fields should auto-populate with current date/time:

```typescript
// Service layer: Auto-populate dates before sending to API
export async function createPurchaseOrder(
  data: Omit<PurchaseOrder, 'id' | 'orderDate' | 'deliveryDate'> & 
        { deliveryDateDays?: number }
): Promise<PurchaseOrder> {
  const now = new Date();
  const defaultLeadDays = data.deliveryDateDays || 7; // Default: 7 days
  
  const enrichedData = {
    ...data,
    orderDate: now.toISOString(),
    deliveryDate: new Date(now.getTime() + defaultLeadDays * 24 * 60 * 60 * 1000).toISOString()
  };
  
  // ... send to API
}

// Component: Show auto-populated values to user before submission
<form>
  <input type="date" value={orderDate} disabled /> {/* Show calculated date */}
  <input type="date" value={deliveryDate} disabled /> {/* Show calculated date */}
  <input 
    type="number" 
    value={deliveryDateDays} 
    onChange={(e) => recalculateDeliveryDate(e.target.value)}
  /> {/* Allow user to adjust days */}
</form>
```

### Service Response Types
```typescript
// Paginated response (all list endpoints)
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter parameters (sent to backend)
interface VendorFilterParams {
  search?: string;
  category?: string;
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
```

---

## Service Layer Structure

### Each service file follows this pattern:

```typescript
// services/vendorService.ts

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Get all vendors (with filters, pagination)
export async function getAll(
  tenantId: string,
  filters?: VendorFilterParams
): Promise<Vendor[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    // ... add other filters
    
    const response = await fetch(
      `${API_BASE}/vendors?${params}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) throw new Error('Failed to fetch vendors');
    
    const data = await response.json();
    return transformVendors(data);  // snake_case → camelCase
  } catch (error) {
    console.error('Vendor fetch error:', error);
    throw error;
  }
}

// Get single vendor
export async function getOne(id: string): Promise<Vendor> {
  const response = await fetch(`${API_BASE}/vendors/${id}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Vendor not found');
  
  const data = await response.json();
  return transformVendor(data);
}

// Create vendor
export async function create(vendor: Omit<Vendor, 'id'>): Promise<Vendor> {
  const response = await fetch(`${API_BASE}/vendors`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(transformToAPI(vendor))  // camelCase → snake_case
  });
  
  if (!response.ok) throw new Error('Failed to create vendor');
  
  const data = await response.json();
  return transformVendor(data);
}

// Update vendor
export async function update(
  id: string,
  vendor: Partial<Vendor>
): Promise<Vendor> {
  const response = await fetch(`${API_BASE}/vendors/${id}`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(transformToAPI(vendor))
  });
  
  if (!response.ok) throw new Error('Failed to update vendor');
  
  const data = await response.json();
  return transformVendor(data);
}

// Delete vendor
export async function delete(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/vendors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to delete vendor');
}

// Helper: Transform API response (snake_case → camelCase)
function transformVendor(vendor: any): Vendor {
  return {
    id: vendor.id || vendor._id,
    vendorId: vendor.vendor_id,
    name: vendor.name,
    contactPerson: vendor.contact_person,
    // ... etc
  };
}

// Helper: Transform for API (camelCase → snake_case)
function transformToAPI(vendor: Partial<Vendor>): any {
  return {
    vendor_id: vendor.vendorId,
    name: vendor.name,
    contact_person: vendor.contactPerson,
    // ... etc
  };
}

// Helper: Get auth headers with JWT
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}
```

---

## Details View/Edit Pages - Consistency Pattern

All detail/edit pages must follow this structure for consistency across all modules:

```typescript
// pages/VendorDetails.tsx - EXAMPLE PATTERN
// Apply same pattern to: PurchaseOrderDetails, SalesOrderDetails, 
// InventoryDetails, PatientDetails, DoctorDetails, DiagnosticDetails, BillingDetails

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as vendorService from '@/services/vendorService';
import { Vendor } from '@/types/inventory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function VendorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load single record
  useEffect(() => {
    loadVendor();
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getOne(id!);
      setVendor(data);
      setFormData(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load vendor', variant: 'destructive' });
      navigate('/vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const updated = await vendorService.update(id!, formData);
      setVendor(updated);
      setIsEditing(false);
      setErrors({});
      toast({ title: 'Success', description: 'Vendor updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update vendor', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    setFormData(vendor || {});
    setIsEditing(false);
    setErrors({});
  };

  if (loading) return <div>Loading...</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="p-6">
      <Card>
        {/* Header: Title + Action Buttons */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <div className="space-x-2">
              {!isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  <Button variant="ghost" onClick={() => navigate('/vendors')}>Back</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content: Read-only or Edit mode */}
        <div className="p-6">
          {isEditing ? (
            // EDIT MODE: Show input fields
            <div className="space-y-6">
              {/* Section 1: Basic Info */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vendor Name</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={errors.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vendor ID</label>
                    <Input
                      value={formData.vendorId || ''}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      error={errors.vendorId}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Person</label>
                    <Input
                      value={formData.contactPerson || ''}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      options={Object.values(VendorStatus).map(s => ({ label: s, value: s }))}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Payment */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact & Payment</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Methods</label>
                    <MultiSelect
                      value={formData.paymentMethods || []}
                      onChange={(methods) => setFormData({ ...formData, paymentMethods: methods })}
                      options={Object.values(PaymentMethod).map(m => ({ label: m, value: m }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Terms</label>
                    <Input value={formData.paymentTerms || ''} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // READ-ONLY MODE: Show data as display
            <div className="space-y-6">
              {/* Section 1: Basic Info */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Vendor Name" value={vendor.name} />
                  <DetailField label="Vendor ID" value={vendor.vendorId} />
                  <DetailField label="Contact Person" value={vendor.contactPerson} />
                  <DetailField label="Status" value={<StatusBadge status={vendor.status} />} />
                </div>
              </div>

              {/* Section 2: Contact & Payment */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact & Payment</h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Phone" value={vendor.phone} />
                  <DetailField label="Email" value={vendor.email} />
                  <DetailField label="Payment Methods" value={vendor.paymentMethods?.join(', ')} />
                  <DetailField label="Payment Terms" value={vendor.paymentTerms} />
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t text-sm text-gray-500">
                <DetailField label="Created By" value={vendor.createdBy} />
                <DetailField label="Created At" value={new Date(vendor.createdAt).toLocaleString()} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Reusable components for consistency
function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-base text-gray-900">{value || '—'}</p>
    </div>
  );
}

function validateForm(data: Partial<Vendor>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.vendorId?.trim()) errors.vendorId = 'Vendor ID is required';
  return errors;
}
```

---

## Page Component Pattern

Each list page follows this structure:

```typescript
// pages/VendorManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import * as vendorService from '@/services/vendorService';
import { Vendor, VendorFilterParams } from '@/types/inventory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VendorFilterModal } from '@/components/vendor/VendorFilterModal';
import { toast } from '@/hooks/use-toast';

export default function VendorManagement() {
  // State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<VendorFilterParams>({});
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchVendors();
  }, [filters]);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAll('default_tenant', filters);
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast({ title: 'Error', description: 'Failed to load vendors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Handlers
  const handleCreate = useCallback(async (data: Omit<Vendor, 'id'>) => {
    try {
      const newVendor = await vendorService.create(data);
      setVendors([...vendors, newVendor]);
      setIsCreateModalOpen(false);
      toast({ title: 'Success', description: 'Vendor created' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create vendor', variant: 'destructive' });
    }
  }, [vendors]);

  const handleUpdate = useCallback(async (id: string, data: Partial<Vendor>) => {
    try {
      const updated = await vendorService.update(id, data);
      setVendors(vendors.map(v => v.id === id ? updated : v));
      setSelectedVendor(null);
      toast({ title: 'Success', description: 'Vendor updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update vendor', variant: 'destructive' });
    }
  }, [vendors]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await vendorService.delete(id);
      setVendors(vendors.filter(v => v.id !== id));
      toast({ title: 'Success', description: 'Vendor deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete vendor', variant: 'destructive' });
    }
  }, [vendors]);

  // Render
  return (
    <div className="p-6">
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Vendors</h1>
            <Button onClick={() => setIsCreateModalOpen(true)}>Add Vendor</Button>
          </div>

          <VendorFilterModal 
            onFilterChange={setFilters}
            currentFilters={filters}
          />

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {vendors.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onEdit={() => setSelectedVendor(vendor)}
                  onDelete={() => handleDelete(vendor.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateVendorModal
          onSave={handleCreate}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {selectedVendor && (
        <EditVendorModal
          vendor={selectedVendor}
          onSave={handleUpdate}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}
```

---

## Important Modules & Pages

| Module | Page File | Service File | Key Features |
|--------|-----------|--------------|--------------|
| **Vendors** | VendorManagement.tsx | vendorService.ts | Create, edit, filter, risk analysis |
| **Purchase Orders** | PurchaseOrders.tsx | purchaseOrderService.ts | Create PO, track status, mark delivered |
| **Sales Orders** | SalesOrders.tsx | salesOrderService.ts | Create SO, track fulfillment |
| **Inventory** | Inventory.tsx | inventoryService.ts | Stock levels, adjust stock, low stock alerts |
| **Doctors** | DoctorManagement.tsx | doctorService.ts | Staff management, schedule, consultation fees |
| **Patients** | Patients.tsx | patientService.ts | Patient records, demographics, medical history |
| **Admissions** | PatientAdmission.tsx | admissionService.ts | Admit patient, discharge (triggers billing) |
| **Diagnostics** | Diagnostics.tsx | diagnosticService.ts | Book tests, track results, pricing |
| **Billing** | Billing.tsx | billingService.ts | View invoices, payment tracking, reports |
| **Dashboard** | Dashboard.tsx, HospitalDashboard.tsx | dashboardService.ts | KPIs, charts, recent activity |

---

## Design System & Components

### Color Tokens (from design system)
```typescript
// Clinical Teal palette
PRIMARY = 'hsl(200, 70%, 50%)'    // Teal
SUCCESS = 'hsl(158, 70%, 36%)'    // Green
WARNING = 'hsl(33, 92%, 48%)'     // Amber
DANGER = 'hsl(354, 70%, 50%)'     // Red
TEXT_MAIN = 'hsl(215, 28%, 14%)'  // Dark text
TEXT_MUTE = 'hsl(220, 12%, 54%)'  // Muted text
BORDER = 'hsl(220, 16%, 90%)'     // Light border
```

### Base UI Components (shadcn/ui)
```
/button      - Actions
/input       - Text inputs
/card        - Content containers
/dialog      - Modals
/select      - Dropdowns
/badge       - Status tags
/pagination  - Page navigation
/date-picker - Date selection
/responsive-dialog - Mobile-friendly modal
/mobile-table-view - Mobile list view
/stat-card   - KPI display
```

### Custom Components
```
ModernPOOverlay          - Purchase Order detail view
PurchaseOrderFilterModal - Multi-field filtering
VendorFilterModal        - Vendor search/filter
DiagnosticFilterModal    - Diagnostic test filters
ModernVendorOverlay      - Vendor detail view
MobileTableView          - Responsive table
StatCard                 - Metric card with color
```

---

## Authentication & Authorization

### Auth Flow
```typescript
1. User logs in via Login.tsx
2. authService.login(username, password)
3. Backend returns JWT token + user data
4. Store in localStorage and AuthContext
5. AuthContext provides user state to all components
6. All API calls include JWT in Authorization header

// Protected route example
function ProtectedRoute() {
  const { user, token } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  if (!user.scopes.includes('vendors')) return <Unauthorized />;
  
  return <VendorManagement />;
}
```

### User Roles & Scopes
```typescript
// From RBAC_ROLES_AND_SCOPES.md
Admin has scopes: [vendors, tenants, invoices, purchase-orders, ...]
Manager has scopes: [vendors, invoices, purchase-orders, patients, ...]
Doctor has scopes: [patients, admissions, diagnostics, medications]
Staff has scopes: [vendors, purchase-orders, sales-orders, patients]
```

### Role-Based Access Control - Enhanced Patterns

```typescript
// types/auth.ts
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DOCTOR = 'doctor',
  STAFF = 'staff',
  PATIENT = 'patient'
}

export enum Scope {
  VENDORS = 'vendors',
  PURCHASE_ORDERS = 'purchase-orders',
  SALES_ORDERS = 'sales-orders',
  INVENTORY = 'inventory',
  DOCTORS = 'doctors',
  PATIENTS = 'patients',
  ADMISSIONS = 'admissions',
  DIAGNOSTICS = 'diagnostics',
  BILLING = 'billing',
  USERS = 'users',
  SETTINGS = 'settings',
  REPORTS = 'reports'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  scopes: Scope[];
  status: 'Active' | 'Inactive';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// In pages/VendorManagement.tsx - Check permissions before rendering
const { user } = useAuth();

const canCreate = user?.scopes.includes(Scope.VENDORS) && user?.role !== UserRole.PATIENT;
const canEdit = user?.scopes.includes(Scope.VENDORS) && user?.role !== UserRole.PATIENT;
const canDelete = user?.role === UserRole.ADMIN;

return (
  <>
    {canCreate && <Button onClick={handleCreate}>Add Vendor</Button>}
    {/* ... */}
    {canEdit && <Button onClick={handleEdit}>Edit</Button>}
    {canDelete && <Button onClick={handleDelete} variant="destructive">Delete</Button>}
  </>
);
```

---

## Settings Page - User & Permission Management

Admin and authorized personnel can manage users and their permissions from the Settings page.

### Types (types/settings.ts)

```typescript
export interface UserPermission {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  scopes: Scope[];
  joinDate: string;
  lastLogin?: string;
}

export interface PermissionGroup {
  name: string;
  description: string;
  scopes: Scope[];
}

// Predefined permission groups based on roles
export const PERMISSION_GROUPS: Record<UserRole, PermissionGroup> = {
  [UserRole.ADMIN]: {
    name: 'Administrator',
    description: 'Full access to all modules',
    scopes: Object.values(Scope)
  },
  [UserRole.MANAGER]: {
    name: 'Manager',
    description: 'Can manage vendors, orders, and billing',
    scopes: [
      Scope.VENDORS,
      Scope.PURCHASE_ORDERS,
      Scope.SALES_ORDERS,
      Scope.INVENTORY,
      Scope.PATIENTS,
      Scope.BILLING,
      Scope.REPORTS
    ]
  },
  [UserRole.DOCTOR]: {
    name: 'Doctor',
    description: 'Can access patient and diagnostic information',
    scopes: [Scope.PATIENTS, Scope.ADMISSIONS, Scope.DIAGNOSTICS]
  },
  [UserRole.STAFF]: {
    name: 'Staff',
    description: 'Can manage orders and basic patient info',
    scopes: [
      Scope.VENDORS,
      Scope.PURCHASE_ORDERS,
      Scope.SALES_ORDERS,
      Scope.INVENTORY,
      Scope.PATIENTS
    ]
  },
  [UserRole.PATIENT]: {
    name: 'Patient',
    description: 'Can view own medical records and appointments',
    scopes: [Scope.ADMISSIONS, Scope.DIAGNOSTICS]
  }
};
```

### Service Layer (services/settingsService.ts)

```typescript
// User management
export async function getAllUsers(tenantId: string): Promise<UserPermission[]> {
  const response = await fetch(
    `${API_BASE}/tenants/${tenantId}/users`,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch users');
  const data = await response.json();
  return data.items.map(transformUser);
}

export async function getUser(tenantId: string, userId: string): Promise<UserPermission> {
  const response = await fetch(
    `${API_BASE}/tenants/${tenantId}/users/${userId}`,
    { headers: getAuthHeaders() }
  );
  if (!response.ok) throw new Error('User not found');
  return transformUser(await response.json());
}

export async function createUser(
  tenantId: string,
  data: Omit<UserPermission, 'id' | 'createdAt' | 'lastLogin'>
): Promise<UserPermission> {
  const response = await fetch(
    `${API_BASE}/tenants/${tenantId}/users`,
    {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        scopes: data.scopes,
        status: data.status
      })
    }
  );
  if (!response.ok) throw new Error('Failed to create user');
  return transformUser(await response.json());
}

export async function updateUser(
  tenantId: string,
  userId: string,
  data: Partial<UserPermission>
): Promise<UserPermission> {
  const response = await fetch(
    `${API_BASE}/tenants/${tenantId}/users/${userId}`,
    {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        scopes: data.scopes,
        status: data.status
      })
    }
  );
  if (!response.ok) throw new Error('Failed to update user');
  return transformUser(await response.json());
}

export async function deleteUser(tenantId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/tenants/${tenantId}/users/${userId}`,
    { method: 'DELETE', headers: getAuthHeaders() }
  );
  if (!response.ok) throw new Error('Failed to delete user');
}

// Helper
function transformUser(data: any): UserPermission {
  return {
    id: data.id || data._id,
    userId: data.user_id,
    username: data.username,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    status: data.status,
    scopes: data.scopes || [],
    joinDate: data.created_at,
    lastLogin: data.last_login
  };
}
```

### Page Component (pages/Settings.tsx)

```typescript
// pages/Settings.tsx - User & Permission Management

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Only Admin can access Settings
  if (user?.role !== UserRole.ADMIN) {
    return <Unauthorized message="Only administrators can manage users" />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAllUsers(user!.tenantId);
      setUsers(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: Omit<UserPermission, 'id' | 'createdAt' | 'lastLogin'>) => {
    try {
      const newUser = await settingsService.createUser(user!.tenantId, data);
      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
      toast({ title: 'Success', description: 'User created successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' });
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<UserPermission>) => {
    try {
      const updated = await settingsService.updateUser(user!.tenantId, userId, data);
      setUsers(users.map(u => u.id === userId ? updated : u));
      setSelectedUser(null);
      toast({ title: 'Success', description: 'User updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">User Management</h1>
            <Button onClick={() => setIsCreateModalOpen(true)}>Add User</Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="p-6">
          {loading ? (
            <div>Loading users...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Scopes</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{u.firstName} {u.lastName}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {u.scopes.map(scope => (
                          <Badge key={scope}>{scope}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUser(u)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateUserModal
          onSave={handleCreateUser}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onSave={handleUpdateUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
```

---

## Environment Variables

### Required (.env.local)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Backend API URL
NEXT_PUBLIC_APP_NAME=MedSystem              # App name for UI
```

### Optional
```
NEXT_PUBLIC_LOG_LEVEL=info                  # Console log level
NEXT_PUBLIC_API_TIMEOUT=30000              # API timeout (ms)
```

---

## Common Development Tasks

### Start Frontend
```bash
# With Docker
docker-compose up -d frontend

# Or locally
npm install
npm run dev

# Open browser: http://localhost:8080
```

### Add a New Page
1. Create pages/NewFeature.tsx
2. Create services/newFeatureService.ts
3. Add types to types/inventory.ts or new file
4. Add navigation link in layout
5. Implement page using pattern above

### Add a New Component
```typescript
// components/vendor/VendorCard.tsx
interface VendorCardProps {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
}

export function VendorCard({ vendor, onEdit, onDelete }: VendorCardProps) {
  return (
    <Card>
      {/* Render vendor data */}
    </Card>
  );
}
```

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm test:cov

# E2E tests
npm run test:e2e
```

---

## API Integration Checklist

When integrating a new backend endpoint:

- [ ] Check `SCHEMA_CONFIGURATION_GUIDE.md` for field names
- [ ] Create/update TypeScript types in types/*.ts
- [ ] Create service file (services/moduleName.ts)
- [ ] Implement field transformation (snake_case ↔ camelCase)
- [ ] Add error handling with toast notifications
- [ ] Create page component using patterns above
- [ ] Add filter/sort modals if needed
- [ ] Test with real backend data
- [ ] Check mobile responsiveness
- [ ] Add role-based access control

---

## Important Patterns to Follow

### ✅ DO:
- Use service layer for all API calls
- Transform data in services (not in components)
- Type everything with TypeScript (including enums)
- Use React hooks (useState, useEffect, useCallback)
- Show error/success toasts for user feedback
- Handle loading states
- Use consistent naming (camelCase in TS code)
- Check user roles/scopes before showing UI
- **Use enums for status/category fields** (Code + Label pairs)
- **Fetch auto-suggest options from backend APIs** (vendors, patients, doctors, etc.)
- **Auto-populate date/time fields** with current date/time
- **Use referential integrity** in types (supplierId, vendorId, inventoryId, etc.)
- **Follow Details View pattern** for consistency across all detail/edit pages
- **Restrict Settings page to Admin role only**
- **PAGINATE all list endpoints** (max 25 items per page, always)
- **Use PaginationControls component** for consistent pagination UI
- **Reset to page 1** when user changes search/sort filters
- **Show pagination metadata** ("Showing X to Y of Z items")
- **Disable pagination buttons** appropriately (Previous on page 1, Next when no more)

### ❌ DON'T:
- Make direct fetch() calls in components
- Mix camelCase and snake_case in same file
- Forget to add loading states
- Ignore error responses
- Store sensitive data in localStorage
- Make API calls in render (use useEffect)
- Create new component files without types
- Skip responsive design (test on mobile)
- **Use magic string values for statuses** (always use enums)
- **Hardcode select/dropdown options** (fetch from API or use enum)
- **Manually format dates** (let service layer handle date logic)
- **Store foreign keys without display denormalization** (include name, email, etc. for quick display)
- **Allow non-Admins to access Settings page**
- **Create separate detail/edit/view patterns** (use consistent DetailView pattern for all)
- **Fetch all items at once** (always paginate with limit: 25)
- **Use limit > 25** (cap at 25 items per page)
- **Forget to reset page to 1** when user changes filters
- **Show pagination without metadata** (always show "Showing X to Y of Z")
- **Leave pagination buttons enabled inappropriately** (disable when not applicable)

---

## Known Issues & Gotchas

### 1. Field Mismatch Between Frontend & Backend
**Problem**: Form doesn't save data correctly
**Cause**: Service not transforming snake_case ↔ camelCase
**Fix**: Check transformVendor() and transformToAPI() functions in service

### 2. Auth Token Expired
**Problem**: API returns 401 Unauthorized
**Cause**: JWT token expired (default 1 hour)
**Fix**: User needs to log in again (auto-redirect happens)

### 3. CORS Errors
**Problem**: "Access-Control-Allow-Origin" error
**Cause**: Backend CORS not configured or wrong origin
**Fix**: Check docker-compose.yml CORS_ORIGIN matches frontend URL

### 4. Mobile Layout Broken
**Problem**: Page looks weird on phone
**Cause**: Missing responsive classes or not using useIsMobile hook
**Fix**: Test with `useIsMobile()` and conditional rendering

### 5. Data Not Updating
**Problem**: Create/update appears to work but list doesn't refresh
**Cause**: setState not called after API success
**Fix**: Always update component state after API call

---

## Debugging Tips

### Check Backend Connection
```typescript
// In browser console
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
```

### Decode JWT Token
```typescript
// In browser console
const token = localStorage.getItem('token');
console.log(JSON.parse(atob(token.split('.')[1])));
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Make API call
4. Check request headers (Authorization)
5. Check response status and body

### View Console Errors
```bash
# In browser DevTools console
- Check for fetch errors
- Check for component warnings
- Check localStorage for token
```

---

## Performance Optimization

- **Pagination**: Always paginate large lists (100+ items)
- **Lazy Loading**: Use React.lazy() for heavy components
- **Memoization**: Use useCallback/useMemo for expensive computations
- **Image Optimization**: Use Next.js Image component
- **CSS**: Tailwind is tree-shaken automatically
- **Code Splitting**: Next.js handles automatically

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 13+, Chrome Android

---

## Architectural Requirements Summary (v2)

This section summarizes all critical architectural patterns that must be followed for consistency and maintainability:

### 0. Pagination (MANDATORY FOR ALL LIST ENDPOINTS)
- **Fixed Limit**: Maximum 25 items per page (never more)
- **Page-Based**: Use 1-indexed page numbers, not offset
- **All List Endpoints**: Apply to vendors, inventory, patients, orders, doctors, diagnostics, billing, users, etc.
- **Reset on Filter**: When user changes search/sort, reset to page 1
- **UI Display**: Show "Showing X to Y of Z items" metadata
- **Button Controls**: Disable Previous on page 1, disable Next when no more pages
- **Service Pattern**: All `getAll()` methods return `PaginatedResponse<T>` with items, total, page, limit, totalPages, hasMore
- **Component Pattern**: Use PaginationControls component for consistent UI across all pages
- **Re-fetch**: Fetch new data when page, search, or sort parameters change

### 1. Referential Integrity
- **InventoryItem** ↔ **Vendor** (supplierId, supplierName, supplierPhone, supplierEmail)
- **PurchaseOrderItem** ↔ **InventoryItem** (inventoryId, inventoryName, sku)
- **SalesOrderItem** ↔ **InventoryItem** (inventoryId, inventoryName, sku)
- Always denormalize foreign key relationships with display fields for quick UI rendering

### 2. Enum Patterns
- **All status fields**: Use enums with Code (backend value) and Label (display name)
- **Examples**: OrderStatus, VendorStatus, PaymentMethod, PaymentStatus
- **Mapping**: Create `StatusMap` or `PaymentMethodMap` for UI display
- **Never use string literals** for fixed-option fields

### 3. Payment Methods as Finite Set
- **Vendor.paymentMethods**: Array of PaymentMethod enum values
- **PurchaseOrder.paymentMethod**: Single PaymentMethod enum value
- **SalesOrder.paymentMethod**: Single PaymentMethod enum value
- **Billing.paymentMethod**: Single PaymentMethod enum value
- **Source**: Fetch from backend `/payment-methods` endpoint if tenant-customizable

### 4. Auto-Suggest (Dropdown with API Fetching)
- **Vendors/Suppliers**: GET `/tenants/{id}/vendors` (for InventoryItem.supplierId, PurchaseOrder.vendorId)
- **Patients**: GET `/tenants/{id}/patients` (for Diagnostics.patientId, PatientAdmission.patientId)
- **Doctors**: GET `/tenants/{id}/doctors` (for Diagnostics.orderedBy, PatientAdmission.assignedDoctor)
- **Inventory Items**: GET `/tenants/{id}/inventory` (for PurchaseOrderItem, SalesOrderItem)
- **Tax Slabs**: GET `/tenants/{id}/tax-slabs` (for billing calculations)
- **Discounts**: GET `/tenants/{id}/discounts` (for orders, billing)
- **Payment Methods**: GET `/tenants/{id}/payment-methods` (if customizable per tenant)
- **Shipment Addresses**: GET `/tenants/{id}/addresses` (for PO/SO shipping)
- **Implementation**: Use service method with optional searchTerm parameter for filtering

### 5. Date & Time Auto-Population
- **orderDate**: Auto-populate with `new Date().toISOString()` in service layer
- **deliveryDate**: Auto-calculate based on orderDate + default lead time (7 days for PO, 3 days for SO)
- **Allow customization**: Let user adjust number of days, auto-recalculate delivery date
- **Show in UI**: Display calculated dates to user before form submission
- **Service pattern**: Create methods like `createPurchaseOrder()` that accept `deliveryDateDays` parameter

### 6. Details/Edit View Pattern (Consistency Across Pages)
All detail/edit pages must follow this consistent structure:
- **Header**: Title + Edit/Back/Cancel/Save buttons
- **Content**: Two modes (Read-only and Edit)
  - **Read-only**: Display data using `DetailField` component (label + value)
  - **Edit**: Input fields organized in sections with validation
- **Sections**: Group related fields (e.g., "Basic Information", "Contact & Payment", "Metadata")
- **Metadata**: Always show createdBy, createdAt, updatedBy (read-only)
- **Buttons**: Save, Cancel (if editing), Edit (if reading), Back
- **Validation**: Show error messages inline next to field
- **Apply to all modules**: Vendors, Inventory, PurchaseOrders, SalesOrders, Patients, Doctors, Diagnostics, Billing

### 7. RBAC - Role-Based Access Control (Enhanced)
- **User Roles**: Admin, Manager, Doctor, Staff, Patient
- **Scopes**: Vendors, PurchaseOrders, SalesOrders, Inventory, Doctors, Patients, Admissions, Diagnostics, Billing, Users, Settings, Reports
- **Permission Groups**: Pre-defined scope combinations per role (documented in PERMISSION_GROUPS)
- **Enforce in Components**: Check `user.scopes.includes(Scope.VENDORS)` before rendering create/edit/delete buttons
- **Restrict Features**: Don't show features user doesn't have scope for
- **Examples**:
  - Non-Admins can't create/delete vendors, but can view/edit
  - Doctors can only access Patients, Admissions, Diagnostics
  - Patients can only access own Admissions and Diagnostics

### 8. Settings Page - User & Permission Management
- **Access Control**: Admin role only (enforce with role check in component)
- **Features**:
  - List all users with username, email, role, scopes, status, joinDate, lastLogin
  - Create new user (assign role → auto-fill scopes based on permission group)
  - Edit user (change role, customize scopes, deactivate)
  - Delete user (with confirmation dialog)
- **Types**: UserPermission, PermissionGroup, PERMISSION_GROUPS constant
- **Service Layer**: 
  - `getAllUsers(tenantId)` - Get all users
  - `getUser(tenantId, userId)` - Get single user
  - `createUser(tenantId, data)` - Create new user (backend generates password)
  - `updateUser(tenantId, userId, data)` - Update user
  - `deleteUser(tenantId, userId)` - Delete user
- **Field Transformation**: Transform camelCase ↔ snake_case in service
- **Table Display**: Role as badge, Scopes as multiple badges, Status as colored badge

---

## Related Documentation

- **ARCHITECTURE_OVERVIEW.md** - System-wide architecture
- **SCHEMA_CONFIGURATION_GUIDE.md** - API field mappings
- **RBAC_ROLES_AND_SCOPES.md** - User roles and access control
- **Backend CLAUDE.md** - Backend project context

---

## Quick Command Reference

```bash
# Development
npm install
npm run dev              # Start dev server on :8080

# Build & Deploy
npm run build
npm run start

# Testing
npm test
npm run test:e2e

# Docker
docker-compose up -d    # Start with backend
docker-compose down     # Stop all services

# Debugging
npm run dev --inspect   # Enable debugger
# Open chrome://inspect in Chrome
```

---

## File Naming Conventions

```
Components:  PascalCase       (VendorCard.tsx, ModernPOOverlay.tsx)
Pages:       PascalCase       (VendorManagement.tsx, Patients.tsx)
Services:    camelCase        (vendorService.ts, patientService.ts)
Types:       camelCase file   (inventory.ts, purchaseOrder.ts)
Functions:   camelCase        (transformVendor, fetchVendors)
Constants:   UPPER_SNAKE_CASE (API_BASE, DEFAULT_LIMIT)
```

---

## User Feedback Strategy

### Toast Notifications
```typescript
// Success
toast({ title: 'Success', description: 'Vendor created successfully' });

// Error
toast({ 
  title: 'Error', 
  description: error.message,
  variant: 'destructive' 
});

// Info
toast({ title: 'Info', description: 'No more vendors to load' });
```

### Loading States
```typescript
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{data.length === 0 && <EmptyState />}
{data.length > 0 && <DataList items={data} />}
```

---

**Last Updated**: 2026-05-24  
**Frontend Version**: Production  
**Framework**: Next.js 14+  
**Component Library**: shadcn/ui  

When working on this project, refer to this file for context, patterns, and architecture decisions. All major conventions and file locations are documented here.
