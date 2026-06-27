// Seed data — realistic healthcare demo data
import { store } from './store';

export function seedAll() {
  seedDepartments();
  seedLocations();
  seedTaxSlabs();
  seedVendors();
  seedInventory();
  seedDoctors();
  seedPatients();
  seedRooms();
  seedPurchaseOrders();
  seedSalesOrders();
  seedDiagnosticTests();
  seedDiagnosticBookings();
  seedAdmissions();
  seedInvoices();
  seedAccounts();
  seedJournalEntries();
  seedUsers();
  seedBankAccounts();
  seedMedications();
  seedOpdVisits();
  seedFixedAssets();
  seedPayroll();
  seedNotifications();
}

// ─── Departments ──────────────────────────────────────────────────────────────

function seedDepartments() {
  const depts = [
    'Cardiology','Neurology','Orthopedics','Pediatrics','Oncology',
    'Emergency','Radiology','Pathology','General Medicine','Gynecology',
  ];
  depts.forEach((name, i) => {
    const id = `dept_${i + 1}`;
    store.departments.insert({ _id: id, id, name, code: name.substring(0,3).toUpperCase(), status: 'Active' });
  });
}

// ─── Locations ────────────────────────────────────────────────────────────────
// Shape matches locationService.ts mapLocation():
//   name, code, type, address, city, state, pincode,
//   contact_person, phone, email, is_active, sub_locations

