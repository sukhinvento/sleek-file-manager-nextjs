// Create Tenant Script
// This script creates a tenant in the backend which is required for all operations
// Usage: node create-tenant.js <auth-token>

const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get auth token from command line argument
const authToken = process.argv[2];

if (!authToken) {
  console.error('\n❌ Error: Please provide an auth token');
  console.log('\nUsage: node create-tenant.js <auth-token>');
  console.log('\nTo get your auth token:');
  console.log('1. Login to the application');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Go to Application tab → Local Storage');
  console.log('4. Copy the value of "auth_token"\n');
  process.exit(1);
}

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }
});

const tenant = {
  tenant_code: 'PHARMA_INC',
  name: 'Pharma Inc',
  industry: 'Pharmaceutical',
  address: '123 Medical Plaza, Healthcare City',
  contact_email: 'admin@pharmainc.com',
  contact_phone: '+1-555-0100',
  subscription_tier: 'enterprise',
  subscription_status: 'active',
  max_users: 100,
  custom_branding: {
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#10b981'
  },
  settings: {
    timezone: 'America/New_York',
    date_format: 'MM/DD/YYYY',
    currency: 'USD'
  }
};

async function createTenant() {
  console.log('\n🏢 Creating tenant...\n');
  
  try {
    const response = await apiClient.post('/tenants', tenant);
    console.log('✅ Tenant created successfully!');
    console.log('\nTenant Details:');
    console.log('  ID:', response.data._id);
    console.log('  Code:', response.data.tenant_code);
    console.log('  Name:', response.data.name);
    console.log('  Industry:', response.data.industry);
    console.log('\n⚠️  IMPORTANT: Update backend services to use this Tenant ID:');
    console.log(`  Replace 'pharma_inc' with '${response.data._id}' in backend services\n`);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  Tenant already exists. Fetching existing tenant...');
      try {
        const getResponse = await apiClient.get('/tenants');
        const existingTenant = getResponse.data.find(t => t.tenant_code === tenant.tenant_code);
        if (existingTenant) {
          console.log('\n✅ Found existing tenant!');
          console.log('\nTenant Details:');
          console.log('  ID:', existingTenant._id);
          console.log('  Code:', existingTenant.tenant_code);
          console.log('  Name:', existingTenant.name);
          console.log('\n⚠️  IMPORTANT: Update backend services to use this Tenant ID:');
          console.log(`  Replace 'pharma_inc' with '${existingTenant._id}' in backend services\n`);
          return existingTenant;
        }
      } catch (fetchError) {
        console.error('❌ Error fetching existing tenant:', fetchError.message);
      }
    } else if (error.response?.status === 403) {
      console.error('\n❌ Permission denied: You need Admin role to create tenants');
      console.log('Please login with an admin account\n');
    } else {
      console.error('\n❌ Error creating tenant:', error.response?.data?.message || error.message);
    }
    process.exit(1);
  }
}

// Run the creation
createTenant().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});



