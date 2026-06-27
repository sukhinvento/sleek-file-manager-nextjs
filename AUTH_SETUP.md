# Authentication Setup Guide

## ✅ Completed Changes

### 1. Created API Client (`src/lib/api-client.ts`)
- Centralized axios instance with base URL configuration
- Automatic token injection via request interceptor
- Global error handling via response interceptor
- Auto-logout on 401 (unauthorized) errors
- Helper functions for token management

### 2. Created Auth Service (`src/services/authService.ts`)
- Login function that calls backend API
- Logout function with token cleanup
- User data management in localStorage
- Helper functions to check authentication status and roles

### 3. Updated Login Page (`src/pages/Login.tsx`)
- ✅ Replaced mock authentication with real API calls
- ✅ Changed from `email` to `username` (backend requirement)
- ✅ Stores auth token in localStorage on successful login
- ✅ Stores user data for session management
- ✅ Better error handling with specific messages
- ✅ Auto-redirect to dashboard on success

### 4. Updated Vendor Service (`src/services/vendorService.ts`)
- Added import for centralized API client
- Ready to use authenticated API calls

## 🔧 Environment Setup Required

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 How to Test

### 1. Start Backend Server
```bash
cd /Users/sukhchainsingh/Documents/Startup\ Products/boilerplate-backend-main
npm run start:dev
```

### 2. Start Frontend Server
```bash
cd /Users/sukhchainsingh/Documents/Startup\ Products/sleek-file-manager-nextjs
npm run dev
```

### 3. Test Login
1. Navigate to the login page
2. Enter credentials:
   - **Username**: (use seeded user - check backend SEEDING.md)
   - **Password**: (use seeded password)
3. Click "Sign In"
4. You should be redirected to `/dashboard` on success

## 🔍 Verify Authentication

### Check Browser Console
- Open DevTools (F12) → Console tab
- You should see: `Logged in user: { userId, username, roles }`

### Check Network Tab
- Open DevTools (F12) → Network tab
- Look for the POST request to `/auth/login`
- Verify the response contains `access_token`

### Check localStorage
- Open DevTools (F12) → Application tab → Local Storage
- You should see:
  - `auth_token`: JWT token string
  - `user_data`: User object JSON

### Verify Token in API Calls
- Make any API call (e.g., fetch vendors)
- Check the request headers in Network tab
- You should see: `Authorization: Bearer eyJhbGciOiJIUz...`

## 📝 Next Steps

### 1. Create Test User in Backend
If you don't have a test user, create one using:

```bash
# Run seed script
cd boilerplate-backend-main
npm run seed
```

Or create manually via Swagger at: `http://localhost:3000/api#/auth/AuthController_createUser`

### 2. Update Other Services
All other services (inventory, purchase orders, sales orders) will automatically use the authenticated API client because they import from `@/lib/api-client`.

### 3. Add Protected Routes
Consider adding route protection to prevent unauthorized access:

```typescript
// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';

export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return authService.isAuthenticated() ? children : null;
};
```

## 🐛 Troubleshooting

### "Cannot connect to server"
- ✅ Check if backend is running at `http://localhost:3000`
- ✅ Visit `http://localhost:3000/api` to verify Swagger is accessible
- ✅ Check console for CORS errors

### "Invalid username or password"
- ✅ Verify you're using the correct credentials from backend seed
- ✅ Check backend logs for authentication errors
- ✅ Ensure user exists in the database

### Token not being sent in API calls
- ✅ Check if token is in localStorage (`auth_token`)
- ✅ Verify API client is imported correctly in services
- ✅ Check Network tab for Authorization header

### Page refresh loses authentication
- This is expected behavior - tokens are stored in localStorage
- Token will persist across page refreshes
- Only cleared on logout or 401 errors

## 🔐 Security Notes

1. **Token Storage**: Currently using localStorage - consider httpOnly cookies for production
2. **Token Expiry**: Backend sets token expiration (default 60 minutes)
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Ensure backend CORS is configured for your frontend origin

## 📚 API Endpoints Used

- **POST** `/auth/login` - User login
- **POST** `/auth/logout` - User logout
- **GET** `/auth/me` - Get current user (not yet implemented)

All other endpoints automatically include the Bearer token via the API client interceptor.



