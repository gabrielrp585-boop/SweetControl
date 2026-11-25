import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { MikaaProvider } from "@/context/MikaaContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MikaaFab, MikaaPanel } from "@/components/Mikaa";
import { SeamlessVideoBackground } from "@/components/SeamlessVideoBackground";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Sales from "@/pages/Sales";
import Doughs from "@/pages/Doughs";
import Prices from "@/pages/Prices";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import MikaaPage from "@/pages/Mikaa";

const ProtectedShell = () => (
  <ProtectedRoute>
    <MikaaProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
      <MikaaFab />
      <MikaaPanel />
    </MikaaProvider>
  </ProtectedRoute>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SeamlessVideoBackground src="/modelo.mp4" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/encomendas" element={<Orders />} />
              <Route path="/vendas" element={<Sales />} />
              <Route path="/massas" element={<Doughs />} />
              <Route path="/precos" element={<Prices />} />
              <Route path="/estoque" element={<Inventory />} />
              <Route path="/clientes" element={<Customers />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/mikaa" element={<MikaaPage />} />
              <Route path="/suporte" element={<Support />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                fontFamily: "Outfit, sans-serif",
                borderRadius: "16px",
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