function seedLocations() {
  const locs = [
    { name:'Main Store',    code:'MAIN',  type:'warehouse', address:'Ground Floor, Block A', city:'Mumbai', state:'Maharashtra', pincode:'400001', contact_person:'Rajan Mehta',  phone:'+91 9811100001', sub_locations:[{name:'Shelf A',type:'shelf',capacity:500},{name:'Shelf B',type:'shelf',capacity:500}] },
    { name:'Ward A Store',  code:'WARDA', type:'ward',      address:'First Floor, Ward Block', city:'Mumbai', state:'Maharashtra', pincode:'400001', contact_person:'Sunita Iyer',  phone:'+91 9811100002', sub_locations:[{name:'Medicine Cabinet',type:'cabinet',capacity:200}] },
    { name:'ICU Store',     code:'ICU',   type:'ward',      address:'Second Floor, ICU Block', city:'Mumbai', state:'Maharashtra', pincode:'400001', contact_person:'Dr. Arun Joshi',phone:'+91 9811100003', sub_locations:[] },
    { name:'Pharmacy',      code:'PHARM', type:'pharmacy',  address:'Ground Floor, OPD Block', city:'Mumbai', state:'Maharashtra', pincode:'400001', contact_person:'Priya Kapoor', phone:'+91 9811100004', sub_locations:[{name:'Counter 1',type:'counter',capacity:100},{name:'Cold Storage',type:'refrigerator',capacity:50}] },
    { name:'Lab Store',     code:'LAB',   type:'lab',       address:'Basement, Lab Block',     city:'Mumbai', state:'Maharashtra', pincode:'400001', contact_person:'Vikram Rao',   phone:'+91 9811100005', sub_locations:[{name:'Reagent Storage',type:'shelf',capacity:300}] },
    { name:'OT Store',      code:'OT',    type:'warehouse', address:'Second Floor, OT Block',  city:'Mumbai', state:'Maharashtra', pincode:'400001', contact_person:'Meena Singh',  phone:'+91 9811100006', sub_locations:[] },
  ];
  locs.forEach((l, i) => {
    const id = `loc_${i + 1}`;
    store.locations.insert({
      _id: id, id,
      name: l.name, code: l.code, type: l.type,
      address: l.address, city: l.city, state: l.state, pincode: l.pincode,
      contact_person: l.contact_person, phone: l.phone, email: `${l.code.toLowerCase()}@medsystem.in`,
      is_active: true,
      sub_locations: l.sub_locations,
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });
}

// ─── Tax Slabs ────────────────────────────────────────────────────────────────

function seedTaxSlabs() {
  const slabs = [
    { name: 'GST 5%',  rate: 5,  description: 'Medicines & basic medical equipment' },
    { name: 'GST 12%', rate: 12, description: 'Medical devices' },
    { name: 'GST 18%', rate: 18, description: 'Premium equipment & services' },
    { name: 'Exempt',  rate: 0,  description: 'Exempt from GST' },
  ];
  slabs.forEach((s, i) => {
    const id = `tax_${i + 1}`;
    store.taxSlabs.insert({ _id: id, id, ...s, createdAt: '2024-01-01T00:00:00.000Z' });
  });
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

function seedVendors() {
  const vendors = [
    { code:'VND001', name:'Sun Pharmaceuticals', category:'Pharmaceutical', city:'Mumbai', state:'Maharashtra', gst:'27AABCS1234A1Z5', status:'Active', rating:'Low', balance:45000 },
    { code:'VND002', name:'Cipla Ltd', category:'Pharmaceutical', city:'Mumbai', state:'Maharashtra', gst:'27AABCC5678B2Z6', status:'Active', rating:'Low', balance:32000 },
    { code:'VND003', name:'Medtronic India', category:'Medical Devices', city:'Hyderabad', state:'Telangana', gst:'36AABCM3456C3Z7', status:'Active', rating:'Medium', balance:125000 },
    { code:'VND004', name:'Siemens Healthineers', category:'Diagnostics Equipment', city:'Delhi', state:'Delhi', gst:'07AABCS7890D4Z8', status:'Active', rating:'Low', balance:280000 },
    { code:'VND005', name:'Johnson & Johnson India', category:'Surgical Supplies', city:'Bangalore', state:'Karnataka', gst:'29AABCJ2345E5Z9', status:'Active', rating:'Low', balance:67000 },
    { code:'VND006', name:'Abbott Healthcare', category:'Diagnostics', city:'Mumbai', state:'Maharashtra', gst:'27AABCA6789F6Z1', status:'Active', rating:'Low', balance:89000 },
    { code:'VND007', name:'Rexnord Healthcare', category:'Medical Devices', city:'Pune', state:'Maharashtra', gst:'27AABCR1234G7Z2', status:'Inactive', rating:'High', balance:0 },
    { code:'VND008', name:'Baxter India', category:'IV Solutions', city:'Ahmedabad', state:'Gujarat', gst:'24AABCB5678H8Z3', status:'Active', rating:'Medium', balance:54000 },
  ];
  vendors.forEach((v, i) => {
    const id = `vendor_${i + 1}`;
    store.vendors.insert({
      _id: id,
      vendor_code: v.code,
      name: v.name,
      legal_name: v.name,
      tax_id: v.gst,
      address: `123 Industrial Area, ${v.city}, ${v.state}`,
      contact_persons: [`Contact Person ${i + 1}`],
      default_lead_time_days: 7 + (i % 7),
      payment_terms: i % 2 === 0 ? 'Net-30' : 'Net-60',
      custom_fields: {
        phone: `+91 98${String(10000000 + i * 1111111).substring(0,8)}`,
        email: `procurement@${v.name.toLowerCase().replace(/\s+/g, '')}.com`,
        city: v.city,
        state: v.state,
        zipCode: String(400000 + i * 1000),
        country: 'India',
        category: v.category,
        status: v.status,
        rating: v.rating,
        riskLevel: v.rating,
        totalOrders: 10 + i * 5,
        totalValue: 500000 + i * 100000,
        outstandingBalance: v.balance,
        creditLimit: 500000,
        gstNumber: v.gst,
        website: `https://www.${v.name.toLowerCase().replace(/\s+/g,'')}.com`,
        registrationDate: '2023-01-15',
      },
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-06-01T10:00:00.000Z',
    });
  });
}

// ─── Inventory ────────────────────────────────────────────────────────────────

function seedInventory() {
  const items = [
    { name:'Paracetamol 500mg', cat:'Medicines', sku:'MED001', stock:500, min:50, max:1000, price:2.5, supplier:'Sun Pharmaceuticals', exp:'2026-12-31', unit:'Strip' },
    { name:'Amoxicillin 250mg', cat:'Medicines', sku:'MED002', stock:200, min:30, max:500, price:8.0, supplier:'Cipla Ltd', exp:'2026-06-30', unit:'Strip' },
    { name:'IV Cannula 20G',    cat:'Consumables', sku:'CON001', stock:1000, min:200, max:2000, price:12.0, supplier:'Johnson & Johnson India', exp:'2027-01-01', unit:'Box' },
    { name:'Surgical Gloves L', cat:'Consumables', sku:'CON002', stock:5000, min:500, max:10000, price:3.5, supplier:'Johnson & Johnson India', exp:'2027-06-01', unit:'Pair' },
    { name:'BP Monitor Digital',cat:'Equipment', sku:'EQP001', stock:25, min:5, max:50, price:2500, supplier:'Medtronic India', exp:'', unit:'Unit' },
    { name:'Pulse Oximeter',    cat:'Equipment', sku:'EQP002', stock:30, min:5, max:60, price:1800, supplier:'Medtronic India', exp:'', unit:'Unit' },
    { name:'Insulin Syringe 1ml',cat:'Consumables',sku:'CON003',stock:2000,min:300,max:5000,price:4.0, supplier:'Baxter India', exp:'2026-09-30', unit:'Box' },
    { name:'Normal Saline 500ml',cat:'IV Solutions',sku:'IVS001',stock:800,min:100,max:1500,price:35, supplier:'Baxter India', exp:'2026-08-15', unit:'Bottle' },
    { name:'Betadine Solution',  cat:'Antiseptics',sku:'ANT001',stock:150,min:20,max:300,price:85, supplier:'Abbott Healthcare', exp:'2026-11-30', unit:'Bottle' },
    { name:'ECG Machine',        cat:'Equipment', sku:'EQP003', stock:3, min:1, max:10, price:45000, supplier:'Siemens Healthineers', exp:'', unit:'Unit' },
    { name:'Dextrose 5% 500ml',  cat:'IV Solutions',sku:'IVS002',stock:600,min:100,max:1200,price:42, supplier:'Baxter India', exp:'2026-07-20', unit:'Bottle' },
    { name:'Metformin 500mg',    cat:'Medicines', sku:'MED003', stock:400, min:50, max:800, price:3.2, supplier:'Cipla Ltd', exp:'2026-10-15', unit:'Strip' },
    { name:'Disposable Mask N95',cat:'PPE', sku:'PPE001', stock:3000, min:500, max:6000, price:18, supplier:'Johnson & Johnson India', exp:'2027-03-01', unit:'Box' },
    { name:'Thermometer Digital',cat:'Equipment', sku:'EQP004', stock:40, min:10, max:80, price:350, supplier:'Medtronic India', exp:'', unit:'Unit' },
    { name:'Atorvastatin 10mg',  cat:'Medicines', sku:'MED004', stock:8, min:30, max:600, price:6.5, supplier:'Sun Pharmaceuticals', exp:'2026-05-31', unit:'Strip' },
  ];
  items.forEach((item, i) => {
    const id = `inv_${i + 1}`;
    store.inventory.insert({
      _id: id,
      name: item.name,
      category: item.cat,
      sku: item.sku,
      current_stock: item.stock,
      min_stock_level: item.min,
      max_stock_level: item.max,
      unit_price: item.price,
      supplier: item.supplier,
      manufacturer: item.supplier,
      expiry_date: item.exp || undefined,
      batch_number: `BATCH${String(2024001 + i)}`,
      location: 'Main Store',
      description: `${item.name} - standard hospital supply`,
      sale_unit: item.unit,
      barcode: `BC${String(1000000 + i)}`,
      createdAt: '2024-01-20T08:00:00.000Z',
      updatedAt: '2024-06-10T08:00:00.000Z',
    });
  });
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

function seedDoctors() {
  const docs = [
    { name:'Dr. Priya Sharma',    dept:'Cardiology',       spec:'Interventional Cardiology', exp:12, fee:800, status:'Active', gender:'Female', reg:'MCI/2012/1234' },
    { name:'Dr. Rajesh Kumar',    dept:'Neurology',        spec:'Stroke & Epilepsy',         exp:15, fee:900, status:'Active', gender:'Male',   reg:'MCI/2009/5678' },
    { name:'Dr. Anita Mehta',     dept:'Orthopedics',      spec:'Joint Replacement',         exp:10, fee:750, status:'Active', gender:'Female', reg:'MCI/2014/9012' },
    { name:'Dr. Suresh Patel',    dept:'Pediatrics',       spec:'Neonatology',               exp:8,  fee:600, status:'Active', gender:'Male',   reg:'MCI/2016/3456' },
    { name:'Dr. Deepa Nair',      dept:'Oncology',         spec:'Breast Oncology',           exp:14, fee:1000,status:'Active', gender:'Female', reg:'MCI/2010/7890' },
    { name:'Dr. Vikram Singh',    dept:'General Medicine', spec:'Internal Medicine',         exp:7,  fee:500, status:'On Leave',gender:'Male',  reg:'MCI/2017/2345' },
    { name:'Dr. Kavitha Reddy',   dept:'Gynecology',       spec:'High-Risk Pregnancy',       exp:11, fee:700, status:'Active', gender:'Female', reg:'MCI/2013/6789' },
    { name:'Dr. Arun Joshi',      dept:'Emergency',        spec:'Emergency Medicine',        exp:9,  fee:600, status:'Active', gender:'Male',   reg:'MCI/2015/1234' },
  ];
  docs.forEach((d, i) => {
    const id = `doctor_${i + 1}`;
    store.doctors.insert({
      _id: id,
      employee_id: `EMP${String(1001 + i)}`,
      name: d.name,
      gender: d.gender,
      dob: `${1960 + i * 2}-0${(i % 9) + 1}-15`,
      phone: `+91 99${String(10000000 + i * 1234567).substring(0,8)}`,
      email: `${d.name.toLowerCase().replace(/^dr\. /,'').replace(/\s+/g,'.')}@medsystem.in`,
      department: d.dept,
      specialisation: d.spec,
      qualification: ['MBBS', i % 2 === 0 ? 'MD' : 'MS', 'DNB'],
      experience: d.exp,
      status: d.status.toLowerCase().replace(' ', '_'),
      schedule: [
        { day: 'mon', start_time: '09:00', end_time: '13:00' },
        { day: 'wed', start_time: '09:00', end_time: '13:00' },
        { day: 'fri', start_time: '14:00', end_time: '18:00' },
      ],
      consultation_fee: d.fee,
      opd_slots: 20,
      active_patients: 5 + i * 3,
      join_date: `${2010 + i}-03-01`,
      registration_no: d.reg,
      bio: `${d.name} is a renowned ${d.spec} specialist with ${d.exp} years of experience.`,
      languages: ['English', 'Hindi'],
      createdAt: '2024-01-05T09:00:00.000Z',
      updatedAt: '2024-06-01T09:00:00.000Z',
    });
  });
}

// ─── Patients ─────────────────────────────────────────────────────────────────

function seedPatients() {
  const patients = [
    { first:'Rahul',  last:'Verma',     gender:'Male',   dob:'1985-04-12', phone:'+91 9811234567', blood:'B+', dept:'Cardiology',      status:'active' },
    { first:'Sunita', last:'Agarwal',   gender:'Female', dob:'1970-09-23', phone:'+91 9822345678', blood:'O+', dept:'Neurology',        status:'admitted' },
    { first:'Mohan',  last:'Das',       gender:'Male',   dob:'1992-01-07', phone:'+91 9833456789', blood:'A-', dept:'General Medicine', status:'active' },
    { first:'Priti',  last:'Kapoor',    gender:'Female', dob:'1988-06-30', phone:'+91 9844567890', blood:'AB+',dept:'Gynecology',       status:'active' },
    { first:'Arjun',  last:'Malhotra',  gender:'Male',   dob:'1975-11-18', phone:'+91 9855678901', blood:'O-', dept:'Orthopedics',      status:'discharged' },
    { first:'Kavya',  last:'Reddy',     gender:'Female', dob:'2001-03-25', phone:'+91 9866789012', blood:'B-', dept:'Pediatrics',       status:'active' },
    { first:'Ramesh', last:'Gupta',     gender:'Male',   dob:'1960-07-14', phone:'+91 9877890123', blood:'A+', dept:'Oncology',         status:'critical' },
    { first:'Nisha',  last:'Sharma',    gender:'Female', dob:'1995-12-02', phone:'+91 9888901234', blood:'O+', dept:'General Medicine', status:'active' },
    { first:'Vivek',  last:'Jain',      gender:'Male',   dob:'1980-08-19', phone:'+91 9899012345', blood:'AB-',dept:'Emergency',        status:'admitted' },
    { first:'Ananya', last:'Pillai',    gender:'Female', dob:'1993-05-06', phone:'+91 9800123456', blood:'B+', dept:'General Medicine', status:'registered' },
    { first:'Santosh',last:'Yadav',     gender:'Male',   dob:'1968-02-28', phone:'+91 9811234568', blood:'O+', dept:'Cardiology',       status:'active' },
    { first:'Meena',  last:'Iyer',      gender:'Female', dob:'1972-10-11', phone:'+91 9822345679', blood:'A+', dept:'Neurology',        status:'active' },
  ];
  patients.forEach((p, i) => {
    const id = `patient_${i + 1}`;
    store.patients.insert({
      _id: id,
      patient_id: `PAT${String(2024001 + i)}`,
      first_name: p.first,
      last_name: p.last,
      gender: p.gender,
      dob: p.dob,
      phone: p.phone,
      email: `${p.first.toLowerCase()}.${p.last.toLowerCase()}@email.com`,
      address: `Flat ${i + 1}, MG Road, Mumbai - 400001`,
      blood_group: p.blood,
      department: p.dept,
      status: p.status,
      emergency_contact_name: `Family of ${p.first}`,
      emergency_contact_phone: `+91 98${String(11111111 + i)}`,
      allergies: i % 3 === 0 ? ['Penicillin'] : [],
      existing_conditions: i % 4 === 0 ? ['Diabetes', 'Hypertension'] : (i % 4 === 1 ? ['Hypertension'] : []),
      createdAt: `2024-0${(i % 9) + 1}-${String(10 + i).padStart(2,'0')}T10:00:00.000Z`,
      updatedAt: '2024-06-15T10:00:00.000Z',
    });
  });
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

function seedRooms() {
  const rooms = [
    { num:'101', type:'General',  ward:'Ward A', floor:'First',  beds:4, avail:2, rate:1500 },
    { num:'102', type:'General',  ward:'Ward A', floor:'First',  beds:4, avail:1, rate:1500 },
    { num:'201', type:'Semi-Private', ward:'Ward B', floor:'Second', beds:2, avail:1, rate:2500 },
    { num:'202', type:'Semi-Private', ward:'Ward B', floor:'Second', beds:2, avail:2, rate:2500 },
    { num:'301', type:'Private',  ward:'Ward C', floor:'Third',  beds:1, avail:0, rate:4500 },
    { num:'302', type:'Private',  ward:'Ward C', floor:'Third',  beds:1, avail:1, rate:4500 },
    { num:'ICU1',type:'ICU',      ward:'ICU',    floor:'Second', beds:1, avail:0, rate:12000 },
    { num:'ICU2',type:'ICU',      ward:'ICU',    floor:'Second', beds:1, avail:1, rate:12000 },
  ];
  rooms.forEach((r, i) => {
    const id = `room_${i + 1}`;
    store.rooms.insert({
      _id: id,
      room_number: r.num,
      type: r.type,
      ward: r.ward,
      floor: r.floor,
      total_beds: r.beds,
      available_beds: r.avail,
      rate_per_day: r.rate,
      status: r.avail > 0 ? 'Available' : 'Full',
      facilities: ['AC', 'Attached Bathroom'],
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

function seedPurchaseOrders() {
  const statuses = ['pending','approved','fulfilled','partial','cancelled'];
  const vendorIds = Array.from({ length: 6 }, (_, i) => `vendor_${i + 1}`);
  const invIds = Array.from({ length: 10 }, (_, i) => `inv_${i + 1}`);
  const poData = [
    { vendor: vendorIds[0], status:'fulfilled', total:25000, paid:25000 },
    { vendor: vendorIds[1], status:'approved',  total:18500, paid:0 },
    { vendor: vendorIds[2], status:'pending',   total:42000, paid:0 },
    { vendor: vendorIds[3], status:'partial',   total:85000, paid:42500 },
    { vendor: vendorIds[4], status:'fulfilled', total:12000, paid:12000 },
    { vendor: vendorIds[5], status:'pending',   total:31000, paid:0 },
    { vendor: vendorIds[0], status:'approved',  total:56000, paid:0 },
    { vendor: vendorIds[1], status:'cancelled', total:9800,  paid:0 },
  ];
  poData.forEach((po, i) => {
    const id = `po_${i + 1}`;
    const orderDate = new Date(Date.now() - (30 - i * 3) * 86400000);
    const vendorRecord = store.vendors.findById(po.vendor);
    store.purchaseOrders.insert({
      _id: id,
      po_number: `PO-2024-${String(1001 + i)}`,
      vendor_id: po.vendor,
      vendor_name: vendorRecord?.name || 'Vendor',
      vendor_phone: vendorRecord?.custom_fields?.phone || '',
      vendor_email: vendorRecord?.custom_fields?.email || '',
      status: po.status,
      order_date: orderDate.toISOString(),
      expected_delivery_date: new Date(orderDate.getTime() + 14 * 86400000).toISOString(),
      total_amount: po.total,
      paid_amount: po.paid,
      payment_method: i % 2 === 0 ? 'bank_transfer' : 'cheque',
      items: [
        { _id:`poi_${id}_1`, item_id: invIds[i % 10], name: store.inventory.findById(invIds[i % 10])?.name || 'Item', qty: 10 + i * 5, unit_price: po.total / (15 + i * 5), discount: 0, subtotal: po.total * 0.6 },
        { _id:`poi_${id}_2`, item_id: invIds[(i + 1) % 10], name: store.inventory.findById(invIds[(i + 1) % 10])?.name || 'Item', qty: 5 + i, unit_price: po.total / (10 + i), discount: 0, subtotal: po.total * 0.4 },
      ],
      notes: i % 3 === 0 ? 'Urgent delivery required' : '',
      shipping_address: 'MedSystem Hospital, Main Gate, Mumbai - 400001',
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString(),
    });
  });
}

// ─── Sales Orders ─────────────────────────────────────────────────────────────

function seedSalesOrders() {
  const soData = [
    { customer:'Apollo Pharmacy', status:'fulfilled', total:8500, paid:8500 },
    { customer:'MedPlus Stores',  status:'pending',   total:12300, paid:0 },
    { customer:'Fortis Hospital', status:'approved',  total:34000, paid:17000 },
    { customer:'Max Healthcare',  status:'partial',   total:21000, paid:10500 },
    { customer:'Narayana Hrudayalaya', status:'fulfilled', total:5600, paid:5600 },
    { customer:'Columbia Asia',   status:'pending',   total:9200,  paid:0 },
  ];
  soData.forEach((so, i) => {
    const id = `so_${i + 1}`;
    const orderDate  = new Date(Date.now() - (20 - i * 3) * 86400000);
    const delivDate  = new Date(orderDate.getTime() + 7 * 86400000);
    store.salesOrders.insert({
      _id: id,
      so_number:     `SO-2024-${String(2001 + i)}`,
      customer_name: so.customer,
      customer_email: `orders@${so.customer.toLowerCase().replace(/\s+/g, '')}.com`,
      customer_phone: `+91 80${String(10000000 + i * 1111111).substring(0, 8)}`,
      // Use the status values that mapSalesOrder STATUS_MAP recognises
      status:         so.status,
      order_date:     orderDate.toISOString().split('T')[0],
      delivery_date:  delivDate.toISOString().split('T')[0],
      due_date:       delivDate.toISOString().split('T')[0],
      // grand_total is what mapSalesOrder reads: raw.grand_total ?? raw.total ?? 0
      grand_total:    so.total,
      total_amount:   so.total,
      paid_amount:    so.paid,
      payment_method: 'bank_transfer',
      payment_status: so.paid === so.total ? 'paid' : (so.paid > 0 ? 'partial' : 'pending'),
      items: [
        { _id: `soi_${id}_1`, item_id: 'inv_1', name: 'Paracetamol 500mg', qty: 100, unit_price: so.total * 0.5 / 100, discount: 0, subtotal: so.total * 0.5 },
        { _id: `soi_${id}_2`, item_id: 'inv_3', name: 'IV Cannula 20G',    qty: 20,  unit_price: so.total * 0.5 / 20,  discount: 0, subtotal: so.total * 0.5 },
      ],
      shipping_address: `${so.customer}, Distribution Centre, India`,
      notes: '',
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString(),
    });
  });
}

// ─── Diagnostic Tests ─────────────────────────────────────────────────────────

function seedDiagnosticTests() {
  const tests = [
    { name:'Complete Blood Count (CBC)', cat:'Blood Test',   dept:'Pathology',  price:350,  dur:'2 hours',   prep:'No special preparation needed' },
    { name:'Lipid Profile',             cat:'Blood Test',   dept:'Pathology',  price:550,  dur:'4 hours',   prep:'12-hour fasting required' },
    { name:'Blood Glucose (Fasting)',   cat:'Blood Test',   dept:'Pathology',  price:120,  dur:'2 hours',   prep:'8-hour fasting required' },
    { name:'HbA1c',                     cat:'Blood Test',   dept:'Pathology',  price:480,  dur:'4 hours',   prep:'No special preparation needed' },
    { name:'Thyroid Profile (TSH,T3,T4)',cat:'Blood Test',  dept:'Pathology',  price:650,  dur:'4 hours',   prep:'Morning sample preferred' },
    { name:'Chest X-Ray',               cat:'X-Ray',        dept:'Radiology',  price:300,  dur:'30 minutes',prep:'Remove metal objects' },
    { name:'ECG',                       cat:'Cardiology',   dept:'Cardiology', price:250,  dur:'15 minutes',prep:'No special preparation needed' },
    { name:'Echocardiogram',            cat:'Cardiology',   dept:'Cardiology', price:2500, dur:'45 minutes',prep:'No special preparation needed' },
    { name:'Ultrasound Abdomen',        cat:'Ultrasound',   dept:'Radiology',  price:800,  dur:'30 minutes',prep:'Full bladder required' },
    { name:'MRI Brain',                 cat:'MRI',          dept:'Radiology',  price:6500, dur:'60 minutes',prep:'Remove metal objects, claustrophobia screening' },
    { name:'CT Scan Chest',             cat:'CT Scan',      dept:'Radiology',  price:5000, dur:'30 minutes',prep:'Contrast dye allergy check' },
    { name:'Urine Routine Examination', cat:'Pathology',    dept:'Pathology',  price:150,  dur:'2 hours',   prep:'Mid-stream urine sample' },
  ];
  tests.forEach((t, i) => {
    const id = `test_${i + 1}`;
    store.diagnosticTests.insert({
      _id: id,
      name: t.name,
      category: t.cat,
      price: t.price,
      duration: t.dur,
      preparation: t.prep,
      department: t.dept,
      description: `${t.name} - standard diagnostic procedure`,
      status: 'Active',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });
}

// ─── Diagnostic Bookings ──────────────────────────────────────────────────────

function seedDiagnosticBookings() {
  const bookingData = [
    { patient:'patient_1', patName:'Rahul Verma',   test:'test_1', testName:'Complete Blood Count (CBC)', doctor:'Dr. Priya Sharma', status:'completed', priority:'Routine', price:350 },
    { patient:'patient_2', patName:'Sunita Agarwal',test:'test_5', testName:'Thyroid Profile',             doctor:'Dr. Rajesh Kumar', status:'in_progress', priority:'Urgent', price:650 },
    { patient:'patient_3', patName:'Mohan Das',     test:'test_7', testName:'ECG',                        doctor:'Dr. Arun Joshi',   status:'scheduled',   priority:'Routine', price:250 },
    { patient:'patient_4', patName:'Priti Kapoor',  test:'test_9', testName:'Ultrasound Abdomen',         doctor:'Dr. Kavitha Reddy',status:'pending',     priority:'Routine', price:800 },
    { patient:'patient_5', patName:'Arjun Malhotra',test:'test_6', testName:'Chest X-Ray',                doctor:'Dr. Anita Mehta',  status:'completed',   priority:'Routine', price:300 },
    { patient:'patient_7', patName:'Ramesh Gupta',  test:'test_10',testName:'MRI Brain',                  doctor:'Dr. Deepa Nair',   status:'scheduled',   priority:'Emergency', price:6500 },
    { patient:'patient_9', patName:'Vivek Jain',    test:'test_2', testName:'Lipid Profile',              doctor:'Dr. Priya Sharma', status:'pending',     priority:'Urgent', price:550 },
    { patient:'patient_1', patName:'Rahul Verma',   test:'test_8', testName:'Echocardiogram',             doctor:'Dr. Priya Sharma', status:'scheduled',   priority:'Routine', price:2500 },
  ];
  bookingData.forEach((b, i) => {
    const id = `booking_${i + 1}`;
    const orderedDate = new Date(Date.now() - (15 - i * 2) * 86400000);
    store.diagnosticBookings.insert({
      _id: id,
      patient_id: b.patient,
      patient_name: b.patName,
      test_id: b.test,
      test_name: b.testName,
      category: store.diagnosticTests.findById(b.test)?.category || 'Blood Test',
      ordered_by: b.doctor,
      ordered_date: orderedDate.toISOString(),
      scheduled_date: new Date(orderedDate.getTime() + 2 * 86400000).toISOString().split('T')[0],
      scheduled_time: '10:00',
      status: b.status,
      priority: b.priority.toLowerCase(),
      price: b.price,
      results: b.status === 'completed' ? 'Results within normal range. No significant findings.' : undefined,
      notes: '',
      createdAt: orderedDate.toISOString(),
      updatedAt: orderedDate.toISOString(),
    });
  });
}

// ─── Admissions ───────────────────────────────────────────────────────────────

function seedAdmissions() {
  const admData = [
    { patient:'patient_2', room:'room_1', doctor:'doctor_1', type:'emergency', status:'active' },
    { patient:'patient_9', room:'room_2', doctor:'doctor_8', type:'planned',   status:'active' },
    { patient:'patient_7', room:'room_7', doctor:'doctor_5', type:'emergency', status:'active' },
    { patient:'patient_5', room:'room_3', doctor:'doctor_3', type:'planned',   status:'discharged' },
  ];
  admData.forEach((a, i) => {
    const id = `adm_${i + 1}`;
    const admDate = new Date(Date.now() - (10 - i * 3) * 86400000);
    store.admissions.insert({
      _id: id,
      admission_number: `ADM-2024-${String(3001 + i)}`,
      patient_id: a.patient,
      room_id: a.room,
      doctor_id: a.doctor,
      admission_date: admDate.toISOString(),
      expected_discharge_date: new Date(admDate.getTime() + 7 * 86400000).toISOString(),
      actual_discharge_date: a.status === 'discharged' ? new Date(admDate.getTime() + 5 * 86400000).toISOString() : undefined,
      admission_type: a.type,
      status: a.status,
      payment_mode: 'cash',
      notes: '',
      createdAt: admDate.toISOString(),
      updatedAt: admDate.toISOString(),
    });
  });
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
// Shape must match invoiceService.ts mapInvoice() — key fields:
// invoice_number, customer_name/vendor_name, amount, grand_total, paid_amount,
// status, invoice_date, due_date, order_date, source_type, items, tax_breakdown

function seedInvoices() {
  // Customer invoices (AR — sales / admissions)
  const customerInvoices = [
    { patient:'patient_1', name:'Rahul Verma',    amount:5200,  paid:5200,  status:'paid',             sourceType:'admission',   daysAgo:30 },
    { patient:'patient_2', name:'Sunita Agarwal', amount:18500, paid:9250,  status:'partially_paid',   sourceType:'admission',   daysAgo:25 },
    { patient:'patient_3', name:'Mohan Das',       amount:3400,  paid:0,     status:'pending',          sourceType:'diagnostic_booking', daysAgo:20 },
    { patient:'patient_5', name:'Arjun Malhotra', amount:12000, paid:12000, status:'paid',             sourceType:'sales_order', daysAgo:15 },
    { patient:'patient_7', name:'Ramesh Gupta',   amount:45000, paid:0,     status:'pending',          sourceType:'admission',   daysAgo:45 },
    { patient:'patient_9', name:'Vivek Jain',     amount:22000, paid:22000, status:'paid',             sourceType:'admission',   daysAgo:10 },
    { patient:'patient_4', name:'Priti Kapoor',   amount:8500,  paid:0,     status:'overdue',          sourceType:'diagnostic_booking', daysAgo:60 },
    { patient:'patient_8', name:'Nisha Sharma',   amount:3200,  paid:3200,  status:'paid',             sourceType:'sales_order', daysAgo:5 },
  ];

  // Vendor invoices (AP — purchase orders)
  const vendorInvoices = [
    { vendor:'vendor_1', vendorName:'Sun Pharmaceuticals',    amount:185000, paid:185000, status:'paid',   daysAgo:35 },
    { vendor:'vendor_3', vendorName:'Medtronic India',        amount:62000,  paid:0,      status:'pending', daysAgo:20 },
    { vendor:'vendor_4', vendorName:'Siemens Healthineers',   amount:280000, paid:140000, status:'partially_paid', daysAgo:50 },
    { vendor:'vendor_2', vendorName:'Cipla Ltd',              amount:44000,  paid:44000,  status:'paid',   daysAgo:12 },
  ];

  customerInvoices.forEach((inv, i) => {
    const id       = `inv_bill_${i + 1}`;
    const billDate = new Date(Date.now() - inv.daysAgo * 86400000);
    const dueDate  = new Date(billDate.getTime() + 30 * 86400000);
    const subtotal = Math.round(inv.amount / 1.05);
    const tax      = inv.amount - subtotal;

    store.invoices.insert({
      _id:            id,
      invoice_number: `INV-2026-${String(5001 + i)}`,
      source_type:    inv.sourceType,
      source_number:  `SRC-${String(1001 + i)}`,
      // Customer fields (used by AR aging fallback in financeReportService)
      customer_id:    inv.patient,
      customer_name:  inv.name,
      customer_phone: '',
      customer_email: `${inv.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      patient_id:     inv.patient,
      patient_name:   inv.name,
      // Financials
      subtotal,
      total_tax:      tax,
      total_discount: 0,
      amount:         inv.amount,
      grand_total:    inv.amount,
      paid_amount:    inv.paid,
      status:         inv.status,
      // GST
      seller_gstin:   '27AABCM1234A1Z5',
      buyer_gstin:    '',
      place_of_supply: 'Maharashtra',
      is_inter_state: false,
      invoice_type:   'tax_invoice',
      tax_breakdown: [
        { rate: 5, taxable_amount: subtotal, cgst: tax / 2, sgst: tax / 2, igst: 0, total_tax: tax },
      ],
      // Dates
      invoice_date:   billDate.toISOString(),
      order_date:     billDate.toISOString(),
      due_date:       dueDate.toISOString(),
      payment_method: 'cash',
      shipping_address: '',
      notes: '',
      // Line items
      items: [
        { name: 'Consultation fee', description: 'Doctor consultation', quantity: 1, unit_price: Math.round(subtotal * 0.3), subtotal: Math.round(subtotal * 0.3), total: Math.round(subtotal * 0.3) },
        { name: 'Diagnostics',      description: 'Lab tests',           quantity: 1, unit_price: Math.round(subtotal * 0.4), subtotal: Math.round(subtotal * 0.4), total: Math.round(subtotal * 0.4) },
        { name: 'Medicines',        description: 'Prescribed drugs',    quantity: 1, unit_price: Math.round(subtotal * 0.2), subtotal: Math.round(subtotal * 0.2), total: Math.round(subtotal * 0.2) },
        { name: 'Room charges',     description: 'Ward charges',        quantity: 1, unit_price: Math.round(subtotal * 0.1), subtotal: Math.round(subtotal * 0.1), total: Math.round(subtotal * 0.1) },
      ],
      createdAt: billDate.toISOString(),
      updatedAt: billDate.toISOString(),
    });
  });

  vendorInvoices.forEach((inv, i) => {
    const id       = `inv_vendor_${i + 1}`;
    const billDate = new Date(Date.now() - inv.daysAgo * 86400000);
    const dueDate  = new Date(billDate.getTime() + 30 * 86400000);

    store.invoices.insert({
      _id:            id,
      invoice_number: `VINV-2026-${String(6001 + i)}`,
      source_type:    'purchase_order',
      source_number:  `PO-2026-${String(1001 + i)}`,
      vendor_id:      inv.vendor,
      vendor_name:    inv.vendorName,
      customer_name:  '',
      subtotal:       Math.round(inv.amount / 1.12),
      total_tax:      inv.amount - Math.round(inv.amount / 1.12),
      total_discount: 0,
      amount:         inv.amount,
      grand_total:    inv.amount,
      paid_amount:    inv.paid,
      status:         inv.status,
      invoice_date:   billDate.toISOString(),
      order_date:     billDate.toISOString(),
      due_date:       dueDate.toISOString(),
      payment_method: 'bank_transfer',
      tax_breakdown:  [],
      items:          [],
      notes: '',
      createdAt: billDate.toISOString(),
      updatedAt: billDate.toISOString(),
    });
  });
}

// ─── Chart of Accounts ────────────────────────────────────────────────────────
// Shape matches accountService.ts mapAccount():
//   account_code, account_name, account_type, account_sub_type, is_active, balance

function seedAccounts() {
  // account_type values: asset | liability | equity | revenue | expense
  // account_sub_type:    cash | bank | accounts_receivable | current_asset | fixed_asset |
  //                      accounts_payable | current_liability | long_term_liability |
  //                      owners_equity | retained_earnings |
  //                      operating_revenue | other_income |
  //                      cogs | operating_expense | other_expense
  const accounts = [
    { id:'acc_1',  code:'1001', name:'Cash in Hand',               type:'asset',     subtype:'cash',                balance: 125000 },
    { id:'acc_2',  code:'1002', name:'HDFC Current Account',       type:'asset',     subtype:'bank',                balance:4250000 },
    { id:'acc_3',  code:'1100', name:'Accounts Receivable',        type:'asset',     subtype:'accounts_receivable', balance: 820000 },
    { id:'acc_4',  code:'1200', name:'Pharmaceutical Inventory',   type:'asset',     subtype:'current_asset',       balance:1350000 },
    { id:'acc_5',  code:'1500', name:'Medical Equipment',          type:'asset',     subtype:'fixed_asset',         balance:8500000 },
    { id:'acc_6',  code:'2001', name:'Accounts Payable',           type:'liability', subtype:'accounts_payable',    balance: 430000 },
    { id:'acc_7',  code:'2002', name:'GST Payable',                type:'liability', subtype:'current_liability',   balance: 215000 },
    { id:'acc_8',  code:'2100', name:'Bank Loan - HDFC',           type:'liability', subtype:'long_term_liability', balance:3000000 },
    { id:'acc_9',  code:'3001', name:"Owner's Capital",            type:'equity',    subtype:'owners_equity',       balance:5000000 },
    { id:'acc_10', code:'3002', name:'Retained Earnings',          type:'equity',    subtype:'retained_earnings',   balance:6610000 },
    { id:'acc_11', code:'4001', name:'OPD Consultation Revenue',   type:'revenue',   subtype:'operating_revenue',   balance:1850000 },
    { id:'acc_12', code:'4002', name:'Diagnostic Revenue',         type:'revenue',   subtype:'operating_revenue',   balance: 975000 },
    { id:'acc_13', code:'4003', name:'Pharmacy Sales',             type:'revenue',   subtype:'operating_revenue',   balance:1240000 },
    { id:'acc_14', code:'4100', name:'Interest Income',            type:'revenue',   subtype:'other_income',        balance:  45000 },
    { id:'acc_15', code:'5001', name:'Cost of Medicines Sold',     type:'expense',   subtype:'cogs',                balance: 680000 },
    { id:'acc_16', code:'5100', name:'Staff Salaries',             type:'expense',   subtype:'operating_expense',   balance: 920000 },
    { id:'acc_17', code:'5101', name:'Utilities Expense',          type:'expense',   subtype:'operating_expense',   balance: 145000 },
    { id:'acc_18', code:'5102', name:'Medical Supplies Expense',   type:'expense',   subtype:'operating_expense',   balance: 230000 },
    { id:'acc_19', code:'5200', name:'Bank Interest Expense',      type:'expense',   subtype:'other_expense',       balance:  88000 },
  ];

  accounts.forEach(a => {
    store.accounts.insert({
      _id:              a.id,
      id:               a.id,
      account_code:     a.code,
      account_name:     a.name,
      // Both shapes so misc.ts handlers and financeReportService both work
      accountCode:      a.code,
      accountName:      a.name,
      account_type:     a.type,
      accountType:      a.type,
      account_sub_type: a.subtype,
      accountSubType:   a.subtype,
      description:      `${a.name} account`,
      is_active:        true,
      isActive:         true,
      balance:          a.balance,
      createdAt:        '2026-01-01T00:00:00.000Z',
      updatedAt:        '2026-06-01T00:00:00.000Z',
    });
  });
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

function seedJournalEntries() {
  const entries = [
    { ref:'JE-2024-001', desc:'Monthly salary disbursement',          debitAcc:'Staff Salaries', creditAcc:'Cash & Bank', amount:620000, status:'posted' },
    { ref:'JE-2024-002', desc:'Medical supplies purchase',            debitAcc:'Medical Supplies',creditAcc:'Accounts Payable', amount:182000, status:'posted' },
    { ref:'JE-2024-003', desc:'Consultation revenue for May',         debitAcc:'Cash & Bank',    creditAcc:'Consultation Revenue', amount:245000, status:'posted' },
    { ref:'JE-2024-004', desc:'Diagnostic revenue collection',        debitAcc:'Cash & Bank',    creditAcc:'Diagnostic Revenue',   amount:138000, status:'posted' },
    { ref:'JE-2024-005', desc:'Equipment maintenance payment',        debitAcc:'Equipment Maintenance',creditAcc:'Cash & Bank',    amount:45000, status:'draft' },
  ];
  entries.forEach((e, i) => {
    const id = `je_${i + 1}`;
    const jeDate = new Date(Date.now() - (30 - i * 5) * 86400000);
    store.journalEntries.insert({
      _id: id,
      reference: e.ref,
      description: e.desc,
      debit_account: e.debitAcc,
      credit_account: e.creditAcc,
      amount: e.amount,
      status: e.status,
      entry_date: jeDate.toISOString().split('T')[0],
      createdAt: jeDate.toISOString(),
      updatedAt: jeDate.toISOString(),
    });
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

function seedUsers() {
  store.users.insert({
    _id: 'user_admin',
    username: 'admin',
    password: 'Admin123!', // demo only — never stored in real backend
    name: 'Admin User',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@company.com',
    roles: ['admin'],
    scopes: ['vendors','purchase-orders','sales-orders','inventory','patients','doctors','admissions','diagnostics','billing','settings','reports','finance'],
    tenantId: 'demo-tenant',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00.000Z',
  });
  store.users.insert({
    _id: 'user_manager',
    username: 'manager',
    password: 'Manager123!',
    name: 'Jane Manager',
    first_name: 'Jane',
    last_name: 'Manager',
    email: 'manager@company.com',
    roles: ['manager'],
    scopes: ['vendors','purchase-orders','sales-orders','inventory','patients','billing','reports'],
    tenantId: 'demo-tenant',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00.000Z',
  });
  store.users.insert({
    _id: 'user_doctor',
    username: 'doctor',
    password: 'Doctor123!',
    name: 'Dr. House',
    first_name: 'Gregory',
    last_name: 'House',
    email: 'doctor@company.com',
    roles: ['doctor'],
    scopes: ['patients','admissions','diagnostics'],
    tenantId: 'demo-tenant',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00.000Z',
  });
}

// ─── Bank Accounts ────────────────────────────────────────────────────────────

function seedBankAccounts() {
  const banks = [
    { name:'HDFC Current Account', bank:'HDFC Bank', accountNumber:'XXXX-1234', ifsc:'HDFC0001234', type:'current', balance:4250000 },
    { name:'SBI Savings Account',  bank:'State Bank of India', accountNumber:'XXXX-5678', ifsc:'SBIN0001234', type:'savings', balance:875000 },
    { name:'Petty Cash Fund',      bank:'', accountNumber:'',      ifsc:'',          type:'cash',    balance:125000 },
  ];
  banks.forEach((b, i) => {
    const id = `bank_${i + 1}`;
    store.bankAccounts.insert({ _id: id, id, ...b, is_active: true, createdAt: '2024-01-01T00:00:00.000Z' });
  });
}

// ─── Medications ──────────────────────────────────────────────────────────────

function seedMedications() {
  const meds = [
    { name:'Paracetamol 500mg',  category:'Analgesic',    dosage:'500mg',  form:'Tablet',  frequency:'TID',  duration:'5 days' },
    { name:'Amoxicillin 250mg',  category:'Antibiotic',   dosage:'250mg',  form:'Capsule', frequency:'TID',  duration:'7 days' },
    { name:'Metformin 500mg',    category:'Antidiabetic', dosage:'500mg',  form:'Tablet',  frequency:'BD',   duration:'Ongoing' },
    { name:'Atorvastatin 10mg',  category:'Statin',       dosage:'10mg',   form:'Tablet',  frequency:'OD',   duration:'Ongoing' },
    { name:'Amlodipine 5mg',     category:'Antihypertensive', dosage:'5mg', form:'Tablet', frequency:'OD',   duration:'Ongoing' },
    { name:'Omeprazole 20mg',    category:'PPI',          dosage:'20mg',   form:'Capsule', frequency:'BD',   duration:'14 days' },
    { name:'Insulin Regular',    category:'Antidiabetic', dosage:'Variable',form:'Injection',frequency:'TID', duration:'Ongoing' },
  ];
  meds.forEach((m, i) => {
    const id = `med_${i + 1}`;
    store.medications.insert({ _id: id, id, ...m, is_active: true, createdAt: '2024-01-01T00:00:00.000Z' });
  });

  // Prescriptions
  const rxData = [
    { patient:'patient_1', doctor:'doctor_1', med:'med_1', status:'active' },
    { patient:'patient_2', doctor:'doctor_2', med:'med_4', status:'active' },
    { patient:'patient_3', doctor:'doctor_1', med:'med_3', status:'active' },
    { patient:'patient_7', doctor:'doctor_5', med:'med_7', status:'active' },
  ];
  rxData.forEach((rx, i) => {
    const id = `rx_${i + 1}`;
    const med = store.medications.findById(rx.med);
    const patient = store.patients.findById(rx.patient);
    store.prescriptions.insert({
      _id: id,
      patient_id:   rx.patient,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '',
      doctor_id:    rx.doctor,
      medication_id: rx.med,
      medication_name: med?.name || '',
      dosage:       med?.dosage || '',
      frequency:    med?.frequency || '',
      duration:     med?.duration || '',
      status:       rx.status,
      prescribed_date: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString().split('T')[0],
      createdAt:    new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
    });
  });
}

// ─── OPD Visits ───────────────────────────────────────────────────────────────

function seedOpdVisits() {
  const visits = [
    { patient:'patient_1', doctor:'doctor_1', dept:'Cardiology',      chief:'Chest pain',     status:'completed' },
    { patient:'patient_3', doctor:'doctor_6', dept:'General Medicine', chief:'Fever and cough', status:'completed' },
    { patient:'patient_4', doctor:'doctor_7', dept:'Gynecology',       chief:'Routine checkup',status:'completed' },
    { patient:'patient_6', doctor:'doctor_4', dept:'Pediatrics',       chief:'Vaccination',    status:'completed' },
    { patient:'patient_8', doctor:'doctor_6', dept:'General Medicine', chief:'Headache',       status:'in_progress' },
    { patient:'patient_10',doctor:'doctor_1', dept:'Cardiology',       chief:'Palpitations',   status:'waiting' },
  ];
  const today = new Date().toISOString().split('T')[0];
  visits.forEach((v, i) => {
    const id = `opd_${i + 1}`;
    const patient = store.patients.findById(v.patient);
    store.opdVisits.insert({
      _id: id,
      visit_number:  `OPD-2026-${String(4001 + i)}`,
      patient_id:    v.patient,
      patient_name:  patient ? `${patient.first_name} ${patient.last_name}` : '',
      doctor_id:     v.doctor,
      department:    v.dept,
      chief_complaint: v.chief,
      visit_date:    today,
      status:        v.status,
      token_number:  i + 1,
      notes:         '',
      createdAt:     new Date(Date.now() - i * 3600000).toISOString(),
    });
  });
}

// ─── Fixed Assets ─────────────────────────────────────────────────────────────

function seedFixedAssets() {
  const assets = [
    { name:'MRI Machine',           cat:'Medical Equipment', cost:8500000,  depRate:10, loc:'Radiology',      purchaseDate:'2022-04-01' },
    { name:'CT Scanner',             cat:'Medical Equipment', cost:6200000,  depRate:10, loc:'Radiology',      purchaseDate:'2023-01-15' },
    { name:'ECG Machine (x3)',       cat:'Medical Equipment', cost:135000,   depRate:15, loc:'Cardiology',     purchaseDate:'2023-06-01' },
    { name:'Hospital Beds (x50)',    cat:'Furniture',         cost:1250000,  depRate:10, loc:'Ward Block',     purchaseDate:'2021-01-01' },
    { name:'Ambulance',              cat:'Vehicle',           cost:2800000,  depRate:20, loc:'Ground Floor',   purchaseDate:'2022-09-01' },
    { name:'Generator (250 KVA)',    cat:'Equipment',         cost:950000,   depRate:15, loc:'Basement',       purchaseDate:'2021-07-01' },
    { name:'Autoclave Steriliser',   cat:'Medical Equipment', cost:380000,   depRate:10, loc:'OT',             purchaseDate:'2023-03-01' },
    { name:'Lab Analyser (Hematology)', cat:'Medical Equipment', cost:1200000, depRate:10, loc:'Pathology',   purchaseDate:'2022-11-01' },
  ];
  assets.forEach((a, i) => {
    const id = `asset_${i + 1}`;
    const cost = a.cost;
    const yearsOwned = (new Date().getFullYear() - new Date(a.purchaseDate).getFullYear());
    const accumulated = Math.round(cost * (a.depRate / 100) * yearsOwned);
    const bookValue   = Math.max(0, cost - accumulated);
    store.fixedAssets.insert({
      _id: id, id,
      name:            a.name,
      category:        a.cat,
      purchase_cost:   cost,
      purchase_date:   a.purchaseDate,
      depreciation_rate: a.depRate,
      location:        a.loc,
      accumulated_depreciation: accumulated,
      book_value:      bookValue,
      status:          bookValue > 0 ? 'active' : 'fully_depreciated',
      createdAt:       a.purchaseDate + 'T00:00:00.000Z',
    });
  });
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

function seedPayroll() {
  const employees = [
    { name:'Dr. Priya Sharma',  role:'doctor',  dept:'Cardiology',      salary:180000, emp:'EMP1001' },
    { name:'Dr. Rajesh Kumar',  role:'doctor',  dept:'Neurology',       salary:190000, emp:'EMP1002' },
    { name:'Nurse Kavya Singh', role:'nurse',   dept:'General Ward',    salary:45000,  emp:'EMP1010' },
    { name:'Rajan Mehta',       role:'staff',   dept:'Pharmacy',        salary:32000,  emp:'EMP1020' },
    { name:'Priya Kapoor',      role:'staff',   dept:'Finance',         salary:38000,  emp:'EMP1021' },
    { name:'Suresh Kumar',      role:'admin',   dept:'Administration',  salary:55000,  emp:'EMP1030' },
    { name:'Meena Rao',         role:'nurse',   dept:'ICU',             salary:52000,  emp:'EMP1011' },
    { name:'Vivek Joshi',       role:'technician', dept:'Radiology',    salary:42000,  emp:'EMP1025' },
  ];
  employees.forEach((e, i) => {
    const id = `emp_${i + 1}`;
    store.payrollEmployees.insert({
      _id: id, id,
      employee_id:   e.emp,
      name:          e.name,
      role:          e.role,
      department:    e.dept,
      basic_salary:  e.salary,
      allowances:    Math.round(e.salary * 0.2),
      deductions:    Math.round(e.salary * 0.12),
      net_salary:    Math.round(e.salary + e.salary * 0.2 - e.salary * 0.12),
      status:        'active',
      joining_date:  `${2020 + (i % 4)}-0${(i % 9) + 1}-01`,
      createdAt:     '2024-01-01T00:00:00.000Z',
    });
  });

  // One completed payroll run
  const prevMonth = (() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  store.payrollRuns.insert({
    _id: 'payrun_1',
    period:          prevMonth,
    total_employees: employees.length,
    total_payout:    employees.reduce((s, e) => s + Math.round(e.salary + e.salary * 0.2 - e.salary * 0.12), 0),
    status:          'completed',
    run_date:        new Date(Date.now() - 30 * 86400000).toISOString(),
    createdAt:       new Date(Date.now() - 30 * 86400000).toISOString(),
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────
// Shape matches notificationService.ts AppNotification:
//   _id, userId, tenantId, title, message, type, category,
//   entityId, entityType, actionUrl, isRead, readAt, createdAt, updatedAt

function seedNotifications() {
  function ago(minutes: number): string {
    return new Date(Date.now() - minutes * 60000).toISOString();
  }

  const notifs = [
    {
      title: 'Low Stock Alert',
      message: 'Atorvastatin 10mg is critically low — only 8 units remaining. Reorder immediately.',
      type: 'warning',
      category: 'inventory',
      entityType: 'inventory',
      entityId: 'inv_15',
      actionUrl: '/inventory',
      isRead: false,
      createdAt: ago(8),
    },
    {
      title: 'New Patient Registered',
      message: 'Ananya Pillai (PAT2024010) has been registered as a new OPD patient.',
      type: 'info',
      category: 'patient',
      entityType: 'patient',
      entityId: 'patient_10',
      actionUrl: '/patients',
      isRead: false,
      createdAt: ago(22),
    },
    {
      title: 'Purchase Order Approved',
      message: 'PO-2024-1002 from Cipla Ltd (₹18,500) has been approved and is pending delivery.',
      type: 'success',
      category: 'purchase_order',
      entityType: 'po',
      entityId: 'po_2',
      actionUrl: '/purchase-orders',
      isRead: false,
      createdAt: ago(45),
    },
    {
      title: 'Invoice Overdue',
      message: 'Invoice INV-2026-5007 for Priti Kapoor (₹8,500) is now 15 days overdue.',
      type: 'error',
      category: 'invoice',
      entityType: 'invoice',
      entityId: 'inv_bill_7',
      actionUrl: '/invoices',
      isRead: false,
      createdAt: ago(120),
    },
    {
      title: 'Admission Discharge Pending',
      message: 'Patient Vivek Jain (Room ICU1) has reached expected discharge date.',
      type: 'warning',
      category: 'admission',
      entityType: 'admission',
      entityId: 'adm_2',
      actionUrl: '/patient-admission',
      isRead: true,
      createdAt: ago(180),
    },
    {
      title: 'Diagnostic Result Ready',
      message: 'CBC result for Rahul Verma is complete. Status: within normal range.',
      type: 'success',
      category: 'diagnostic',
      entityType: 'diagnostic',
      entityId: 'booking_1',
      actionUrl: '/diagnostics',
      isRead: true,
      createdAt: ago(300),
    },
    {
      title: 'Vendor Payment Due',
      message: 'Payment of ₹42,000 to Medtronic India is due in 3 days (PO-2024-1003).',
      type: 'warning',
      category: 'vendor',
      entityType: 'vendor',
      entityId: 'vendor_3',
      actionUrl: '/purchase-orders',
      isRead: true,
      createdAt: ago(480),
    },
  ];

  notifs.forEach(n => {
    const id = `notif_${Math.random().toString(36).slice(2, 9)}`;
    store.notifications.insert({
      _id: id,
      userId: 'user_admin',
      tenantId: 'demo-tenant',
      ...n,
      readAt: n.isRead ? n.createdAt : undefined,
      updatedAt: n.createdAt,
    });
  });
}
