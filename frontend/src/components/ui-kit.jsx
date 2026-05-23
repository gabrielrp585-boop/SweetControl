import React from "react";
import { motion } from "framer-motion";

export function PageHeader({ title, subtitle, action, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
      data-testid={testId || "page-header"}
    >
      <div>
        <h1 className="heading-serif text-4xl sm:text-5xl tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action}
    </motion.div>
  );
}

export function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`bg-card border border-border/70 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.03)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...rest }) {
  const styles = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-95 shadow-md shadow-primary/30 btn-shine",
    secondary: "bg-muted text-foreground hover:bg-muted/70",
    ghost: "hover:bg-muted text-foreground",
    outline: "border border-border bg-card hover:bg-muted text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:brightness-95",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...rest }) {
  return (
    <input
      className={`w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition ${className}`}
      {...rest}
    />
  );
}

export function Textarea({ className = "", ...rest }) {
  return (
    <textarea
      className={`w-full rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition resize-y min-h-[88px] ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select
      className={`w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${className}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-auto`}
        data-testid="modal"
      >
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="heading-serif text-2xl">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted" data-testid="modal-close">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function Label({ children, className = "" }) {
  return (
    <label className={`block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5 font-medium ${className}`}>
      {children}
    </label>
  );
}
