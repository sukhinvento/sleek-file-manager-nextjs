
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { HospitalDashboard } from "./pages/HospitalDashboard";
import { UploadFiles } from "./pages/UploadFiles";
import { ViewFiles } from "./pages/ViewFiles";
import { EditFiles } from "./pages/EditFiles";
import { Settings } from "./pages/Settings";
import { PurchaseOrders } from "./pages/PurchaseOrders";
import { Inventory } from "./pages/Inventory";
import { InventoryDashboard } from "./pages/InventoryDashboard";
import { Billing } from "./pages/Billing";
import { Diagnostics } from "./pages/Diagnostics";
import { Patients } from "./pages/Patients";
import { VendorManagement } from "./pages/VendorManagement";
import { SalesOrders } from "./pages/SalesOrders";
import { StockTransfer } from "./pages/StockTransfer";
import { UsageStatistics } from "./pages/UsageStatistics";
import { TrendsAnalytics } from "./pages/TrendsAnalytics";
import { DistributionAnalytics } from "./pages/DistributionAnalytics";
import { PatientAdmission } from "./pages/PatientAdmission";
import { RoomManagement } from "./pages/RoomManagement";
import { DoctorManagement } from "./pages/DoctorManagement";
import { AppLayout } from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={
            <AppLayout>
              <HospitalDashboard />
            </AppLayout>
          } />
          <Route path="/files-dashboard" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/patients" element={
            <AppLayout>
              <Patients />
            </AppLayout>
          } />
          <Route path="/patients/admit" element={
            <AppLayout>
              <PatientAdmission />
            </AppLayout>
          } />
          <Route path="/rooms" element={
            <AppLayout>
              <RoomManagement />
            </AppLayout>
          } />
          <Route path="/doctors" element={
            <AppLayout>
              <DoctorManagement />
            </AppLayout>
          } />
          <Route path="/inventory" element={
            <AppLayout>
              <Inventory />
            </AppLayout>
          } />
          <Route path="/inventory-dashboard" element={
            <AppLayout>
              <InventoryDashboard />
            </AppLayout>
          } />
          <Route path="/purchase-orders" element={
            <AppLayout>
              <PurchaseOrders />
            </AppLayout>
          } />
          <Route path="/sales-orders" element={
            <AppLayout>
              <SalesOrders />
            </AppLayout>
          } />
          <Route path="/vendors" element={
            <AppLayout>
              <VendorManagement />
            </AppLayout>
          } />
          <Route path="/stock-transfer" element={
            <AppLayout>
              <StockTransfer />
            </AppLayout>
          } />
          <Route path="/billing" element={
            <AppLayout>
              <Billing />
            </AppLayout>
          } />
          <Route path="/diagnostics" element={
            <AppLayout>
              <Diagnostics />
            </AppLayout>
          } />
          <Route path="/upload" element={
            <AppLayout>
              <UploadFiles />
            </AppLayout>
          } />
          <Route path="/files" element={
            <AppLayout>
              <ViewFiles />
            </AppLayout>
          } />
          <Route path="/edit" element={
            <AppLayout>
              <EditFiles />
            </AppLayout>
          } />
          <Route path="/consolidated" element={
            <AppLayout>
              <div className="p-4">Consolidated Data View</div>
            </AppLayout>
          } />
          <Route path="/settings" element={
            <AppLayout>
              <Settings />
            </AppLayout>
          } />
          <Route path="/analytics/usage" element={
            <AppLayout>
              <UsageStatistics />
            </AppLayout>
          } />
          <Route path="/analytics/trends" element={
            <AppLayout>
              <TrendsAnalytics />
            </AppLayout>
          } />
          <Route path="/analytics/distribution" element={
            <AppLayout>
              <DistributionAnalytics />
            </AppLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
