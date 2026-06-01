import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LifeBuoy, Send, MessageCircle, Bug, Lightbulb, HelpCircle, Trash2,
  Clock, CheckCircle2, AlertCircle, ImagePlus, X,
} from "lucide-react";
import { toast } from "sonner";
import { api, fmtDate } from "@/services/api";
import {
  PageHeader, Card, Button, Input, Label, Select, Textarea, EmptyState, Modal, Badge,
} from "@/components/ui-kit";
import { useAuth } from "@/context/AuthContext";
import HostingBilling from "@/components/HostingBilling";
import { compressMany } from "@/lib/imageUtils";

const CATEGORIES = [
  { value: "bug", label: "Bug / Erro", icon: Bug, variant: "danger" },
  { value: "duvida", label: "Dúvida", icon: HelpCircle, variant: "primary" },
  { value: "sugestao", label: "Sugestão", icon: Lightbulb, variant: "accent" },
  { value: "outro", label: "Outro", icon: MessageCircle, variant: "default" },
];

const PRIORITIES = [
  { value: "baixa", label: "Baixa", variant: "default" },
  { value: "media", label: "Média", variant: "warning" },
  { value: "alta", label: "Alta", variant: "danger" },
];

const STATUSES = [
  { value: "aberto", label: "Aberto", icon: AlertCircle, variant: "warning" },
  { value: "em_andamento", label: "Em andamento", icon: Clock, variant: "primary" },
  { value: "resolvido", label: "Resolvido", icon: CheckCircle2, variant: "success" },
  { value: "fechado", label: "Fechado", icon: CheckCircle2, variant: "default" },
];

