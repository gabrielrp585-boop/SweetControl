import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, ShoppingBag, Wheat, Tags,
  Package, Users, FileBarChart2, Settings as SettingsIcon, LifeBuoy,
  LogOut, Moon, Sun, Menu, X, Cake, Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { to: "/encomendas", icon: ClipboardList, label: "Encomendas", id: "orders" },
  { to: "/vendas", icon: ShoppingBag, label: "Vendas", id: "sales" },
  { to: "/massas", icon: Wheat, label: "Massas & Custos", id: "doughs" },
  { to: "/precos", icon: Tags, label: "Preços", id: "prices" },
  { to: "/estoque", icon: Package, label: "Estoque", id: "inventory" },
  { to: "/clientes", icon: Users, label: "Clientes", id: "customers" },
  { to: "/relatorios", icon: FileBarChart2, label: "Relatórios", id: "reports" },
  { to: "/mikaa", icon: Sparkles, label: "Mikaa", id: "mikaa", accent: true },
  { to: "/suporte", icon: LifeBuoy, label: "Suporte", id: "support" },
  { to: "/configuracoes", icon: SettingsIcon, label: "Configurações", id: "settings" },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = ({ onItemClick }) => (
    <div className="h-full flex flex-col p-5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3" data-testid="sidebar-logo">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
          <Cake className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="heading-serif text-2xl leading-none text-foreground">SweetControl</h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
            Confeitaria
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-8 flex-1 space-y-1.5">
        {nav.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === "/"}
            onClick={onItemClick}
            data-testid={`nav-${item.id}`}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-2xl bg-primary -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="glass rounded-2xl p-3 flex items-center gap-3" data-testid="user-card">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-semibold">
            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={toggle}
            data-testid="theme-toggle"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-2 text-xs font-medium hover:bg-muted transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Claro" : "Escuro"}
          </button>
          <button
            onClick={handleLogout}
            data-testid="logout-btn"
            className="flex items-center justify-center rounded-2xl border border-border bg-card px-3 py-2 hover:bg-destructive/10 hover:text-destructive transition"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen aurora-bg">
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Cake className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="heading-serif text-xl">SweetControl</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            data-testid="mobile-menu-open"
            className="p-2 rounded-xl border border-border bg-card"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-72 flex-col z-30 border-r border-border/60 bg-card/40 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 h-full w-72 z-50 bg-card border-r border-border"
            >
              <button
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-menu-close"
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted z-10"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onItemClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 py-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
