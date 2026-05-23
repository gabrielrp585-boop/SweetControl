import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Wheat, X } from "lucide-react";
import { toast } from "sonner";
import { api, brl } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, Select, EmptyState, Modal, Badge,
} from "@/components/ui-kit";

const CATEGORIES = [
  { value: "massa", label: "Massa", variant: "primary" },
  { value: "recheio", label: "Recheio", variant: "secondary" },
  { value: "cobertura", label: "Cobertura", variant: "accent" },
];

export default function Doughs() {
  const [doughs, setDoughs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState({
    name: "", category: "massa", ring_size: 20, yield_servings: 1,
    ingredients: [], notes: "",
  });

  const load = async () => {
    const [d, i] = await Promise.all([api.get("/doughs"), api.get("/ingredients")]);
    setDoughs(d.data);
    setIngredients(i.data);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", category: "massa", ring_size: 20, yield_servings: 1, ingredients: [], notes: "" });
    setOpen(true);
  };
  const openEdit = (d) => {
    setEditing(d);
    setForm({ ...d });
    setOpen(true);
  };

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { ingredient_id: "", ingredient_name: "", qty: 0, unit: "g" }],
    });
  };
  const updateRow = (idx, field, value) => {
    const next = [...form.ingredients];
    next[idx] = { ...next[idx], [field]: value };
    if (field === "ingredient_id") {
      const ing = ingredients.find((x) => x.id === value);
      if (ing) {
        next[idx].ingredient_name = ing.name;
        next[idx].unit = ing.unit;
      }
    }
    setForm({ ...form, ingredients: next });
  };
  const removeRow = (idx) => {
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });
  };

  const computeCost = () =>
    form.ingredients.reduce((acc, r) => {
      const ing = ingredients.find((x) => x.id === r.ingredient_id);
      return acc + (ing ? Number(ing.unit_price) * Number(r.qty || 0) : 0);
    }, 0);

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      ring_size: form.ring_size ? Number(form.ring_size) : null,
      yield_servings: Number(form.yield_servings),
      ingredients: form.ingredients.map((r) => ({ ...r, qty: Number(r.qty) })),
    };
    try {
      if (editing) await api.put(`/doughs/${editing.id}`, body);
      else await api.post("/doughs", body);
      toast.success(editing ? "Receita atualizada" : "Receita criada");
      setOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir esta receita?")) return;
    await api.delete(`/doughs/${id}`);
    toast.success("Excluída");
    load();
  };

  const filtered = tab === "all" ? doughs : doughs.filter((d) => d.category === tab);

  return (
    <div>
      <PageHeader
        title="Massas & Custos"
        subtitle="Cadastre receitas e calcule custos automaticamente por ingrediente."
        action={
          <Button onClick={openNew} data-testid="new-dough-btn">
            <Plus className="h-4 w-4" /> Nova receita
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[{ value: "all", label: "Todas" }, ...CATEGORIES].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition whitespace-nowrap ${
              tab === t.value
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-card border border-border hover:bg-muted"
            }`}
            data-testid={`dough-tab-${t.value}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wheat}
            title="Nenhuma receita cadastrada"
            description="Crie sua primeira massa, recheio ou cobertura."
            action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Nova receita</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((d) => {
              const catInfo = CATEGORIES.find((c) => c.value === d.category) || CATEGORIES[0];
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ y: -3 }}
                  className="bg-card border border-border rounded-2xl p-5"
                  data-testid={`dough-card-${d.id}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="heading-serif text-2xl">{d.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={catInfo.variant}>{catInfo.label}</Badge>
                        {d.ring_size && <Badge variant="default">Aro {d.ring_size}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="p-2 rounded-xl hover:bg-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(d.id)} className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Custo total
                    </p>
                    <p className="heading-serif text-3xl text-gold mt-0.5">{brl(d.total_cost)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.ingredients?.length || 0} ingredientes · rende {d.yield_servings}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar receita" : "Nova receita"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Label>Nome *</Label>
              <Input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Aro (cm)</Label>
              <Select value={form.ring_size || ""}
                onChange={(e) => setForm({ ...form, ring_size: e.target.value })}>
                <option value="">—</option>
                {[10, 15, 20, 25, 30].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0">Ingredientes</Label>
              <Button type="button" variant="outline" onClick={addIngredient}>
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
            {form.ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-3">
                Adicione ingredientes para calcular o custo automaticamente.
              </p>
            )}
            <div className="space-y-2">
              {form.ingredients.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Select
                    className="col-span-6"
                    value={row.ingredient_id}
                    onChange={(e) => updateRow(idx, "ingredient_id", e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({brl(i.unit_price)}/{i.unit})
                      </option>
                    ))}
                  </Select>
                  <Input
                    className="col-span-3"
                    type="number"
                    step="0.01"
                    value={row.qty}
                    onChange={(e) => updateRow(idx, "qty", e.target.value)}
                    placeholder="Qtd"
                    required
                  />
                  <div className="col-span-2 text-sm text-muted-foreground">{row.unit}</div>
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="col-span-1 p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Custo estimado</span>
            <span className="heading-serif text-2xl text-gold">{brl(computeCost())}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? "Salvar" : "Criar receita"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
