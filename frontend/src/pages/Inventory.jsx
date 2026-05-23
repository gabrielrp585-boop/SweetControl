import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { api, brl } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, Select, EmptyState, Modal, Badge,
} from "@/components/ui-kit";

const UNITS = ["g", "kg", "ml", "L", "un"];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mvOpen, setMvOpen] = useState(false);
  const [mvTarget, setMvTarget] = useState(null);
  const [mvForm, setMvForm] = useState({ delta: 0, reason: "" });
  const [form, setForm] = useState({
    name: "", unit: "g", unit_price: 0, stock_qty: 0, min_stock: 0,
  });

  const load = async () => {
    const { data } = await api.get("/ingredients");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", unit: "g", unit_price: 0, stock_qty: 0, min_stock: 0 });
    setOpen(true);
  };
  const openEdit = (i) => {
    setEditing(i);
    setForm({ ...i });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      unit_price: Number(form.unit_price),
      stock_qty: Number(form.stock_qty),
      min_stock: Number(form.min_stock),
    };
    try {
      if (editing) await api.put(`/ingredients/${editing.id}`, body);
      else await api.post("/ingredients", body);
      toast.success(editing ? "Ingrediente atualizado" : "Ingrediente cadastrado");
      setOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir este ingrediente?")) return;
    await api.delete(`/ingredients/${id}`);
    toast.success("Excluído");
    load();
  };

  const openMovement = (i, type) => {
    setMvTarget({ ...i, type });
    setMvForm({ delta: 0, reason: type === "entrada" ? "Entrada de estoque" : "Saída de estoque" });
    setMvOpen(true);
  };
  const submitMovement = async (e) => {
    e.preventDefault();
    const sign = mvTarget.type === "entrada" ? 1 : -1;
    await api.post("/ingredients/movement", {
      ingredient_id: mvTarget.id,
      delta: sign * Math.abs(Number(mvForm.delta)),
      reason: mvForm.reason,
    });
    toast.success("Movimentação registrada");
    setMvOpen(false);
    load();
  };

  const lowStockCount = items.filter(
    (i) => Number(i.stock_qty) <= Number(i.min_stock) && Number(i.min_stock) > 0
  ).length;

  return (
    <div>
      <PageHeader
        title="Estoque"
        subtitle="Gerencie ingredientes com movimentações e alertas de estoque baixo."
        action={
          <Button onClick={openNew} data-testid="new-ingredient-btn">
            <Plus className="h-4 w-4" /> Novo ingrediente
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <Package className="h-5 w-5 text-primary mb-3" />
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total de itens</p>
          <p className="heading-serif text-3xl mt-1">{items.length}</p>
        </Card>
        <Card className="p-5">
          <ArrowUpCircle className="h-5 w-5 text-emerald-500 mb-3" />
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor em estoque</p>
          <p className="heading-serif text-3xl mt-1">
            {brl(items.reduce((a, i) => a + Number(i.stock_qty) * Number(i.unit_price), 0))}
          </p>
        </Card>
        <Card className={`p-5 ${lowStockCount > 0 ? "border-destructive/40" : ""}`}>
          <AlertTriangle className={`h-5 w-5 mb-3 ${lowStockCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estoque baixo</p>
          <p className="heading-serif text-3xl mt-1">{lowStockCount}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sem ingredientes"
            description="Cadastre seus ingredientes para controlar o estoque."
            action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Novo ingrediente</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3.5">Ingrediente</th>
                  <th className="px-3 py-3.5">Unidade</th>
                  <th className="px-3 py-3.5">Preço/un</th>
                  <th className="px-3 py-3.5">Estoque</th>
                  <th className="px-3 py-3.5">Mín.</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((i) => {
                    const isLow = Number(i.stock_qty) <= Number(i.min_stock) && Number(i.min_stock) > 0;
                    return (
                      <motion.tr
                        key={i.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border last:border-0 hover:bg-muted/40"
                        data-testid={`ingredient-row-${i.id}`}
                      >
                        <td className="px-5 py-3.5 font-medium">{i.name}</td>
                        <td className="px-3 py-3.5">{i.unit}</td>
                        <td className="px-3 py-3.5">{brl(i.unit_price)}</td>
                        <td className="px-3 py-3.5 font-medium">{i.stock_qty}</td>
                        <td className="px-3 py-3.5 text-muted-foreground">{i.min_stock}</td>
                        <td className="px-3 py-3.5">
                          {isLow ? (
                            <Badge variant="danger">Baixo</Badge>
                          ) : (
                            <Badge variant="success">OK</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openMovement(i, "entrada")}
                              className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                              title="Entrada"
                            >
                              <ArrowUpCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openMovement(i, "saida")}
                              className="p-2 rounded-xl hover:bg-destructive/10 text-destructive"
                              title="Saída"
                            >
                              <ArrowDownCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => openEdit(i)} className="p-2 rounded-xl hover:bg-muted">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(i.id)}
                              className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar ingrediente" : "Novo ingrediente"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unidade</Label>
              <Select value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </div>
            <div>
              <Label>Preço por unidade (R$)</Label>
              <Input type="number" step="0.001" value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
            </div>
            <div>
              <Label>Estoque atual</Label>
              <Input type="number" step="0.01" value={form.stock_qty}
                onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
            </div>
            <div>
              <Label>Estoque mínimo</Label>
              <Input type="number" step="0.01" value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={mvOpen} onClose={() => setMvOpen(false)}
        title={mvTarget?.type === "entrada" ? "Entrada de estoque" : "Saída de estoque"}>
        <form onSubmit={submitMovement} className="space-y-4">
          <div className="bg-muted/40 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingrediente</p>
            <p className="heading-serif text-2xl">{mvTarget?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Estoque atual: {mvTarget?.stock_qty} {mvTarget?.unit}
            </p>
          </div>
          <div>
            <Label>Quantidade ({mvTarget?.unit})</Label>
            <Input type="number" step="0.01" required value={mvForm.delta}
              onChange={(e) => setMvForm({ ...mvForm, delta: e.target.value })} />
          </div>
          <div>
            <Label>Motivo</Label>
            <Input value={mvForm.reason}
              onChange={(e) => setMvForm({ ...mvForm, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setMvOpen(false)}>Cancelar</Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
