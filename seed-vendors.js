// Seed Vendors Script for Frontend Testing
// This script creates sample vendors using the backend API
// Usage: node seed-vendors.js <auth-token>

const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get auth token from command line argument
const authToken = process.argv[2];

if (!authToken) {
  console.error('\n❌ Error: Please provide an auth token');
  console.log('\nUsage: node seed-vendors.js <auth-token>');
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

const vendors = [
  {
    vendor_code: 'VND-V001',
    name: 'PharmaCorp Ltd',
    legal_name: 'PharmaCorp Ltd',
    tax_id: 'TAX123456789',
    address: '123 Industrial Blvd, New York, NY, 10001, USA',
    contact_persons: ['John Anderson'],
    default_lead_time_days: 14,
    payment_terms: 'Net 30',
    supported_tax_slabs: ['GST-18'],
    custom_fields: {
      industry: 'Pharmaceuticals',
      rating: 'Low',
      status: 'Active',
      totalOrders: 45,
      totalValue: 125000.5,
      creditLimit: 50000,
      outstandingBalance: 12500,
      registrationDate: '2023-01-15',
      website: 'www.pharmacorp.com',
      bankName: 'Chase Bank',
      accountNumber: '1234567890',
      ifscCode: 'CHAS0001234',
      phone: '+1-555-0123',
      email: 'john@pharmacorp.com',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      category: 'Pharmaceuticals'
    }
  },
  {
    vendor_code: 'VND-V002',
    name: 'MedSupply Co',
    legal_name: 'MedSupply Co',
    tax_id: 'TAX987654321',
    address: '456 Healthcare Ave, Chicago, IL, 60601, USA',
    contact_persons: ['Sarah Wilson'],
    default_lead_time_days: 10,
    payment_terms: 'Net 15',
    supported_tax_slabs: ['GST-12'],
    custom_fields: {
      industry: 'Medical Supplies',
      rating: 'Medium',
      status: 'Active',
      totalOrders: 32,
      totalValue: 89000.25,
      creditLimit: 30000,
      outstandingBalance: 8500,
      registrationDate: '2023-03-20',
      website: 'www.medsupply.com',
      bankName: 'Bank of America',
      accountNumber: '9876543210',
      ifscCode: 'BOFA0009876',
      phone: '+1-555-0124',
      email: 'sarah@medsupply.com',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
      category: 'Medical Supplies'
    }
  },
  {
    vendor_code: 'VND-V003',
    name: 'HealthEquip Inc',
    legal_name: 'HealthEquip Inc',
    tax_id: 'TAX456789123',
    address: '789 Medical Plaza, Los Angeles, CA, 90001, USA',
    contact_persons: ['Michael Brown'],
    default_lead_time_days: 21,
    payment_terms: 'Net 45',
    supported_tax_slabs: ['GST-18'],
    custom_fields: {
      industry: 'Equipment',
      rating: 'High',
      status: 'Active',
      totalOrders: 28,
      totalValue: 156000.75,
      creditLimit: 75000,
      outstandingBalance: 25000,
      registrationDate: '2022-11-10',
      website: 'www.healthequip.com',
      bankName: 'Wells Fargo',
      accountNumber: '4567891230',
      ifscCode: 'WELL0004567',
      phone: '+1-555-0125',
      email: 'michael@healthequip.com',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      category: 'Equipment'
    }
  }
];

async function seedVendors() {
  console.log('\n🌱 Starting vendor seeding...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const vendor of vendors) {
    try {
      const response = await apiClient.post('/vendors', vendor);
      console.log(`✅ Created: ${vendor.name} (${vendor.vendor_code})`);
      successCount++;
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        console.log(`⚠️  Already exists: ${vendor.name} (${vendor.vendor_code})`);
      } else {
        console.error(`❌ Failed to create ${vendor.name}:`, error.response?.data?.message || error.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n✨ Seeding complete!`);
  console.log(`   Successfully created: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total vendors: ${vendors.length}\n`);
}

// Run the seeding
seedVendors().catch(error => {
  console.error('\n❌ Fatal error during seeding:', error.message);
  process.exit(1);
});



