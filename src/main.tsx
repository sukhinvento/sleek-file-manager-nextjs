import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { InventoryDashboard } from './pages/InventoryDashboard'
import { Inventory } from './pages/Inventory'
import { PurchaseOrders } from './pages/PurchaseOrders'
import { SalesOrders } from './pages/SalesOrders'
import { VendorManagement } from './pages/VendorManagement'
import { StockTransfer } from './pages/StockTransfer'
import { ViewFiles } from './pages/ViewFiles'
import { UploadFiles } from './pages/UploadFiles'
import { EditFiles } from './pages/EditFiles'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Billing } from './pages/Billing'
import { Patients } from './pages/Patients'
import NotFound from './pages/NotFound'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/file-dashboard" element={<Dashboard />} />
              <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/vendors" element={<VendorManagement />} />
              <Route path="/stock-transfer" element={<StockTransfer />} />
              <Route path="/files" element={<ViewFiles />} />
              <Route path="/upload" element={<UploadFiles />} />
              <Route path="/edit" element={<EditFiles />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
