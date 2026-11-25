import React from "react";
import { motion } from "framer-motion";

export function PageHeader({ title, subtitle, action, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
      data-testid={testId || "page-header"}
    >
      <div className="min-w-0">
        <h1 className="heading-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm font-medium text-foreground/85 mt-1 sm:mt-1.5 max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </motion.div>
  );
}

export function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`relative overflow-hidden liquid-glass liquid-glass-interactive rounded-[28px] ${className}`}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/65 to-transparent" />
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...rest }) {
  const styles = {
    primary:
      "bg-gradient-to-r from-rose-500 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 !text-white font-bold shadow-lg shadow-rose-500/40 border border-white/40 btn-shine",
    secondary: "liquid-input !text-white font-semibold hover:brightness-110",
    ghost: "hover:bg-white/15 !text-white font-medium",
    outline: "liquid-input hover:!border-rose-300/70 !text-white font-semibold",
    danger: "bg-destructive text-destructive-foreground font-bold hover:brightness-105 shadow-md shadow-destructive/30",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...rest }) {
  return (
    <input
      className={`liquid-input w-full rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition ${className}`}
      {...rest}
    />
  );
}

export function Textarea({ className = "", ...rest }) {
  return (
    <textarea
      className={`liquid-input w-full rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition resize-y min-h-[88px] ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select
      className={`liquid-input w-full rounded-2xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Badge({ children, variant = "default", className = "" }) {
  const map = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/20 text-primary-foreground dark:text-primary",
    accent: "bg-accent/40 text-accent-foreground dark:text-accent",
    secondary: "bg-secondary/40 text-secondary-foreground dark:text-secondary",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide ${map[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      {Icon && (
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-primary/15 mb-4">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.6} />
        </div>
      )}
      <h3 className="heading-serif text-2xl text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className={`relative liquid-glass rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[92dvh] overflow-y-auto overflow-x-hidden`}
        data-testid="modal"
      >
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/35 border-b border-white/15 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2">
          <h3 className="heading-serif text-xl sm:text-2xl truncate">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/15 shrink-0" data-testid="modal-close">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function Label({ children, className = "" }) {
  return (
    <label className={`block text-[11px] uppercase tracking-[0.14em] text-foreground/90 mb-1.5 font-semibold ${className}`}>
      {children}
    </label>
  );
}
