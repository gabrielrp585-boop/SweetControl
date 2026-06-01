import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Wheat, X, Cake as CakeIcon, Sparkles } from "lucide-react";
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
const RINGS = [10, 15, 20, 25, 30];

const EMPTY_DOUGH = {
  name: "", category: "massa", ring_sizes: [], yield_servings: 1,
  ingredients: [], notes: "",
};

const EMPTY_CAKE = {
  name: "", ring_size: 20, dough_id: "", filling_ids: [], coating_id: "",
  extra_cost: 0, margin_percent: 100,
};

// ============================================================================
// PAGE
// ============================================================================
export default function Doughs() {
  const [doughs, setDoughs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [tab, setTab] = useState("recipes"); // recipes | builder

  const load = async () => {
    const [d, i, c] = await Promise.all([
      api.get("/doughs"), api.get("/ingredients"), api.get("/cakes"),
    ]);
    setDoughs(d.data);
    setIngredients(i.data);
    setCakes(c.data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader
        title="Massas & Custos"
        subtitle="Cadastre receitas e monte bolos com cálculo automático de custo e preço."
      />

      {/* Top-level tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setTab("recipes")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition flex items-center gap-2 ${
            tab === "recipes"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
              : "bg-card border border-border hover:bg-muted"
          }`}
          data-testid="tab-recipes"
        >
          <Wheat className="h-4 w-4" /> Receitas
        </button>
        <button
          onClick={() => setTab("builder")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition flex items-center gap-2 ${
            tab === "builder"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
              : "bg-card border border-border hover:bg-muted"
          }`}
          data-testid="tab-builder"
        >
          <CakeIcon className="h-4 w-4" /> Construtor de Bolo
        </button>
      </div>

      {tab === "recipes" ? (
        <RecipesView
          doughs={doughs}
          ingredients={ingredients}
          reload={load}
        />
      ) : (
        <CakeBuilderView
          doughs={doughs}
          cakes={cakes}
          reload={load}
        />
      )}
    </div>
  );
}

// ============================================================================
// RECIPES VIEW
// ============================================================================
function RecipesView({ doughs, ingredients, reload }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_DOUGH);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_DOUGH);
    setOpen(true);
  };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      ...d,
      ring_sizes: d.ring_sizes || (d.ring_size ? [d.ring_size] : []),
    });
    setOpen(true);
  };

  const toggleRing = (r) => {
    const has = form.ring_sizes.includes(r);
    setForm({
      ...form,
      ring_sizes: has ? form.ring_sizes.filter((x) => x !== r) : [...form.ring_sizes, r].sort((a, b) => a - b),
    });
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
      ring_sizes: form.ring_sizes.map(Number),
      yield_servings: Number(form.yield_servings),
      ingredients: form.ingredients.map((r) => ({ ...r, qty: Number(r.qty) })),
    };
    try {
      if (editing) await api.put(`/doughs/${editing.id}`, body);
      else await api.post("/doughs", body);
      toast.success(editing ? "Receita atualizada" : "Receita criada");
      setOpen(false);
      reload();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir esta receita?")) return;
    await api.delete(`/doughs/${id}`);
    toast.success("Excluída");
    reload();
  };

  const filtered = filter === "all" ? doughs : doughs.filter((d) => d.category === filter);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {[{ value: "all", label: "Todas" }, ...CATEGORIES].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition whitespace-nowrap ${
                filter === t.value
                  ? "bg-foreground text-background"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={openNew} data-testid="new-dough-btn">
          <Plus className="h-4 w-4" /> Nova receita
        </Button>
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
              const rings = d.ring_sizes && d.ring_sizes.length ? d.ring_sizes : (d.ring_size ? [d.ring_size] : []);
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
                    <div className="flex-1 min-w-0">
                      <h3 className="heading-serif text-2xl truncate">{d.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge variant={catInfo.variant}>{catInfo.label}</Badge>
                        {rings.map((r) => (
                          <Badge key={r} variant="default">Aro {r}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          </div>

          {/* Multi-ring selector */}
          <div>
            <Label>Aros compatíveis (selecione um ou mais)</Label>
            <div className="flex gap-2 flex-wrap">
              {RINGS.map((r) => {
                const active = form.ring_sizes.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRing(r)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                        : "bg-card border border-border hover:bg-muted"
                    }`}
                    data-testid={`ring-toggle-${r}`}
                  >
                    Aro {r}
                  </button>
                );
              })}
              {form.ring_sizes.length === 0 && (
                <span className="text-xs text-muted-foreground self-center italic">
                  Receita universal (sem aro específico)
                </span>
              )}
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
    </>
  );
}

// ============================================================================
// CAKE BUILDER VIEW
// ============================================================================
function CakeBuilderView({ doughs, cakes, reload }) {
  const [form, setForm] = useState(EMPTY_CAKE);
  const [preview, setPreview] = useState({ total_cost: 0, final_price: 0 });
  const [editing, setEditing] = useState(null);

  const massas = useMemo(
    () => doughs.filter((d) =>
      d.category === "massa" &&
      (!form.ring_size ||
        !d.ring_sizes || d.ring_sizes.length === 0 ||
        d.ring_sizes.includes(Number(form.ring_size)))
    ),
    [doughs, form.ring_size]
  );
  const recheios = useMemo(() => doughs.filter((d) => d.category === "recheio"), [doughs]);
  const coberturas = useMemo(() => doughs.filter((d) => d.category === "cobertura"), [doughs]);

  // Live preview
  useEffect(() => {
    let cancelled = false;
    const body = {
      ...form,
      ring_size: Number(form.ring_size),
      extra_cost: Number(form.extra_cost || 0),
      margin_percent: Number(form.margin_percent || 0),
      coating_id: form.coating_id || null,
    };
    if (!body.dough_id) {
      setPreview({ total_cost: 0, final_price: 0 });
      return;
    }
    api.post("/cakes/preview", body).then((r) => {
      if (!cancelled) setPreview(r.data);
    });
    return () => { cancelled = true; };
  }, [form]);

  const toggleFilling = (id) => {
    const has = form.filling_ids.includes(id);
    setForm({
      ...form,
      filling_ids: has ? form.filling_ids.filter((x) => x !== id) : [...form.filling_ids, id],
    });
  };

  const reset = () => {
    setEditing(null);
    setForm({ ...EMPTY_CAKE, name: "" });
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Dê um nome para esse bolo");
      return;
    }
    if (!form.dough_id) {
      toast.error("Selecione uma massa");
      return;
    }
    const body = {
      ...form,
      ring_size: Number(form.ring_size),
      extra_cost: Number(form.extra_cost || 0),
      margin_percent: Number(form.margin_percent || 0),
      coating_id: form.coating_id || null,
    };
    try {
      if (editing) await api.put(`/cakes/${editing.id}`, body);
      else await api.post("/cakes", body);
      toast.success(editing ? "Bolo atualizado" : "Bolo salvo!");
      reload();
      reset();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const edit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      ring_size: c.ring_size,
      dough_id: c.dough_id,
      filling_ids: c.filling_ids,
      coating_id: c.coating_id || "",
      extra_cost: c.extra_cost,
      margin_percent: c.margin_percent,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir este bolo?")) return;
    await api.delete(`/cakes/${id}`);
    toast.success("Excluído");
    reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Builder form */}
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary/20 flex items-center justify-center">
              <CakeIcon className="h-5 w-5 text-rosedeep" />
            </div>
            <div className="flex-1">
              <h3 className="heading-serif text-2xl">
                {editing ? "Editando bolo" : "Monte seu bolo"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Escolha os componentes e veja custo + preço em tempo real.
              </p>
            </div>
            {editing && (
              <Button variant="outline" onClick={reset}>Novo</Button>
            )}
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Nome do bolo *</Label>
                <Input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Bolo Chocolate Ninho"
                  data-testid="cake-name" />
              </div>
              <div>
                <Label>Tamanho (Aro)</Label>
                <Select value={form.ring_size}
                  onChange={(e) => setForm({ ...form, ring_size: e.target.value })}>
                  {RINGS.map((r) => <option key={r} value={r}>Aro {r}</option>)}
                </Select>
              </div>
            </div>

            {/* Massa */}
            <div>
              <Label>Massa base *</Label>
              {massas.length === 0 ? (
                <div className="text-sm text-muted-foreground italic py-3 px-4 bg-muted/40 rounded-2xl">
                  Nenhuma massa cadastrada para Aro {form.ring_size}. Cadastre em Receitas.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {massas.map((m) => {
                    const active = form.dough_id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setForm({ ...form, dough_id: m.id })}
                        className={`text-left px-4 py-3 rounded-2xl border-2 transition ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                        data-testid={`cake-massa-${m.id}`}
                      >
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{brl(m.total_cost)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recheios */}
            <div>
              <Label>Recheios (selecione um ou mais)</Label>
              {recheios.length === 0 ? (
                <div className="text-sm text-muted-foreground italic py-3 px-4 bg-muted/40 rounded-2xl">
                  Nenhum recheio cadastrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recheios.map((r) => {
                    const active = form.filling_ids.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleFilling(r.id)}
                        className={`text-left px-4 py-3 rounded-2xl border-2 transition ${
                          active
                            ? "border-secondary bg-secondary/20"
                            : "border-border hover:bg-muted/50"
                        }`}
                        data-testid={`cake-recheio-${r.id}`}
                      >
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{brl(r.total_cost)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cobertura */}
            {coberturas.length > 0 && (
              <div>
                <Label>Cobertura (opcional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coating_id: "" })}
                    className={`text-left px-4 py-3 rounded-2xl border-2 transition ${
                      !form.coating_id ? "border-foreground bg-muted" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-medium text-sm">Sem cobertura</p>
                  </button>
                  {coberturas.map((c) => {
                    const active = form.coating_id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setForm({ ...form, coating_id: c.id })}
                        className={`text-left px-4 py-3 rounded-2xl border-2 transition ${
                          active ? "border-accent-foreground bg-accent/40" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{brl(c.total_cost)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Adjustments */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Custo extra (R$)</Label>
                <Input type="number" step="0.01" value={form.extra_cost}
                  onChange={(e) => setForm({ ...form, extra_cost: e.target.value })}
                  placeholder="Decoração, embalagem..." />
              </div>
              <div>
                <Label>Margem de lucro (%)</Label>
                <Input type="number" step="1" value={form.margin_percent}
                  onChange={(e) => setForm({ ...form, margin_percent: e.target.value })} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky preview & save panel */}
      <div className="space-y-4">
        <Card className="p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-gold" />
            <h3 className="heading-serif text-xl">Resumo</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Cálculo em tempo real
          </p>

          <div className="space-y-3">
            <div className="bg-muted/40 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                Custo total
              </p>
              <p className="heading-serif text-2xl">{brl(preview.total_cost)}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                Preço sugerido
              </p>
              <p className="heading-serif text-3xl text-gold">{brl(preview.final_price)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {form.margin_percent}%
              </p>
            </div>
            <Button onClick={save} className="w-full" data-testid="cake-save">
              <Sparkles className="h-4 w-4" /> {editing ? "Atualizar bolo" : "Salvar bolo"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Saved cakes list */}
      <div className="lg:col-span-3 mt-2">
        <h3 className="heading-serif text-2xl mb-4">Bolos salvos</h3>
        {cakes.length === 0 ? (
          <Card>
            <EmptyState
              icon={CakeIcon}
              title="Nenhum bolo salvo"
              description="Monte seu primeiro bolo e ele aparecerá aqui."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {cakes.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ y: -3 }}
                  className="bg-card border border-border rounded-2xl p-5"
                  data-testid={`cake-card-${c.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="heading-serif text-2xl truncate">{c.name}</h4>
                      <Badge variant="primary" className="mt-1">Aro {c.ring_size}</Badge>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => edit(c)} className="p-2 rounded-xl hover:bg-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c.id)}
                        className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {c.dough_name}
                    {c.filling_names?.length > 0 && ` · ${c.filling_names.join(", ")}`}
                    {c.coating_name && ` · ${c.coating_name}`}
                  </p>
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Custo</p>
                      <p className="text-sm font-medium">{brl(c.total_cost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Preço</p>
                      <p className="heading-serif text-2xl text-gold">{brl(c.final_price)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
