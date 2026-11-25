import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cake, Lock, Mail, Sparkles, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Label } from "@/components/ui-kit";
import { toast } from "sonner";

/**
 * LuxuryLoginCard renders an Awwwards-level glassmorphic auth form
 * with micro-interactions, smooth entrance animations, and full authentication integration.
 */
export function LuxuryLoginCard() {
  const { user, login, register, error } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok =
      mode === "login"
        ? await login(email, password)
        : await register(name, email, password);
    setLoading(false);
    if (ok) {
      toast.success(mode === "login" ? "Bem-vinda de volta!" : "Conta criada com sucesso!");
      navigate("/");
    } else {
      toast.error(error || "Falha na autenticação. Verifique os dados.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md relative z-20"
    >
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1.5 rounded-[34px] bg-gradient-to-r from-rose-400/35 via-purple-400/25 to-amber-300/35 blur-2xl opacity-75 pointer-events-none" />

      {/* Main Liquid Glass Card Container */}
      <div className="relative liquid-glass liquid-glass-interactive rounded-[30px] p-8 sm:p-10 overflow-hidden">
        {/* Specular Top Shimmer Line */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        {/* Decorative Top Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/30 text-rose-100 text-xs font-medium tracking-wider uppercase mb-6 shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> SweetControl System
        </div>

        {/* Card Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="heading-serif text-3xl sm:text-4xl font-bold text-white leading-tight mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
              {mode === "login" ? "Bem-vinda de volta 🌸" : "Criar sua conta ✨"}
            </h1>
            <p className="text-sm font-medium text-white/95 mb-7 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
              {mode === "login"
                ? "Acesse o painel para gerenciar sua confeitaria com requinte."
                : "Cadastre-se para experimentar o melhor controle de encomendas."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Form Elements */}
        <form onSubmit={submit} className="space-y-4" data-testid="auth-form">
          <AnimatePresence mode="sync">
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Label className="text-xs font-bold uppercase tracking-wider !text-white mb-1.5 block drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                  Nome Completo
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300 group-focus-within:text-rose-200 transition-colors" />
                  <Input
                    className="pl-10 h-12 rounded-2xl !bg-black/45 !border-white/35 focus:!bg-black/60 focus:ring-2 focus:ring-rose-300/70 focus:!border-rose-300 !text-white font-medium placeholder:!text-white/70 transition-all"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="input-name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider !text-white mb-1.5 block drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              E-mail Comercial
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300 group-focus-within:text-rose-200 transition-colors" />
              <Input
                type="email"
                className="pl-10 h-12 rounded-2xl !bg-black/45 !border-white/35 focus:!bg-black/60 focus:ring-2 focus:ring-rose-300/70 focus:!border-rose-300 !text-white font-medium placeholder:!text-white/70 transition-all"
                placeholder="voce@confeitaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider !text-white mb-1.5 block drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              Senha de Acesso
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300 group-focus-within:text-rose-200 transition-colors" />
              <Input
                type="password"
                className="pl-10 h-12 rounded-2xl !bg-black/45 !border-white/35 focus:!bg-black/60 focus:ring-2 focus:ring-rose-300/70 focus:!border-rose-300 !text-white font-medium placeholder:!text-white/70 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>
          </div>

          {/* Submit Button with Hover Shine & Spring Micro-Animation */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl mt-3 bg-gradient-to-r from-rose-500 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 !text-white font-bold shadow-lg shadow-rose-500/40 border border-white/40 flex items-center justify-center gap-2 btn-shine transition-all"
              data-testid="submit-auth"
            >
              {loading ? (
                "Acessando..."
              ) : (
                <>
                  <span>{mode === "login" ? "Entrar no Sistema" : "Criar Minha Conta"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-semibold text-rose-200 text-center mt-2 drop-shadow"
              data-testid="auth-error"
            >
              {error}
            </motion.p>
          )}
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-6 text-center text-xs sm:text-sm font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
          {mode === "login" ? "Ainda não tem cadastro? " : "Já possui cadastro? "}
          <button
            type="button"
            className="text-rose-200 font-bold hover:text-white underline decoration-rose-300 underline-offset-4 transition-colors"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            data-testid="toggle-mode"
          >
            {mode === "login" ? "Criar conta agora" : "Fazer Login"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
