import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";

const MikaaContext = createContext(null);

export function MikaaProvider({ children }) {
  const [available, setAvailable] = useState(null); // null=unknown, true/false
  const [messages, setMessages] = useState([]); // [{role,content,created_at}]
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false); // floating panel visibility
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancel = false;
    api.get("/mikaa/status")
      .then((r) => { if (!cancel) setAvailable(r.data.available); })
      .catch(() => { if (!cancel) setAvailable(false); });
    return () => { cancel = true; };
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/mikaa/history");
      setMessages(data);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (available && !loaded) loadHistory();
  }, [available, loaded, loadHistory]);

  const send = useCallback(async (text) => {
    if (!text.trim() || sending) return;
    const userMsg = { role: "user", content: text, created_at: new Date().toISOString() };
    // Use latest messages to build history for backend
    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const { data } = await api.post("/mikaa/chat", {
        history: historyForApi,
        message: text,
      });
      const aiMsg = {
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      toast.error("Mikaa não conseguiu responder agora");
      setMessages((prev) => prev.slice(0, -1)); // remove the user msg to retry
    } finally {
      setSending(false);
    }
  }, [messages, sending]);

  const clear = useCallback(async () => {
    try {
      await api.delete("/mikaa/history");
      setMessages([]);
      toast.success("Conversa limpa");
    } catch {
      toast.error("Erro ao limpar");
    }
  }, []);

  return (
    <MikaaContext.Provider
      value={{ available, messages, sending, send, clear, open, setOpen, loaded }}
    >
      {children}
    </MikaaContext.Provider>
  );
}

export const useMikaa = () => useContext(MikaaContext);
