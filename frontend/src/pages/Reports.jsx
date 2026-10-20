import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, ShoppingBag, Receipt, ClipboardList, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { PageHeader, Card, Button, Label, Select } from "@/components/ui-kit";

const REPORTS = [
  {
    key: "financial",
    title: "Demonstrativo Lucro Real",
    description: "DRE completo: Receita Bruta, Custo dos Produtos Vendidos, Despesas e Lucro Real.",
    icon: DollarSign,
    color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "sales",
    title: "Vendas",
    description: "Vendas da competência selecionada com totais e custos.",
    icon: ShoppingBag,
    color: "bg-primary/20",
  },
  {
    key: "expenses",
    title: "Gastos",
    description: "Despesas da competência selecionada por categoria e data.",
    icon: Receipt,
    color: "bg-secondary/30",
  },
  {
    key: "orders",
    title: "Encomendas",
    description: "Pedidos do mês selecionado com status, cliente e total.",
    icon: ClipboardList,
    color: "bg-accent/40",
  },
];

export default function Reports() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [months, setMonths] = useState([currentMonth]);

  useEffect(() => {
    api.get("/reports/months")
      .then(({ data }) => setMonths(data.includes(month) ? data : [month, ...data]))
      .catch(() => {});
  }, [month]);

  const download = async (key, fmt) => {
    try {
      const { data: blob } = await api.get(`/reports/${key}/${fmt}`, {
        params: { month },
        responseType: "blob",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-${month}.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Relatório de ${month} gerado`);
    } catch {
      toast.error("Erro ao gerar relatório");
    }
  };

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Consulte e exporte os dados financeiros por mês. Os lançamentos anteriores permanecem disponíveis."
        action={
          <div className="min-w-48">
            <Label htmlFor="report-month">Competência</Label>
            <Select id="report-month" value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((value) => (
                <option key={value} value={value}>
                  {new Date(`${value}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map((r, idx) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -3 }}
            className="bg-card border border-border rounded-2xl p-6"
            data-testid={`report-${r.key}`}
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${r.color}`}>
              <r.icon className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <h3 className="heading-serif text-2xl mt-4">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <Button variant="outline" onClick={() => download(r.key, "pdf")}
                data-testid={`export-${r.key}-pdf`}>
                <FileText className="h-4 w-4" /> PDF
              </Button>
              <Button onClick={() => download(r.key, "xlsx")}
                data-testid={`export-${r.key}-xlsx`}>
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
