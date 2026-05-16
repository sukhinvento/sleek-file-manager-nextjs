# Tenant Setup Required

## 🐛 Current Issue

You're getting this error:
```
Cast to ObjectId failed for value "pharma_inc" (type string) at path "_id" for model "Tenant"
```

### Why This Happens:

The backend code has hardcoded tenant IDs like `'pharma_inc'` throughout the services:

```typescript
// In vendors.service.ts, tax.service.ts, etc.
const tenantId = 'pharma_inc';  // ❌ This is a string, not a MongoDB ObjectId
```

But the backend is trying to use this string as a MongoDB ObjectId, which fails because:
- **String**: `"pharma_inc"` ❌
- **MongoDB ObjectId**: `"507f1f77bcf86cd799439011"` ✅ (24 characters)

## ✅ Solution: Create a Tenant First

The backend uses a **multi-tenant architecture**. You need to create a tenant before you can use vendors, purchase orders, etc.

### Step 1: Create the Tenant

Run the tenant creation script:

```bash
# After logging in, copy your auth_token from localStorage
node create-tenant.js YOUR_AUTH_TOKEN
```

This will create a tenant and give you the **real MongoDB ObjectId**.

Example output:
```
✅ Tenant created successfully!

Tenant Details:
  ID: 507f1f77bcf86cd799439011
  Code: PHARMA_INC
  Name: Pharma Inc

⚠️  IMPORTANT: Update backend services to use this Tenant ID:
  Replace 'pharma_inc' with '507f1f77bcf86cd799439011' in backend services
```

### Step 2: Update Backend Services

You need to update the backend to use the real tenant ID. There are two approaches:

#### **Option A: Quick Fix (Temporary)**

Update the hardcoded tenant IDs in the backend services:

**Files to update:**
- `src/vendors/vendors.service.ts` (line 23)
- `src/tax/tax.service.ts` (line 22)
- `src/invoices/invoices.service.ts` (line 23)
- `src/fulfillments/fulfillments.service.ts` (line 23)
- `src/quotations/quotations.service.ts` (line 23)
- `src/stock/stock.service.ts` (line 27, 79, 87, 139)

**Change from:**
```typescript
const tenantId = 'pharma_inc';  // ❌
```

**To:**
```typescript
const tenantId = '507f1f77bcf86cd799439011';  // ✅ Use the real MongoDB ObjectId from Step 1
```

#### **Option B: Proper Fix (Recommended)**

Implement proper tenant context extraction from the request. The backend should:

1. **Add tenant ID to JWT token** during login
2. **Extract tenant ID from request** using a decorator/middleware
3. **Pass tenant ID from context** instead of hardcoding

Example:
```typescript
// Before
const tenantId = 'pharma_inc';

// After (with proper context)
const tenantId = req.user.tenantId;  // Get from authenticated user context
```

This is the proper multi-tenant approach but requires more backend changes.

## 🔄 Workflow After Fix

Once the tenant is created and backend is updated:

1. ✅ **Login** → Works
2. ✅ **Create Vendor** → Works (uses real tenant ID)
3. ✅ **Create Purchase Order** → Works
4. ✅ **All CRUD operations** → Work seamlessly

## 📝 Backend Files Using Tenant ID

These files currently have hardcoded tenant IDs:

| File | Line(s) | Hardcoded Value | Needs Update |
|------|---------|-----------------|--------------|
| `vendors/vendors.service.ts` | 23, 52, 86, 102 | `pharma_inc` | ✅ Yes |
| `tax/tax.service.ts` | 22, 73, 178, 197, 225, 253 | `pharma_inc` | ✅ Yes |
| `invoices/invoices.service.ts` | 23, 53, 87, 103, 128 | `pharma_inc` | ✅ Yes |
| `fulfillments/fulfillments.service.ts` | 23, 51, 83, 98 | `pharma_inc` | ✅ Yes |
| `quotations/quotations.service.ts` | 23, 51, 83, 98, 118, 138, 165 | `pharma_inc` | ✅ Yes |
| `stock/stock.service.ts` | 27, 55, 79, 87, 115, 139 | `pharma_inc` | ✅ Yes |
| `purchase-orders/purchase-orders.service.ts` | 27, 57, 94, 112, 137 | `furniture_world` | ✅ Yes |
| `sales-orders/sales-orders.service.ts` | 24, 54, 91, 109, 134, 159 | `freshmart` | ✅ Yes |

## 🚀 Quick Start Guide

### 1. Create Tenant
```bash
# Login to your app first, then:
node create-tenant.js YOUR_AUTH_TOKEN
```

### 2. Note the Tenant ID
Copy the MongoDB ObjectId from the output (24 characters).

### 3. Update Backend
Go to backend directory:
```bash
cd /Users/sukhchainsingh/Documents/Startup\ Products/boilerplate-backend-main
```

Update the tenant IDs in the service files listed above.

### 4. Restart Backend
```bash
npm run start:dev
```

### 5. Test Vendor Creation
Now try creating a vendor from your frontend - it should work! ✅

## 🎯 Why Multi-Tenant?

Your backend uses multi-tenant architecture where:
- Each **tenant** = One organization/business
- Each tenant has its own **vendors, orders, invoices**, etc.
- Data is **isolated** between tenants
- One backend serves **multiple clients**

**Benefits:**
- Data isolation
- Shared infrastructure
- Cost-effective
- Scalable

## ⚠️ Important Notes

1. **You need Admin role** to create tenants
2. **Tenant must exist** before creating vendors/orders
3. **MongoDB ObjectId is 24 characters** long
4. **Don't use string IDs** like `'pharma_inc'` directly

## 🐛 Still Having Issues?

Check:
1. ✅ Tenant created successfully?
2. ✅ Backend services updated with correct tenant ID?
3. ✅ Backend restarted after changes?
4. ✅ Using the correct (24-char) MongoDB ObjectId?
5. ✅ User has proper permissions?

## 📚 Next Steps

After fixing the tenant issue:
1. ✅ Vendors will work
2. ✅ Purchase Orders will work
3. ✅ Sales Orders will work
4. ✅ Invoices will work
5. ✅ All multi-tenant features work

Your application will be fully functional! 🎉



