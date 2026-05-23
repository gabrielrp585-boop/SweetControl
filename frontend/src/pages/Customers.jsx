import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Users, Search, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api, brl } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, EmptyState, Modal, Textarea, Badge,
} from "@/components/ui-kit";

export default function Customers() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const load = async () => {
    const { data } = await api.get("/customers");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => items.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", phone: "", address: "", notes: "" });
    setOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, address: c.address, notes: c.notes });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/customers/${editing.id}`, form);
      else await api.post("/customers", form);
      toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
      setOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir este cliente?")) return;
    await api.delete(`/customers/${id}`);
    toast.success("Excluído");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Cadastro e histórico de pedidos das suas clientes mais doces."
        action={
          <Button onClick={openNew} data-testid="new-customer-btn">
            <Plus className="h-4 w-4" /> Novo cliente
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          className="pl-10"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          data-testid="customer-search"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Nenhuma cliente ainda"
            description="Adicione clientes para acompanhar pedidos e fidelizar."
            action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Novo cliente</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -3 }}
                className="bg-card border border-border rounded-2xl p-5"
                data-testid={`customer-card-${c.id}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-primary-foreground heading-serif text-xl">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-serif text-xl truncate">{c.name}</h3>
                    {c.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </p>
                    )}
                  </div>
                </div>
                {c.address && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1 mb-2">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{c.address}</span>
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total gasto</p>
                    <p className="heading-serif text-xl text-gold">{brl(c.total_spent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Pedidos</p>
                    <p className="heading-serif text-xl">{c.order_count}</p>
                  </div>
                </div>
                <div className="flex gap-1 justify-end mt-3">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-xl hover:bg-muted">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(c.id)}
                    className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar cliente" : "Novo cliente"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes}
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
