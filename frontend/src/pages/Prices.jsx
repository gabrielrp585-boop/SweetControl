import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";
import { api, brl } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, Select, EmptyState, Modal, Badge,
} from "@/components/ui-kit";

const CATEGORIES = [
  { value: "comum", label: "Comum" },
  { value: "gourmet", label: "Gourmet" },
  { value: "2_andares", label: "2 Andares" },
  { value: "3_andares", label: "3 Andares" },
];
const RINGS = [10, 15, 20, 25, 30];

export default function Prices() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    ring_size: 20, category: "comum", cost: 0, margin_percent: 100, price: 0, notes: "",
  });

  const load = async () => {
    const { data } = await api.get("/prices");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const matrix = useMemo(() => {
    const m = {};
    RINGS.forEach((r) => {
      m[r] = {};
      CATEGORIES.forEach((c) => (m[r][c.value] = null));
    });
    items.forEach((p) => {
      if (m[p.ring_size] && CATEGORIES.find((c) => c.value === p.category)) {
        m[p.ring_size][p.category] = p;
      }
    });
    return m;
  }, [items]);

  const openNew = (ring = 20, category = "comum") => {
    setEditing(null);
    setForm({ ring_size: ring, category, cost: 0, margin_percent: 100, price: 0, notes: "" });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const autoPrice = () => {
    const c = Number(form.cost || 0);
    const m = Number(form.margin_percent || 0);
    setForm((f) => ({ ...f, price: Number((c * (1 + m / 100)).toFixed(2)) }));
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      ring_size: Number(form.ring_size),
      cost: Number(form.cost),
      margin_percent: Number(form.margin_percent),
      price: Number(form.price),
    };
    try {
      if (editing) await api.put(`/prices/${editing.id}`, body);
      else await api.post("/prices", body);
      toast.success("Preço salvo");
      setOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir este preço?")) return;
    await api.delete(`/prices/${id}`);
    toast.success("Excluído");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Tabela de Preços"
        subtitle="Defina preços por aro e categoria com cálculo automático de margem."
        action={
          <Button onClick={() => openNew()} data-testid="new-price-btn">
            <Plus className="h-4 w-4" /> Novo preço
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  Aro
                </th>
                {CATEGORIES.map((c) => (
                  <th key={c.value} className="px-3 py-4 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RINGS.map((ring) => (
                <tr key={ring} className="border-b border-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center heading-serif text-lg">
                        {ring}
                      </div>
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                  </td>
                  {CATEGORIES.map((c) => {
                    const cell = matrix[ring][c.value];
                    return (
                      <td key={c.value} className="px-3 py-4">
                        {cell ? (
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="group bg-muted/40 hover:bg-muted/70 rounded-2xl p-3 border border-border/70 cursor-pointer"
                            onClick={() => openEdit(cell)}
                            data-testid={`price-cell-${ring}-${c.value}`}
                          >
                            <p className="heading-serif text-xl text-foreground">
                              {brl(cell.price)}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              custo {brl(cell.cost)} · {cell.margin_percent}%
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 mt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEdit(cell); }}
                                className="p-1 rounded-lg hover:bg-card"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); remove(cell.id); }}
                                className="p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => openNew(ring, c.value)}
                            className="w-full border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-2xl px-3 py-5 text-xs transition"
                          >
                            <Plus className="h-4 w-4 mx-auto mb-1" />
                            Definir
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar preço" : "Novo preço"}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Aro</Label>
              <Select value={form.ring_size}
                onChange={(e) => setForm({ ...form, ring_size: e.target.value })}>
                {RINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Custo (R$)</Label>
              <Input type="number" step="0.01" value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div>
              <Label>Margem (%)</Label>
              <Input type="number" step="1" value={form.margin_percent}
                onChange={(e) => setForm({ ...form, margin_percent: e.target.value })} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Preço final (R$)</Label>
              <button type="button" onClick={autoPrice}
                className="text-xs text-rosedeep hover:underline">
                Calcular auto
              </button>
            </div>
            <Input type="number" step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label>Notas</Label>
            <Input value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
