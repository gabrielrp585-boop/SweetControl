import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, ShoppingBag, Wheat, Tags,
  Package, Users, FileBarChart2, Settings as SettingsIcon, LifeBuoy,
  LogOut, Moon, Sun, Menu, X, Cake, Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/services/api";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!user?.email) return undefined;

    const storageKey = `sweetcontrol:support:last-check:${user.email}`;
    let lastCheckedAt = 0;
    try {
      const savedCheck = Number(localStorage.getItem(storageKey));
      if (Number.isFinite(savedCheck) && savedCheck > 0) lastCheckedAt = savedCheck;
    } catch {
      // Continue checking for replies when browser storage is unavailable.
    }
    let active = true;
    let checking = false;

    const checkSupport = async () => {
      if (checking) return;
      checking = true;
      const checkStartedAt = Date.now();
      try {
        const { data } = await api.get("/support");
        if (!active) return;

        data.forEach((ticket) => {
          (ticket.replies || []).forEach((reply) => {
            const createdAt = Date.parse(reply.created_at);
            if (
              Number.isFinite(createdAt) &&
              createdAt > lastCheckedAt &&
              reply.author_email !== user.email
            ) {
              const message = reply.message || `Nova resposta em ${ticket.subject}`;
              toast.info("Nova mensagem no suporte", {
                description: message,
                action: { label: "Ver", onClick: () => navigate("/suporte") },
              });
              if ("Notification" in window && Notification.permission === "granted") {
                try {
                  new Notification("Nova mensagem no suporte", { body: message });
                } catch {
                  // Browser notifications are optional; the in-app toast remains available.
                }
              }
            }
          });
        });

        lastCheckedAt = checkStartedAt;
        try {
          localStorage.setItem(storageKey, String(lastCheckedAt));
        } catch {
          // The in-memory checkpoint still avoids duplicates during this session.
        }
      } catch {
        // Keep the previous checkpoint so the next poll retries missed replies.
      } finally {
        checking = false;
      }
    };

    checkSupport();
    const interval = window.setInterval(checkSupport, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [navigate, user?.email]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = ({ onItemClick }) => (
    <div className="h-full max-h-[100dvh] flex flex-col p-4 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-1.5 shrink-0" data-testid="sidebar-logo">
        <div className="liquid-glass flex h-10 w-10 items-center justify-center rounded-2xl border border-white/35 shadow-lg shadow-rose-500/20 shrink-0">
          <Cake className="h-5 w-5 text-rose-300" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h1 className="heading-serif text-2xl font-bold leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] truncate">SweetControl</h1>
          <p className="text-[10px] uppercase tracking-[0.18em] text-rose-200/90 mt-1 font-semibold">
            Confeitaria
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === "/"}
            onClick={onItemClick}
            data-testid={`nav-${item.id}`}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-rose-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/35 border border-white/35"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-500 to-purple-600 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? "text-white" : "text-rose-300"}`} strokeWidth={1.9} />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card & actions — pinned at bottom, never clipped */}
      <div className="mt-3 pt-3 border-t border-white/15 shrink-0">
        <div className="glass rounded-2xl p-2.5 flex items-center gap-2.5" data-testid="user-card">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-white/75 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={toggle}
            data-testid="theme-toggle"
            className="flex items-center justify-center gap-1.5 rounded-2xl liquid-input py-2 px-3 text-xs font-semibold text-white hover:bg-white/15 transition"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-300 shrink-0" /> : <Moon className="h-3.5 w-3.5 text-rose-200 shrink-0" />}
            <span>{theme === "dark" ? "Claro" : "Escuro"}</span>
          </button>
          <button
            onClick={handleLogout}
            data-testid="logout-btn"
            className="flex items-center justify-center gap-1.5 rounded-2xl liquid-input py-2 px-3 text-xs font-semibold text-rose-200 hover:bg-destructive/30 hover:border-destructive/60 hover:text-white transition"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative isolate min-h-screen aurora-bg">
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-40 liquid-glass border-b border-white/15">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-md">
              <Cake className="h-4 w-4 text-white" />
            </div>
            <span className="heading-serif text-xl font-bold text-white truncate">SweetControl</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl liquid-input text-rose-200 hover:bg-destructive/30 hover:text-white transition"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-open"
              className="p-2 rounded-xl liquid-input text-white"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-[100dvh] w-72 flex-col z-30 liquid-glass border-r border-white/15">
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
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 h-[100dvh] w-[82vw] max-w-72 z-50 liquid-glass border-r border-white/15"
            >
              <button
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-menu-close"
                className="absolute top-3.5 right-3.5 p-2 rounded-xl hover:bg-white/15 text-white z-10"
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
        <div className="max-w-[1400px] mx-auto px-3.5 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 lg:py-8 pb-24 lg:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
