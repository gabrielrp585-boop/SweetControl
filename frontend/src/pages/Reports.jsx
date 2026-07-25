import React from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, ShoppingBag, Receipt, ClipboardList, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";
import { PageHeader, Card, Button } from "@/components/ui-kit";

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
    description: "Histórico completo de vendas com totais e custo.",
    icon: ShoppingBag,
    color: "bg-primary/20",
  },
  {
    key: "expenses",
    title: "Gastos",
    description: "Lançamentos de despesas por categoria e data.",
    icon: Receipt,
    color: "bg-secondary/30",
  },
  {
    key: "orders",
    title: "Encomendas",
    description: "Listagem de pedidos com status, cliente e total.",
    icon: ClipboardList,
    color: "bg-accent/40",
  },
];

export default function Reports() {
  const download = async (key, fmt) => {
    try {
      const res = await fetch(`${API}/reports/${key}/${fmt}`, { credentials: "include" });
      if (!res.ok) throw new Error("Falha");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Relatório ${fmt.toUpperCase()} gerado`);
    } catch {
      toast.error("Erro ao gerar relatório");
    }
  };

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Exporte os dados da sua confeitaria em PDF ou Excel."
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