export default function Support() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [form, setForm] = useState({
    subject: "", message: "", category: "bug", priority: "media", images: [],
  });
  const [replyImages, setReplyImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/support");
    setItems(data);
    if (detail) {
      const upd = data.find((t) => t.id === detail.id);
      if (upd) setDetail(upd);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/support", form);
      toast.success("Mensagem enviada! Em breve teremos retorno.");
      setOpen(false);
      setForm({ subject: "", message: "", category: "bug", priority: "media", images: [] });
      load();
    } catch {
      toast.error("Erro ao enviar");
    }
  };

  const handleFiles = async (files, target) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const imgs = await compressMany(files, 5);
      if (target === "new") {
        setForm((f) => ({ ...f, images: [...(f.images || []), ...imgs].slice(0, 5) }));
      } else {
        setReplyImages((arr) => [...arr, ...imgs].slice(0, 5));
      }
      toast.success(`${imgs.length} imagem(ns) anexada(s)`);
    } catch {
      toast.error("Erro ao processar imagem");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx, target) => {
    if (target === "new") {
      setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    } else {
      setReplyImages((arr) => arr.filter((_, i) => i !== idx));
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyMsg.trim() && replyImages.length === 0) return;
    try {
      await api.post(`/support/${detail.id}/reply`, {
        message: replyMsg,
        images: replyImages,
      });
      setReplyMsg("");
      setReplyImages([]);
      toast.success("Resposta enviada");
      load();
    } catch {
      toast.error("Erro ao enviar resposta");
    }
  };

  const changeStatus = async (status) => {
    await api.put(`/support/${detail.id}/status`, { status });
    toast.success("Status atualizado");
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir este ticket?")) return;
    await api.delete(`/support/${id}`);
    toast.success("Ticket excluído");
    if (detail?.id === id) setDetail(null);
    load();
  };

  const getCategory = (v) => CATEGORIES.find((c) => c.value === v) || CATEGORIES[3];
  const getStatus = (v) => STATUSES.find((s) => s.value === v) || STATUSES[0];
  const getPriority = (v) => PRIORITIES.find((p) => p.value === v) || PRIORITIES[1];

  return (
    <div>
      <PageHeader
        title="Suporte"
        subtitle="Relate bugs, dúvidas ou sugestões. Você terá retorno por aqui mesmo."
        action={
          <Button onClick={() => setOpen(true)} data-testid="new-ticket-btn">
            <Plus className="h-4 w-4" /> Novo ticket
          </Button>
        }
      />

      {/* Hosting billing card */}
      <HostingBilling />

      {/* Hero info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {CATEGORIES.slice(0, 3).map((c) => (
          <div key={c.value} className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
              c.variant === "danger" ? "bg-destructive/15 text-destructive" :
              c.variant === "primary" ? "bg-primary/20 text-primary-foreground dark:text-primary" :
              "bg-accent/40 text-accent-foreground dark:text-accent"
            }`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">
                {c.value === "bug" && "Algo não está funcionando?"}
                {c.value === "duvida" && "Tem dúvida de uso?"}
                {c.value === "sugestao" && "Quer pedir melhoria?"}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tickets list */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="heading-serif text-xl">Tickets</h3>
              <Badge variant="primary">{items.length}</Badge>
            </div>
            {items.length === 0 ? (
              <EmptyState
                icon={LifeBuoy}
                title="Nenhum ticket"
                description="Abra um ticket para reportar problemas ou tirar dúvidas."
                action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo ticket</Button>}
              />
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-auto">
                <AnimatePresence>
                  {items.map((t) => {
                    const cat = getCategory(t.category);
                    const st = getStatus(t.status);
                    const active = detail?.id === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDetail(t)}
                        className={`w-full text-left px-5 py-4 hover:bg-muted/40 transition ${
                          active ? "bg-primary/10" : ""
                        }`}
                        data-testid={`ticket-${t.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <cat.icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={st.variant}>{st.label}</Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {fmtDate(t.created_at)}
                              </span>
                            </div>
                            <p className="font-medium text-sm truncate">{t.subject}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {t.message}
                            </p>
                            {t.replies.length > 0 && (
                              <p className="text-[10px] text-rosedeep mt-1 flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {t.replies.length} resposta{t.replies.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {!detail ? (
            <Card>
              <EmptyState
                icon={MessageCircle}
                title="Selecione um ticket"
                description="Clique em um ticket à esquerda para ver detalhes e respostas."
              />
            </Card>
          ) : (
            <motion.div
              key={detail.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="heading-serif text-3xl flex-1">{detail.subject}</h2>
                    <button
                      onClick={() => remove(detail.id)}
                      className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getCategory(detail.category).variant}>
                      {getCategory(detail.category).label}
                    </Badge>
                    <Badge variant={getPriority(detail.priority).variant}>
                      Prioridade {getPriority(detail.priority).label}
                    </Badge>
                    <Select
                      value={detail.status}
                      onChange={(e) => changeStatus(e.target.value)}
                      className="!w-auto !py-1 !px-3 text-xs"
                      data-testid="ticket-status"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Por <strong>{detail.author_name}</strong> · {fmtDate(detail.created_at)}
                  </p>
                </div>

                {/* Thread */}
                <div className="p-6 space-y-4 max-h-[400px] overflow-auto">
                  <div className="bg-muted/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {detail.author_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{detail.author_name}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{detail.message}</p>
                    {detail.images && detail.images.length > 0 && (
                      <ImageGrid images={detail.images} />
                    )}
                  </div>

                  {detail.replies.map((r) => {
                    const isOwn = r.author_email === user?.email;
                    return (
                      <div
                        key={r.id}
                        className={`rounded-2xl p-4 ${
                          isOwn ? "bg-primary/15 ml-8" : "bg-muted/40 mr-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
                              {r.author_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{r.author_name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {fmtDate(r.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                        {r.images && r.images.length > 0 && (
                          <ImageGrid images={r.images} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={sendReply} className="p-6 border-t border-border" data-testid="reply-form">
                  <Label>Responder</Label>
                  <Textarea
                    value={replyMsg}
                    onChange={(e) => setReplyMsg(e.target.value)}
                    placeholder="Escreva sua resposta..."
                  />
                  <ImageUploader
                    images={replyImages}
                    onAdd={(files) => handleFiles(files, "reply")}
                    onRemove={(i) => removeImage(i, "reply")}
                    uploading={uploading}
                    testIdPrefix="reply"
                  />
                  <div className="flex justify-end mt-3">
                    <Button type="submit" data-testid="send-reply">
                      <Send className="h-4 w-4" /> Enviar resposta
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Abrir novo ticket" maxWidth="max-w-xl">
        <form onSubmit={submit} className="space-y-4" data-testid="ticket-form">
          <div>
            <Label>Assunto *</Label>
            <Input required value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Resumo do problema ou pedido" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Descrição *</Label>
            <Textarea required value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Descreva detalhadamente o problema ou sua dúvida..."
              className="min-h-[140px]" />
          </div>
          <ImageUploader
            images={form.images}
            onAdd={(files) => handleFiles(files, "new")}
            onRemove={(i) => removeImage(i, "new")}
            uploading={uploading}
            testIdPrefix="new"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit"><Send className="h-4 w-4" /> Enviar ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ============================================================================
// IMAGE COMPONENTS
// ============================================================================
function ImageUploader({ images, onAdd, onRemove, uploading, testIdPrefix }) {
  const id = `${testIdPrefix}-img-input`;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <Label className="mb-0">
          Imagens {images.length > 0 && <span className="text-muted-foreground">({images.length}/5)</span>}
        </Label>
        <label
          htmlFor={id}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-border cursor-pointer transition ${
            uploading ? "opacity-50 cursor-wait" : "hover:bg-muted"
          }`}
          data-testid={`${testIdPrefix}-add-image`}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {uploading ? "Processando..." : "Anexar imagem"}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading || images.length >= 5}
          onChange={(e) => { onAdd(e.target.files); e.target.value = ""; }}
        />
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line */}
              <img src={src} alt={`anexo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageGrid({ images }) {
  const [preview, setPreview] = useState(null);
  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPreview(src)}
            className="aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition"
          >
            {/* eslint-disable-next-line */}
            <img src={src} alt={`anexo ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line */}
          <img src={preview} alt="preview" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </>
  );
}
