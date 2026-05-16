#!/bin/bash

# Seed Vendors Script
# This script creates sample vendors in the backend
# Make sure backend is running at http://localhost:3000

API_URL="http://localhost:3000"

# Get the auth token (you'll need to replace with actual token after login)
# Or run this after logging in and getting the token from localStorage
echo "Please provide your auth token (from localStorage after login):"
read AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
  echo "Error: No auth token provided"
  exit 1
fi

echo "Creating sample vendors..."

# Vendor 1: PharmaCorp Ltd
echo "Creating PharmaCorp Ltd..."
curl -X POST "$API_URL/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
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
  }'

echo ""
echo "Creating MedSupply Co..."
curl -X POST "$API_URL/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "vendor_code": "VND-V002",
    "name": "MedSupply Co",
    "legal_name": "MedSupply Co",
    "tax_id": "TAX987654321",
    "address": "456 Healthcare Ave, Chicago, IL, 60601, USA",
    "contact_persons": ["Sarah Wilson"],
    "default_lead_time_days": 10,
    "payment_terms": "Net 15",
    "supported_tax_slabs": ["GST-12"],
    "custom_fields": {
      "industry": "Medical Supplies",
      "rating": "Medium",
      "status": "Active",
      "totalOrders": 32,
      "totalValue": 89000.25,
      "creditLimit": 30000,
      "outstandingBalance": 8500,
      "registrationDate": "2023-03-20",
      "website": "www.medsupply.com",
      "bankName": "Bank of America",
      "accountNumber": "9876543210",
      "ifscCode": "BOFA0009876",
      "phone": "+1-555-0124",
      "email": "sarah@medsupply.com",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60601",
      "country": "USA",
      "category": "Medical Supplies"
    }
  }'

echo ""
echo "Creating HealthEquip Inc..."
curl -X POST "$API_URL/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "vendor_code": "VND-V003",
    "name": "HealthEquip Inc",
    "legal_name": "HealthEquip Inc",
    "tax_id": "TAX456789123",
    "address": "789 Medical Plaza, Los Angeles, CA, 90001, USA",
    "contact_persons": ["Michael Brown"],
    "default_lead_time_days": 21,
    "payment_terms": "Net 45",
    "supported_tax_slabs": ["GST-18"],
    "custom_fields": {
      "industry": "Equipment",
      "rating": "High",
      "status": "Active",
      "totalOrders": 28,
      "totalValue": 156000.75,
      "creditLimit": 75000,
      "outstandingBalance": 25000,
      "registrationDate": "2022-11-10",
      "website": "www.healthequip.com",
      "bankName": "Wells Fargo",
      "accountNumber": "4567891230",
      "ifscCode": "WELL0004567",
      "phone": "+1-555-0125",
      "email": "michael@healthequip.com",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "USA",
      "category": "Equipment"
    }
  }'

echo ""
echo "All vendors created successfully!"



