/**
 * Mock Backend
 *
 * Activated when VITE_DEMO_MODE=true.
 * Intercepts all axios calls via axios-mock-adapter and serves
 * responses from an in-memory store seeded with realistic demo data.
 *
 * To switch modes:
 *   Demo:  VITE_DEMO_MODE=true  (set in .env.demo or Lovable env config)
 *   Real:  VITE_DEMO_MODE=false (default — uses VITE_API_URL backend)
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/lib/api-client';
import { seedAll } from './seed';
import { registerAuthHandlers }          from './handlers/auth';
import { registerVendorHandlers }        from './handlers/vendors';
import { registerPatientHandlers }       from './handlers/patients';
import { registerInventoryHandlers }     from './handlers/inventory';
import { registerPurchaseOrderHandlers } from './handlers/purchaseOrders';
import { registerSalesOrderHandlers }    from './handlers/salesOrders';
import { registerDoctorHandlers }        from './handlers/doctors';
import { registerDiagnosticsHandlers }   from './handlers/diagnostics';
import { registerAdmissionHandlers }     from './handlers/admissions';
import { registerAnalyticsHandlers }     from './handlers/analytics';
import { registerMiscHandlers }          from './handlers/misc';
import { registerNotificationHandlers }  from './handlers/notifications';
import { registerExtraHandlers }         from './handlers/extras';

let _initialized = false;

export function initMockBackend() {
  if (_initialized) return;
  _initialized = true;

  // Seed the in-memory store with demo data
  seedAll();

  // Install mock adapter on the shared axios instance.
  // onNoMatch: 'passthrough' means any unmocked route falls through to the real network.
  const mock = new MockAdapter(apiClient, {
    delayResponse: 150, // realistic 150ms latency
    onNoMatch: 'passthrough',
  });

  // Register all route handlers
  registerAuthHandlers(mock);
  registerVendorHandlers(mock);
  registerPatientHandlers(mock);
  registerInventoryHandlers(mock);
  registerPurchaseOrderHandlers(mock);
  registerSalesOrderHandlers(mock);
  registerDoctorHandlers(mock);
  registerDiagnosticsHandlers(mock);
  registerAdmissionHandlers(mock);
  registerAnalyticsHandlers(mock);
  registerNotificationHandlers(mock);
  registerExtraHandlers(mock);  // lookup endpoints, stats, stock/transfers, medications, OPD, assets, payroll
  registerMiscHandlers(mock);   // rooms, locations, invoices, accounts, finance, users, health

  console.info('[MedSystem] 🚀 Demo mode active — using in-memory mock backend');
}

export const isDemoMode = (): boolean =>
  String((import.meta as any).env?.VITE_DEMO_MODE) === 'true';
