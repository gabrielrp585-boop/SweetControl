import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, ClipboardList, Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api, brl, fmtDate } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, Select, Textarea, Badge, EmptyState, Modal,
} from "@/components/ui-kit";

const STATUS = [
  { value: "pendente", label: "Pendente", variant: "warning" },
  { value: "em_preparo", label: "Em preparo", variant: "primary" },
  { value: "finalizado", label: "Finalizado", variant: "accent" },
  { value: "entregue", label: "Entregue", variant: "success" },
];

const EMPTY = {
  customer_name: "", phone: "", address: "", delivery_date: "",
  ring_size: 20, dough: "", fillings: "", observations: "",
  total: 0, status: "pendente",
};

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterStatus, setFilterStatus] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/orders");
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (o) =>
          (!filterStatus || o.status === filterStatus) &&
          (!q || o.customer_name.toLowerCase().includes(q.toLowerCase()))
      ),
    [items, filterStatus, q]
  );

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, delivery_date: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    setForm({ ...o, fillings: (o.fillings || []).join(", ") });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      ring_size: Number(form.ring_size),
      total: Number(form.total),
      fillings: form.fillings
        ? form.fillings.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editing) {
        await api.put(`/orders/${editing.id}`, body);
        toast.success("Encomenda atualizada");
      } else {
        await api.post("/orders", body);
        toast.success("Encomenda criada");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error("Erro ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir esta encomenda?")) return;
    await api.delete(`/orders/${id}`);
    toast.success("Encomenda excluída");
    load();
  };

  const changeStatus = async (o, status) => {
    await api.put(`/orders/${o.id}`, { ...o, status });
    toast.success("Status atualizado");
    load();
  };

  const getBadge = (s) => STATUS.find((x) => x.value === s) || STATUS[0];

  const sendWhatsapp = (o) => {
    const phoneRaw = (o.phone || "").replace(/\D/g, "");
    if (!phoneRaw) {
      toast.error("Cliente sem telefone cadastrado");
      return;
    }
    // Adiciona código do Brasil se ausente
    const phone = phoneRaw.startsWith("55") ? phoneRaw : `55${phoneRaw}`;
    const date = o.delivery_date
      ? new Date(o.delivery_date).toLocaleDateString("pt-BR")
      : "—";
    const fillings = o.fillings?.length ? o.fillings.join(", ") : "—";
    const total = new Intl.NumberFormat("pt-BR", {
      style: "currency", currency: "BRL",
    }).format(Number(o.total || 0));
    const msg =
      `🎂 *Orçamento — SweetControl*\n\n` +
      `Olá, ${o.customer_name}! Segue o orçamento da sua encomenda:\n\n` +
      `📅 *Entrega:* ${date}\n` +
      `📏 *Tamanho:* Aro ${o.ring_size} cm\n` +
      `🍰 *Massa:* ${o.dough || "—"}\n` +
      `🍫 *Recheios:* ${fillings}\n` +
      (o.observations ? `📝 *Observações:* ${o.observations}\n` : "") +
      `\n💰 *Total:* ${total}\n\n` +
      `Qualquer dúvida estou à disposição! ✨`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <PageHeader
        title="Encomendas"
        subtitle="Acompanhe e gerencie as encomendas da sua confeitaria."
        action={
          <Button onClick={openNew} data-testid="new-order-btn">
            <Plus className="h-4 w-4" /> Nova encomenda
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid="order-search"
          />
        </div>
        <Select
          className="sm:w-56"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          data-testid="order-filter-status"
        >
          <option value="">Todos os status</option>
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma encomenda"
            description="Comece criando uma nova encomenda para sua cliente."
            action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Nova encomenda</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-3 py-3.5">Entrega</th>
                  <th className="px-3 py-3.5">Aro</th>
                  <th className="px-3 py-3.5">Massa</th>
                  <th className="px-3 py-3.5">Total</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((o) => {
                    const b = getBadge(o.status);
                    return (
                      <motion.tr
                        key={o.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border last:border-0 hover:bg-muted/40 transition"
                        data-testid={`order-row-${o.id}`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">{o.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{o.phone}</p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {fmtDate(o.delivery_date)}
                          </div>
                        </td>
                        <td className="px-3 py-4">{o.ring_size}</td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {o.dough || "—"}
                          {o.fillings?.length ? ` · ${o.fillings.join(", ")}` : ""}
                        </td>
                        <td className="px-3 py-4 font-medium">{brl(o.total)}</td>
                        <td className="px-3 py-4">
                          <select
                            value={o.status}
                            onChange={(e) => changeStatus(o, e.target.value)}
                            className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide font-medium bg-muted border-0 cursor-pointer focus:ring-2 focus:ring-primary/50"
                            data-testid={`order-status-${o.id}`}
                          >
                            {STATUS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => sendWhatsapp(o)}
                              className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              title="Enviar orçamento por WhatsApp"
                              data-testid={`whatsapp-order-${o.id}`}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEdit(o)}
                              className="p-2 rounded-xl hover:bg-muted"
                              data-testid={`edit-order-${o.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => remove(o.id)}
                              className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                              data-testid={`delete-order-${o.id}`}
                            >
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar encomenda" : "Nova encomenda"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="order-form">
          <div className="sm:col-span-2">
            <Label>Cliente *</Label>
            <Input
              required
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              data-testid="order-customer"
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Data de entrega *</Label>
            <Input
              type="date"
              required
              value={form.delivery_date}
              onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <Label>Aro (cm)</Label>
            <Select
              value={form.ring_size}
              onChange={(e) => setForm({ ...form, ring_size: e.target.value })}
            >
              {[10, 15, 20, 25, 30].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Massa</Label>
            <Input
              value={form.dough}
              onChange={(e) => setForm({ ...form, dough: e.target.value })}
              placeholder="Ex: chocolate, baunilha"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Recheios (separe com vírgula)</Label>
            <Input
              value={form.fillings}
              onChange={(e) => setForm({ ...form, fillings: e.target.value })}
              placeholder="Brigadeiro, Ninho, Beijinho"
            />
          </div>
          <div>
            <Label>Valor total (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
              data-testid="order-total"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" data-testid="order-save">
              {editing ? "Salvar" : "Criar encomenda"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
