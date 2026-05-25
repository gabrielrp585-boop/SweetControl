import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Copy, Check, Clock, CheckCircle2, AlertCircle, Calendar, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api, brl } from "@/services/api";
import { Card, Button, Badge } from "@/components/ui-kit";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatMonth(monthStr) {
  if (!monthStr) return "—";
  const [y, m] = monthStr.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

function formatPixKey(key) {
  // CPF mask: 14725941697 -> 147.259.416-97
  const digits = (key || "").replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return key;
}

function statusBadge(status) {
  if (status === "pago") return { variant: "success", label: "Pago", icon: CheckCircle2 };
  if (status === "confirmado_cliente") return { variant: "primary", label: "Aguardando confirmação", icon: Clock };
  return { variant: "warning", label: "Pendente", icon: AlertCircle };
}

export default function HostingBilling() {
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get("/hosting/info");
    setInfo(data);
  };
  useEffect(() => { load(); }, []);

  const copyPix = () => {
    if (!info?.pix_key) return;
    navigator.clipboard.writeText(info.pix_key);
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const confirm = async () => {
    if (!info?.current_month) return;
    setBusy(true);
    try {
      await api.post(`/hosting/payments/${info.current_month.id}/confirm`);
      toast.success("Confirmação enviada! Aguarde o desenvolvedor validar.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    if (!info?.current_month) return;
    setBusy(true);
    try {
      await api.post(`/hosting/payments/${info.current_month.id}/mark-paid`);
      toast.success("Marcado como pago!");
      load();
    } finally {
      setBusy(false);
    }
  };

  const reopen = async () => {
    if (!info?.current_month) return;
    setBusy(true);
    try {
      await api.post(`/hosting/payments/${info.current_month.id}/reopen`);
      toast.success("Cobrança reaberta");
      load();
    } finally {
      setBusy(false);
    }
  };

  if (!info) {
    return <div className="h-48 rounded-2xl bg-muted animate-pulse mb-6" />;
  }

  const current = info.current_month || {};
  const sb = statusBadge(current.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
      data-testid="hosting-billing"
    >
      <Card className="overflow-hidden">
        {/* Decorative gradient header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 border-b border-border">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center shadow-md">
                <CreditCard className="h-6 w-6 text-rosedeep" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="heading-serif text-2xl">Hospedagem mensal</h3>
                <p className="text-sm text-muted-foreground">
                  Manutenção do sistema na nuvem
                </p>
              </div>
            </div>
            <Badge variant={sb.variant} className="self-center">
              <sb.icon className="h-3 w-3" /> {sb.label}
            </Badge>
          </div>
        </div>

        {/* Current month status */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
              Referente a
            </p>
            <p className="heading-serif text-2xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rosedeep" />
              {formatMonth(current.month)}
            </p>
            {info.due_day && (
              <p className="text-xs text-muted-foreground mt-1">
                Vencimento dia {info.due_day}
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
              Valor
            </p>
            <p className="heading-serif text-3xl text-gold">{brl(info.amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">por mês</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
              Chave PIX (CPF)
            </p>
            <button
              onClick={copyPix}
              className="w-full text-left bg-muted/60 hover:bg-muted rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 transition group"
              data-testid="copy-pix-btn"
            >
              <span className="font-mono text-sm font-medium tracking-wide">
                {formatPixKey(info.pix_key)}
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              )}
            </button>
            {info.pix_name && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Em nome de: <span className="font-medium">{info.pix_name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {current.status === "pendente" && (
            <Button onClick={confirm} disabled={busy} data-testid="confirm-payment-btn">
              <CheckCircle2 className="h-4 w-4" /> Já fiz o PIX
            </Button>
          )}
          {current.status === "confirmado_cliente" && (
            <Button onClick={markPaid} disabled={busy} data-testid="mark-paid-btn">
              <Sparkles className="h-4 w-4" /> Confirmar recebimento
            </Button>
          )}
          {current.status === "pago" && (
            <Button variant="outline" onClick={reopen} disabled={busy}>
              Reabrir cobrança
            </Button>
          )}
        </div>

        {/* History */}
        {info.history.length > 1 && (
          <div className="border-t border-border px-6 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
              Histórico
            </p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {info.history.slice(1).map((p) => {
                const b = statusBadge(p.status);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{formatMonth(p.month)}</span>
                      <span className="text-xs text-muted-foreground">{brl(p.amount)}</span>
                    </div>
                    <Badge variant={b.variant}>{b.label}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
