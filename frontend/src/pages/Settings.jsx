import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { PageHeader, Card, Button, Input, Label, Textarea } from "@/components/ui-kit";
import { useTheme } from "@/context/ThemeContext";

export default function Settings() {
  const [form, setForm] = useState({
    business_name: "", owner_name: "", address: "", phone: "",
    logo_url: "", default_margin: 100, instagram: "",
    hosting_fee: 20, hosting_pix_key: "14725941697",
    hosting_pix_name: "", hosting_due_day: 5,
  });
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    api.get("/settings").then((r) => {
      setForm(r.data);
      setLoading(false);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings", {
        ...form,
        default_margin: Number(form.default_margin),
        hosting_fee: Number(form.hosting_fee),
        hosting_due_day: Number(form.hosting_due_day),
      });
      toast.success("Configurações salvas");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (loading) {
    return <div className="h-40 rounded-2xl bg-muted animate-pulse" />;
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Personalize sua confeitaria, margem padrão e tema do sistema."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="heading-serif text-2xl mb-5">Dados da Confeitaria</h2>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="settings-form">
              <div className="sm:col-span-2">
                <Label>Nome da confeitaria</Label>
                <Input value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div>
                <Label>Proprietária</Label>
                <Input value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input value={form.instagram} placeholder="@suaconfeitaria"
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              </div>
              <div>
                <Label>Margem padrão (%)</Label>
                <Input type="number" value={form.default_margin}
                  onChange={(e) => setForm({ ...form, default_margin: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>URL do Logo</Label>
                <Input value={form.logo_url} placeholder="https://..."
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" data-testid="save-settings">
                  <Save className="h-4 w-4" /> Salvar alterações
                </Button>
              </div>
            </form>
          </Card>

          {/* Hosting billing config */}
          <Card className="p-6 mt-6">
            <h2 className="heading-serif text-2xl mb-1">Cobrança da Hospedagem</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Configure os dados que aparecem na aba Suporte para a cliente realizar o pagamento mensal.
            </p>
            <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Valor mensal (R$)</Label>
                <Input type="number" step="0.01" value={form.hosting_fee}
                  onChange={(e) => setForm({ ...form, hosting_fee: e.target.value })}
                  data-testid="hosting-fee" />
              </div>
              <div>
                <Label>Dia de vencimento</Label>
                <Input type="number" min="1" max="28" value={form.hosting_due_day}
                  onChange={(e) => setForm({ ...form, hosting_due_day: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Chave PIX</Label>
                <Input value={form.hosting_pix_key}
                  onChange={(e) => setForm({ ...form, hosting_pix_key: e.target.value })}
                  placeholder="CPF, email, telefone ou chave aleatória"
                  data-testid="hosting-pix-key" />
              </div>
              <div className="sm:col-span-2">
                <Label>Nome no PIX</Label>
                <Input value={form.hosting_pix_name}
                  onChange={(e) => setForm({ ...form, hosting_pix_name: e.target.value })}
                  placeholder="Seu nome completo" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4" /> Salvar cobrança
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="heading-serif text-2xl mb-1">Tema</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Escolha entre o modo claro elegante ou o modo escuro feminino.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setTheme("light")}
                className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                  theme === "light" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                }`}
                data-testid="theme-light"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-100 via-amber-100 to-purple-100 flex items-center justify-center">
                    <Sun className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-medium">Claro</p>
                    <p className="text-xs text-muted-foreground">Rosa, nude e dourado</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                  theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                }`}
                data-testid="theme-dark"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-900 via-rose-900 to-amber-900 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-rose-200" />
                  </div>
                  <div>
                    <p className="font-medium">Escuro</p>
                    <p className="text-xs text-muted-foreground">Aubergine e rosa</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
