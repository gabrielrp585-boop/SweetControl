import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ShoppingBag, TrendingUp, DollarSign, Receipt } from "lucide-react";
import { toast } from "sonner";
import { api, brl, fmtDate } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, Select, EmptyState, Modal, Badge,
} from "@/components/ui-kit";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [open, setOpen] = useState(false);
  const [openExp, setOpenExp] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    description: "", ring_size: 20, qty: 1, unit_price: "", cost: "",
    customer_name: "", sale_date: today, recipe_id: "", serving_count: 1,
  });
  const [expForm, setExpForm] = useState({
    description: "", category: "ingredientes", amount: "", expense_date: today,
  });

  const load = async () => {
    const [s, e, r] = await Promise.all([api.get("/sales"), api.get("/expenses"), api.get("/doughs")]);
    setSales(s.data);
    setExpenses(e.data);
    setRecipes(r.data);
  };
  useEffect(() => { load(); }, []);

  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalProfit = sales.reduce((a, s) => a + s.profit, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);

  const saveSale = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sales", {
        ...form,
        ring_size: Number(form.ring_size) || null,
        qty: Number(form.qty),
        unit_price: Number(form.unit_price),
        cost: Number(form.cost || 0),
        recipe_ids: form.recipe_id ? [form.recipe_id] : [],
        serving_count: Number(form.serving_count || 1),
      });
      toast.success("Venda registrada!");
      setOpen(false);
      setForm({ description: "", ring_size: 20, qty: 1, unit_price: "", cost: "", customer_name: "", sale_date: today, recipe_id: "", serving_count: 1 });
      load();
    } catch {
      toast.error("Erro ao salvar venda");
    }
  };

  const saveExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", {
        ...expForm,
        amount: Number(expForm.amount),
      });
      toast.success("Gasto registrado!");
      setOpenExp(false);
      setExpForm({ description: "", category: "ingredientes", amount: "", expense_date: today });
      load();
    } catch {
      toast.error("Erro ao salvar gasto");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir esta venda?")) return;
    await api.delete(`/sales/${id}`);
    toast.success("Venda excluída");
    load();
  };

  const removeExp = async (id) => {
    if (!window.confirm("Excluir este gasto?")) return;
    await api.delete(`/expenses/${id}`);
    toast.success("Gasto excluído");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Vendas & Gastos"
        subtitle="Registre vendas e despesas para acompanhar seu lucro em tempo real."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenExp(true)} data-testid="new-expense-btn">
              <Receipt className="h-4 w-4" /> Novo gasto
            </Button>
            <Button onClick={() => setOpen(true)} data-testid="new-sale-btn">
              <Plus className="h-4 w-4" /> Nova venda
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <Badge variant="primary">Vendas</Badge>
          </div>
          <p className="heading-serif text-3xl mt-3">{brl(totalSales)}</p>
          <p className="text-xs text-muted-foreground mt-1">{sales.length} vendas</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-gold" />
            <Badge variant="accent">Lucro</Badge>
          </div>
          <p className="heading-serif text-3xl mt-3">{brl(totalProfit)}</p>
          <p className="text-xs text-muted-foreground mt-1">Receita - custos</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-rosedeep" />
            <Badge variant="danger">Gastos</Badge>
          </div>
          <p className="heading-serif text-3xl mt-3">{brl(totalExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.length} lançamentos</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales table */}
        <Card>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="heading-serif text-2xl">Vendas</h3>
            <Badge variant="primary">{sales.length}</Badge>
          </div>
          {sales.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Sem vendas ainda"
              description="Registre sua primeira venda para ver os resultados aqui."
            />
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-3 py-3">Produto</th>
                    <th className="px-3 py-3">Qtd</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Lucro</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {sales.map((s) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-5 py-3 text-xs">{fmtDate(s.sale_date)}</td>
                        <td className="px-3 py-3">
                          <p className="font-medium">{s.description}</p>
                          {s.customer_name && (
                            <p className="text-xs text-muted-foreground">{s.customer_name}</p>
                          )}
                        </td>
                        <td className="px-3 py-3">{s.qty}</td>
                        <td className="px-3 py-3 font-medium">{brl(s.total)}</td>
                        <td className="px-3 py-3 text-emerald-600 dark:text-emerald-400 font-medium">
                          {brl(s.profit)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => remove(s.id)}
                            className="p-1.5 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Expenses table */}
        <Card>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="heading-serif text-2xl">Gastos</h3>
            <Badge variant="danger">{expenses.length}</Badge>
          </div>
          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Sem gastos registrados"
              description="Acompanhe suas despesas para calcular o lucro real."
            />
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-3 py-3">Descrição</th>
                    <th className="px-3 py-3">Categoria</th>
                    <th className="px-3 py-3">Valor</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3 text-xs">{fmtDate(e.expense_date)}</td>
                      <td className="px-3 py-3">{e.description}</td>
                      <td className="px-3 py-3">
                        <Badge variant="default">{e.category}</Badge>
                      </td>
                      <td className="px-3 py-3 font-medium text-rosedeep">{brl(e.amount)}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => removeExp(e.id)}
                          className="p-1.5 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova venda" maxWidth="max-w-xl">
        <form onSubmit={saveSale} className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="sale-form">
          <div className="sm:col-span-2">
            <Label>Produto *</Label>
            <Input
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Bolo Aro 20 - Chocolate"
            />
          </div>
          <div>
            <Label>Aro</Label>
            <Select value={form.ring_size} onChange={(e) => setForm({ ...form, ring_size: e.target.value })}>
              {[10, 15, 20, 25, 30].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <Label>Quantidade</Label>
            <Input type="number" min="1" required value={form.qty}
              onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          </div>
          <div>
            <Label>Receita / massa</Label>
            <Select value={form.recipe_id} onChange={(e) => setForm({ ...form, recipe_id: e.target.value })}>
              <option value="">Sem receita (custo manual)</option>
              {recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Porções / unidade</Label>
            <Input type="number" min="0.1" step="0.1" value={form.serving_count}
              onChange={(e) => setForm({ ...form, serving_count: e.target.value })} />
          </div>
          <div>
            <Label>Preço unitário (R$) *</Label>
            <Input type="number" step="0.01" required value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
          </div>
          <div>
            <Label>Custo unitário (R$)</Label>
            <Input type="number" step="0.01" value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Cliente (opcional)</Label>
            <Input value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Data *</Label>
            <Input type="date" required value={form.sale_date}
              onChange={(e) => setForm({ ...form, sale_date: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Registrar venda</Button>
          </div>
        </form>
      </Modal>

      <Modal open={openExp} onClose={() => setOpenExp(false)} title="Novo gasto">
        <form onSubmit={saveExpense} className="space-y-4">
          <div>
            <Label>Descrição *</Label>
            <Input required value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={expForm.category}
                onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                <option value="ingredientes">Ingredientes</option>
                <option value="embalagem">Embalagem</option>
                <option value="marketing">Marketing</option>
                <option value="transporte">Transporte</option>
                <option value="equipamento">Equipamento</option>
                <option value="geral">Geral</option>
              </Select>
            </div>
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" required value={expForm.amount}
                onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" required value={expForm.expense_date}
              onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpenExp(false)}>Cancelar</Button>
            <Button type="submit">Salvar gasto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
