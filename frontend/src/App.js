import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

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

const Protected = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/encomendas" element={<Protected><Orders /></Protected>} />
            <Route path="/vendas" element={<Protected><Sales /></Protected>} />
            <Route path="/massas" element={<Protected><Doughs /></Protected>} />
            <Route path="/precos" element={<Protected><Prices /></Protected>} />
            <Route path="/estoque" element={<Protected><Inventory /></Protected>} />
            <Route path="/clientes" element={<Protected><Customers /></Protected>} />
            <Route path="/relatorios" element={<Protected><Reports /></Protected>} />
            <Route path="/suporte" element={<Protected><Support /></Protected>} />
            <Route path="/configuracoes" element={<Protected><Settings /></Protected>} />
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
