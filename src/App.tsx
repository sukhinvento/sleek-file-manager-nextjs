
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { UploadFiles } from "./pages/UploadFiles";
import { ViewFiles } from "./pages/ViewFiles";
import { EditFiles } from "./pages/EditFiles";
import { Settings } from "./pages/Settings";
import { PurchaseOrders } from "./pages/PurchaseOrders";
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
              <Dashboard />
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
          <Route path="/purchase-orders" element={
            <AppLayout>
              <PurchaseOrders />
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
              <div className="p-4">Usage Statistics Analytics</div>
            </AppLayout>
          } />
          <Route path="/analytics/trends" element={
            <AppLayout>
              <div className="p-4">Trends Analytics</div>
            </AppLayout>
          } />
          <Route path="/analytics/distribution" element={
            <AppLayout>
              <div className="p-4">Distribution Analytics</div>
            </AppLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
