import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cake, Lock, Mail, Sparkles, User, ArrowRight, CheckCircle2 } from "lucide-react";
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
  const [email, setEmail] = useState("admin@sweetcontrol.com");
  const [password, setPassword] = useState("sweet123");
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
      initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="w-full max-w-md relative z-20"
    >
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-rose-300/40 via-purple-300/30 to-amber-200/40 blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative bg-white/75 backdrop-blur-2xl border border-white/80 rounded-[30px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(74,45,53,0.12)] overflow-hidden">
        {/* Decorative Top Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-rose-800 text-xs font-medium tracking-wider uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SweetControl System
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
            <h1 className="heading-serif text-3xl sm:text-4xl text-stone-900 leading-tight mb-2">
              {mode === "login" ? "Bem-vinda de volta 🌸" : "Criar sua conta ✨"}
            </h1>
            <p className="text-sm text-stone-600 mb-7">
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
                <Label className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Nome Completo
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400 group-focus-within:text-rose-600 transition-colors" />
                  <Input
                    className="pl-10 h-12 rounded-2xl bg-stone-50/80 border-stone-200/80 focus:bg-white focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400 text-stone-800 transition-all shadow-inner"
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
            <Label className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 block">
              E-mail Comercial
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400 group-focus-within:text-rose-600 transition-colors" />
              <Input
                type="email"
                className="pl-10 h-12 rounded-2xl bg-stone-50/80 border-stone-200/80 focus:bg-white focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400 text-stone-800 transition-all shadow-inner"
                placeholder="voce@confeitaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 block">
              Senha de Acesso
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400 group-focus-within:text-rose-600 transition-colors" />
              <Input
                type="password"
                className="pl-10 h-12 rounded-2xl bg-stone-50/80 border-stone-200/80 focus:bg-white focus:ring-2 focus:ring-rose-300/60 focus:border-rose-400 text-stone-800 transition-all shadow-inner"
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
              className="w-full h-12 rounded-2xl mt-3 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-700 text-white font-semibold shadow-lg shadow-rose-400/35 border border-rose-300/50 flex items-center justify-center gap-2 btn-shine transition-all"
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
              className="text-xs font-medium text-rose-600 text-center mt-2"
              data-testid="auth-error"
            >
              {error}
            </motion.p>
          )}
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-6 text-center text-xs sm:text-sm text-stone-600">
          {mode === "login" ? "Ainda não tem cadastro? " : "Já possui cadastro? "}
          <button
            type="button"
            className="text-rose-600 font-semibold hover:text-rose-800 underline decoration-rose-300 underline-offset-4 transition-colors"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            data-testid="toggle-mode"
          >
            {mode === "login" ? "Criar conta agora" : "Fazer Login"}
          </button>
        </div>

        {/* Quick Demo Credentials Footer */}
        <div className="mt-6 pt-4 border-t border-rose-100/80 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Demo: <strong className="text-stone-700">admin@sweetcontrol.com</strong> · <strong className="text-stone-700">sweet123</strong></span>
        </div>
      </div>
    </motion.div>
  );
}
