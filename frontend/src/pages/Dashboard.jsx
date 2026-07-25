import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import {
  TrendingUp, DollarSign, ShoppingBag, Package, ClipboardList, ArrowUpRight,
  AlertTriangle, Sparkles,
} from "lucide-react";
import { api, brl } from "@/services/api";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Bom dia", emoji: "🌸", sub: "Que seu dia seja tão doce quanto seus bolos." };
  if (h >= 12 && h < 18) return { text: "Boa tarde", emoji: "🌷", sub: "Aproveite a tarde para encantar suas clientes." };
  if (h >= 18 && h < 22) return { text: "Boa noite", emoji: "🌙", sub: "Hora de relaxar e celebrar as conquistas do dia." };
  return { text: "Boa madrugada", emoji: "✨", sub: "Trabalhando até tarde? Lembre-se de descansar." };
}

function KpiCard({ icon: Icon, label, value, sub, tint, testId }) {
  return (
    <motion.div
      {...fadeUp}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden bg-card border border-border/70 rounded-2xl p-5 shadow-[0_8px_28px_rgb(0,0,0,0.03)]"
      data-testid={testId}
    >
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-50 ${tint}`} />
      <div className="relative flex items-start justify-between">
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${tint}`}>
          <Icon className="h-5 w-5 text-primary-foreground dark:text-foreground" strokeWidth={1.8} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-5">
        {label}
      </p>
      <p className="heading-serif text-3xl mt-1 text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = (user?.name || "").split(" ")[0];

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data));
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="h-14 w-72 rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting.text}${firstName ? `, ${firstName}` : ""} ${greeting.emoji}`}
        subtitle={greeting.sub}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={ShoppingBag}
          label="Vendido no mês"
          value={brl(data.total_month)}
          sub={`Hoje: ${brl(data.total_day)}`}
          tint="bg-primary/30"
          testId="kpi-month"
        />
        <KpiCard
          icon={Package}
          label="Custo de Produção"
          value={brl(data.cogs_month || 0)}
          sub="Ingredientes das vendas"
          tint="bg-rose-200/40"
          testId="kpi-cogs"
        />
        <KpiCard
          icon={ClipboardList}
          label="Despesas no mês"
          value={brl(data.expenses_month || 0)}
          sub="Gastos operacionais"
          tint="bg-secondary/40"
          testId="kpi-expenses"
        />
        <KpiCard
          icon={DollarSign}
          label="Lucro Real Líquido"
          value={brl(data.profit_month)}
          sub="Receita - (Custos + Despesas)"
          tint="bg-emerald-200/40"
          testId="kpi-profit"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div {...fadeUp} className="lg:col-span-2 bg-card border border-border/70 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="heading-serif text-2xl">Vendas dos últimos 7 dias</h3>
              <p className="text-xs text-muted-foreground">Receita diária</p>
            </div>
            <Badge variant="primary">7 dias</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.sales_chart} margin={{ left: -10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => brl(v)} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                fill="url(#gradSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeUp} className="bg-card border border-border/70 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="heading-serif text-2xl">Top Produtos</h3>
            <p className="text-xs text-muted-foreground">Mais vendidos</p>
          </div>
          {data.top_products.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma venda ainda
            </div>
          ) : (
            <ul className="space-y-3" data-testid="top-products">
              {data.top_products.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center heading-serif text-lg text-primary-foreground dark:text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} vendidos</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-gold" />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {/* 2 Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div {...fadeUp} className="bg-card border border-border/70 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="heading-serif text-2xl">Gastos da Semana</h3>
              <p className="text-xs text-muted-foreground">{brl(data.expenses_month)} no mês</p>
            </div>
            <Badge variant="secondary">Gastos</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.expenses_chart} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => brl(v)} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeUp} className="bg-card border border-border/70 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="heading-serif text-2xl">Lucro</h3>
              <p className="text-xs text-muted-foreground">{brl(data.profit_month)} acumulado</p>
            </div>
            <Badge variant="accent">Lucro</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.profit_chart} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => brl(v)} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-3))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Low stock */}
      {data.low_stock.length > 0 && (
        <motion.div {...fadeUp} className="bg-card border border-border/70 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-destructive/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="heading-serif text-2xl">Estoque baixo</h3>
                <p className="text-xs text-muted-foreground">Reponha em breve</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="low-stock">
            {data.low_stock.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.stock_qty} {s.unit} restante · mín {s.min_stock} {s.unit}
                  </p>
                </div>
                <Package className="h-5 w-5 text-destructive" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
