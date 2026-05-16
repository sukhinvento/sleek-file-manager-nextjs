# Vendor API Integration Guide

## ✅ What's Been Implemented

The vendor service has been fully integrated with the backend API. All mock data has been replaced with real API calls.

### Updated Files:
- `src/services/vendorService.ts` - Now uses real backend API endpoints

### Features:
- ✅ **Fetch all vendors** - `GET /vendors`
- ✅ **Fetch single vendor** - `GET /vendors/:id`
- ✅ **Create vendor** - `POST /vendors`
- ✅ **Update vendor** - `PATCH /vendors/:id`
- ✅ **Delete vendor** - `DELETE /vendors/:id`
- ✅ **Search vendors** - `GET /vendors?search=query`
- ✅ **Calculate statistics** - Client-side aggregation
- ✅ **Auto authentication** - All requests include Bearer token
- ✅ **Field mapping** - Frontend ↔ Backend data transformation

## 🔄 Field Mapping

### Frontend → Backend

| Frontend Field | Backend Field | Location |
|---------------|---------------|----------|
| `vendorId` | `vendor_code` | Direct |
| `name` | `name` | Direct |
| `taxId` | `tax_id` | Direct |
| `address`, `city`, `state`, `zipCode`, `country` | `address` | Concatenated |
| `contactPerson` | `contact_persons[0]` | Array first element |
| `paymentTerms` | `payment_terms` | Direct |
| `gstNumber` | `supported_tax_slabs[0]` | Array first element |
| `phone`, `email`, `category`, etc. | `custom_fields.*` | Custom fields object |
| `riskLevel` | `custom_fields.rating` | Custom fields |
| `status` | `custom_fields.status` | Custom fields |

### Backend → Frontend

The service automatically maps backend vendor objects to the frontend `VendorWithRisk` interface.

## 🚀 How to Use

### 1. Seed Sample Vendors

After logging in, you can seed sample vendors:

#### Option A: Using Node.js Script (Recommended)

```bash
# 1. Login to your app and get the auth token from localStorage
# 2. Run the seed script with your token

node seed-vendors.js YOUR_AUTH_TOKEN_HERE
```

#### Option B: Manual via Swagger

1. Go to `http://localhost:3000/api#/vendors/VendorsController_create`
2. Click "Try it out"
3. Enter vendor data (see example below)
4. Execute

Example vendor payload:
```json
{
  "vendor_code": "VND-V001",
  "name": "PharmaCorp Ltd",
  "legal_name": "PharmaCorp Ltd",
  "tax_id": "TAX123456789",
  "address": "123 Industrial Blvd, New York, NY, 10001, USA",
  "contact_persons": ["John Anderson"],
  "default_lead_time_days": 14,
  "payment_terms": "Net 30",
  "supported_tax_slabs": ["GST-18"],
  "custom_fields": {
    "industry": "Pharmaceuticals",
    "rating": "Low",
    "status": "Active",
    "totalOrders": 45,
    "totalValue": 125000.5,
    "creditLimit": 50000,
    "outstandingBalance": 12500,
    "registrationDate": "2023-01-15",
    "website": "www.pharmacorp.com",
    "bankName": "Chase Bank",
    "accountNumber": "1234567890",
    "ifscCode": "CHAS0001234",
    "phone": "+1-555-0123",
    "email": "john@pharmacorp.com",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "category": "Pharmaceuticals"
  }
}
```

### 2. Test in Your App

1. **Navigate to Vendor Management page**
2. **View vendors** - Should load from backend API
3. **Create vendor** - Form submission will create via API
4. **Edit vendor** - Updates will save to backend
5. **Delete vendor** - Will remove from backend
6. **Search** - Real-time API search

## 🔍 Verify API Integration

### Check Network Tab

1. Open DevTools (F12) → Network tab
2. Navigate to vendors page
3. You should see:
   - `GET /vendors` - Loading vendors
   - Request has `Authorization: Bearer ...` header
   - Response contains vendor array

### Check Console

All API calls log errors to console:
```javascript
console.error('Error fetching vendors:', error);
```

### Check Backend Logs

Backend should show incoming requests:
```
GET /vendors 200 - 45ms
POST /vendors 201 - 82ms
```

## 📊 Available Functions

### Fetch All Vendors
```typescript
import { fetchVendors } from '@/services/vendorService';

const vendors = await fetchVendors();
```

### Fetch Single Vendor
```typescript
import { fetchVendorById } from '@/services/vendorService';

const vendor = await fetchVendorById('vendor_id_here');
```

### Create Vendor
```typescript
import { createVendor } from '@/services/vendorService';

const newVendor = await createVendor({
  vendorId: 'VND-V004',
  name: 'New Vendor Inc',
  // ... other fields
});
```

### Update Vendor
```typescript
import { updateVendor } from '@/services/vendorService';

const updated = await updateVendor('vendor_id_here', {
  name: 'Updated Name',
  status: 'Inactive'
});
```

### Delete Vendor
```typescript
import { deleteVendor } from '@/services/vendorService';

await deleteVendor('vendor_id_here');
```

### Search Vendors
```typescript
import { searchVendors } from '@/services/vendorService';

const results = await searchVendors('pharma');
```

### Get Statistics
```typescript
import { fetchVendorStats } from '@/services/vendorService';

const stats = await fetchVendorStats();
// Returns: { totalVendors, activeVendors, totalValue, ... }
```

## 🔐 Authentication

All API calls automatically include the Bearer token from localStorage:

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This is handled by the `apiClient` interceptor in `src/lib/api-client.ts`.

## 🐛 Troubleshooting

### "403 Forbidden" Error
- **Cause**: User doesn't have permission to access vendors
- **Fix**: Ensure logged-in user has `VENDORS` scope and appropriate role (Admin/Manager)

### "No vendors showing"
- **Check**: Are there vendors in the database?
- **Test**: Use Swagger to verify vendors exist: `GET /vendors`
- **Seed**: Run the seed script to create sample data

### "Network Error"
- **Check**: Is backend running at `http://localhost:3000`?
- **Verify**: Visit `http://localhost:3000/api` to check Swagger
- **CORS**: Ensure backend CORS allows your frontend origin

### "401 Unauthorized"
- **Cause**: Not logged in or token expired
- **Fix**: Login again to get a fresh token
- **Check**: Token exists in localStorage (`auth_token`)

### Data not mapping correctly
- **Check console**: Look for mapping errors
- **Verify**: Backend response structure matches `BackendVendor` interface
- **Custom fields**: Ensure custom fields are being set/retrieved correctly

## 📝 Next Steps

1. **Test CRUD operations** - Try creating, editing, and deleting vendors
2. **Check field mapping** - Ensure all fields save and load correctly
3. **Test search** - Verify search functionality works
4. **Add validation** - Consider adding form validation before API calls
5. **Error handling** - Implement better user feedback for errors

## 🎯 Backend Requirements Checklist

- ✅ Backend running at `http://localhost:3000`
- ✅ User logged in with valid token
- ✅ User has `VENDORS` scope permission
- ✅ User has appropriate role (Admin/Manager/User)
- ✅ CORS configured for frontend origin
- ✅ Sample vendors created (optional, via seed script)

## 💡 Tips

1. **Use DevTools Network tab** to debug API calls
2. **Check backend logs** for server-side errors
3. **Use Swagger** to test endpoints directly
4. **Clear localStorage** if token issues occur
5. **Restart backend** if changes don't reflect

---

**Status**: ✅ Vendor API integration complete and ready to use!



