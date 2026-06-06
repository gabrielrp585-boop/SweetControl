import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Trash2, Loader2, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMikaa } from "@/context/MikaaContext";
import { Button } from "@/components/ui-kit";

const SUGGESTIONS = [
  "Como está meu mês financeiro?",
  "Sugira margem para Aro 20 gourmet",
  "Quais ingredientes estão acabando?",
  "Que bolo recomenda hoje?",
];

export function MikaaFab() {
  const { available, open, setOpen } = useMikaa();
  if (!available) return null;
  return (
    <AnimatePresence>
      {!open && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-xl shadow-primary/40 flex items-center justify-center text-primary-foreground hover:shadow-2xl transition group"
          data-testid="mikaa-fab"
          aria-label="Abrir Mikaa"
        >
          <Sparkles className="h-6 w-6" strokeWidth={1.8} />
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function MikaaPanel() {
  const { open, setOpen, available } = useMikaa();
  if (!available) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[640px] max-h-[85vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl shadow-primary/20 overflow-hidden"
          data-testid="mikaa-panel"
        >
          <ChatHeader inDialog onClose={() => setOpen(false)} />
          <ChatBody />
          <ChatInput />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MikaaFullChat() {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden h-[calc(100vh-220px)] min-h-[500px] flex flex-col">
      <ChatHeader />
      <ChatBody />
      <ChatInput large />
    </div>
  );
}

function ChatHeader({ inDialog, onClose }) {
  const { clear, messages } = useMikaa();
  return (
    <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-md shadow-primary/30">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="heading-serif text-xl leading-none">Mikaa</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Sua assistente IA · Gemini 2.5 Flash
        </p>
      </div>
      <div className="flex items-center gap-1">
        {messages.length > 0 && (
          <button
            onClick={clear}
            title="Limpar conversa"
            className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition"
            data-testid="mikaa-clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        {inDialog && (
          <Link
            to="/mikaa"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition"
            title="Abrir em tela cheia"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
        )}
        {inDialog && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition"
            data-testid="mikaa-close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ChatBody() {
  const { messages, sending, send } = useMikaa();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
      {messages.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-primary/15 items-center justify-center mb-3">
            <Sparkles className="h-7 w-7 text-rosedeep" />
          </div>
          <h3 className="heading-serif text-2xl">Olá! 🌸</h3>
          <p className="text-sm text-muted-foreground mt-1 px-4">
            Sou a Mikaa. Pergunte qualquer coisa sobre receitas, preços, margens
            ou gestão da sua confeitaria.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2 max-w-xs mx-auto">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left text-sm px-4 py-2.5 rounded-2xl border border-border hover:bg-muted/60 transition"
                data-testid={`mikaa-suggestion-${s.slice(0, 10)}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {m.role === "assistant" && (
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}
          >
            {m.content}
          </div>
        </motion.div>
      ))}

      {sending && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
          </div>
          <div className="bg-muted rounded-2xl px-4 py-2.5 rounded-bl-sm">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Mikaa está pensando...
          </div>
        </div>
      )}
    </div>
  );
}

function ChatInput({ large }) {
  const { send, sending } = useMikaa();
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    send(text);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className={`border-t border-border bg-card/60 backdrop-blur p-3 ${large ? "px-5 py-4" : ""}`}
      data-testid="mikaa-form"
    >
      <div className="flex gap-2 items-end">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
          placeholder="Pergunte algo à Mikaa..."
          className="flex-1 resize-none rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition max-h-32"
          data-testid="mikaa-input"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !text.trim()} data-testid="mikaa-send">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
