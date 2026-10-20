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
  customer_name: "", cake_id: "", phone: "", address: "", delivery_date: "",
  ring_size: 20, dough: "", fillings: "", observations: "",
  cost_items: [], total: 0, status: "pendente",
};

export default function Orders() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [selectedCustomerId, setSelectedCustomerId] = useState("new");
  const [filterStatus, setFilterStatus] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [ordersResponse, customersResponse, cakesResponse] = await Promise.all([
        api.get("/orders"),
        api.get("/customers"),
        api.get("/cakes"),
      ]);
      setItems(ordersResponse.data);
      setCustomers(customersResponse.data);
      setCakes(cakesResponse.data);
    } catch {
      toast.error("Erro ao carregar encomendas e clientes");
    } finally {
      setLoading(false);
    }
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
    setSelectedCustomerId("new");
    setForm({ ...EMPTY, delivery_date: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    const customer = customers.find((item) => item.name === o.customer_name);
    setSelectedCustomerId(customer?.id || "new");
    setForm({ ...o, fillings: (o.fillings || []).join(", ") });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      ring_size: Number(form.ring_size),
      total: Number(form.total),
      cake_id: form.cake_id || null,
      cost_items: (form.cost_items || []).map((item) => ({ ...item, amount: Number(item.amount || 0) })),
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
  const selectedCake = cakes.find((cake) => cake.id === form.cake_id);
  const estimatedCost = Number(selectedCake?.total_cost || 0) +
    (form.cost_items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

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
                  <th className="px-3 py-3.5">Custo / lucro</th>
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
                          <p>{brl(o.cost_total)}</p>
                          <p className="text-xs text-muted-foreground">
                            Lucro: {brl(Number(o.total || 0) - Number(o.cost_total || 0))}
                          </p>
                        </td>
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
            <Select
              value={selectedCustomerId}
              onChange={(event) => {
                const customerId = event.target.value;
                setSelectedCustomerId(customerId);
                if (customerId === "new") {
                  setForm((current) => ({ ...current, customer_name: "", phone: "", address: "" }));
                  return;
                }
                const customer = customers.find((item) => item.id === customerId);
                if (customer) {
                  setForm((current) => ({
                    ...current,
                    customer_name: customer.name,
                    phone: customer.phone || "",
                    address: customer.address || "",
                  }));
                }
              }}
              data-testid="order-customer-select"
            >
              <option value="new">Novo cliente / informar nome</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </Select>
            {selectedCustomerId === "new" && (
              <Input
                required
                value={form.customer_name}
                onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                placeholder="Nome do cliente"
                className="mt-2"
                data-testid="order-customer"
              />
            )}
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
          <div className="sm:col-span-2">
            <Label>Bolo salvo / composição</Label>
            <Select
              value={form.cake_id || ""}
              onChange={(event) => {
                const cake = cakes.find((item) => item.id === event.target.value);
                setForm((current) => ({
                  ...current,
                  cake_id: event.target.value,
                  dough: cake ? cake.name : "",
                  ring_size: cake ? cake.ring_size : current.ring_size,
                  total: cake ? cake.final_price : current.total,
                }));
              }}
              data-testid="order-cake"
            >
              <option value="">Sem bolo salvo</option>
              {cakes.map((cake) => (
                <option key={cake.id} value={cake.id}>
                  {cake.name} · custo {brl(cake.total_cost)} · preço {brl(cake.final_price)}
                </option>
              ))}
            </Select>
            {form.cake_id && (
              <p className="text-xs text-muted-foreground mt-1">
                Custo da composição: {brl(selectedCake?.total_cost || 0)}
              </p>
            )}
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
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0">Gastos adicionais desta encomenda</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm((current) => ({
                  ...current,
                  cost_items: [...(current.cost_items || []), { description: "", amount: 0 }],
                }))}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar gasto
              </Button>
            </div>
            {(form.cost_items || []).map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                <Input
                  className="col-span-7"
                  value={item.description}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    cost_items: current.cost_items.map((row, index) => index === idx
                      ? { ...row, description: event.target.value } : row),
                  }))}
                  placeholder="Ex.: entrega, decoração, embalagem"
                  aria-label={`Descrição do gasto da encomenda ${idx + 1}`}
                  required
                />
                <Input
                  className="col-span-4"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.amount}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    cost_items: current.cost_items.map((row, index) => index === idx
                      ? { ...row, amount: event.target.value } : row),
                  }))}
                  placeholder="R$"
                  aria-label={`Valor do gasto da encomenda ${idx + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setForm((current) => ({
                    ...current,
                    cost_items: current.cost_items.filter((_, index) => index !== idx),
                  }))}
                  className="col-span-1 p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remover gasto da encomenda ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <p className="text-sm font-medium text-right text-foreground">
              Custo estimado da encomenda: {brl(estimatedCost)}
            </p>
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
