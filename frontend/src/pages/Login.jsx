import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cake, Lock, Mail, Sparkles, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Label } from "@/components/ui-kit";
import { toast } from "sonner";

// Pastel decorative SVG inline — no external dependencies
const LOGIN_BG_STYLE = {
  background: `
    radial-gradient(ellipse 60% 70% at 30% 25%, rgba(228,181,198,0.95), transparent 65%),
    radial-gradient(ellipse 55% 60% at 75% 70%, rgba(230,215,255,0.85), transparent 65%),
    radial-gradient(ellipse 70% 55% at 50% 100%, rgba(245,230,186,0.7), transparent 60%),
    linear-gradient(135deg, #FDFBF7 0%, #FCEDF1 45%, #F3E9F8 100%)
  `,
};

export default function Login() {
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
      toast.success(mode === "login" ? "Bem-vinda de volta!" : "Conta criada!");
      navigate("/");
    } else {
      toast.error(error || "Falha na autenticação");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 aurora-bg">
      {/* Visual Side */}
      <div className="hidden lg:block relative overflow-hidden" style={LOGIN_BG_STYLE}>
        {/* Floating decorative blobs */}
        <motion.div
          aria-hidden
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-16 w-56 h-56 rounded-full bg-white/30 backdrop-blur-2xl"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-12 w-40 h-40 rounded-full bg-secondary/40 backdrop-blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="relative h-full flex flex-col justify-between p-12 z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg shadow-primary/30">
              <Cake className="h-6 w-6 text-rosedeep" />
            </div>
            <span className="heading-serif text-3xl text-primary-foreground">SweetControl</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur text-primary-foreground text-xs uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5" /> Gestão Premium
            </div>
            <h2 className="heading-serif text-5xl xl:text-6xl text-primary-foreground leading-tight">
              Cada bolo, <br />
              <span className="italic text-rosedeep">no controle</span> certo.
            </h2>
            <p className="text-primary-foreground/90 max-w-md text-base">
              Gerencie encomendas, custos, estoque e lucro da sua confeitaria com a delicadeza
              que o seu negócio merece.
            </p>
          </motion.div>

          <div className="text-primary-foreground/70 text-xs uppercase tracking-[0.2em]">
            Feito com carinho 🌸
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Cake className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="heading-serif text-3xl">SweetControl</span>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl shadow-primary/10">
            <h1 className="heading-serif text-4xl mb-1.5">
              {mode === "login" ? "Bem-vinda 🌸" : "Criar conta"}
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              {mode === "login"
                ? "Entre para gerenciar sua confeitaria."
                : "Cadastre-se para começar."}
            </p>

            <form onSubmit={submit} className="space-y-4" data-testid="auth-form">
              {mode === "register" && (
                <div>
                  <Label>Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      data-testid="input-name"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    className="pl-10"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div>
                <Label>Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading}
                data-testid="submit-auth"
              >
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </Button>

              {error && (
                <p className="text-sm text-destructive text-center" data-testid="auth-error">
                  {error}
                </p>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "Ainda não tem conta? " : "Já tem conta? "}
              <button
                type="button"
                className="text-rosedeep font-medium hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                data-testid="toggle-mode"
              >
                {mode === "login" ? "Cadastre-se" : "Entrar"}
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-border text-center text-xs text-muted-foreground">
              Acesso demo: <span className="font-medium">admin@sweetcontrol.com</span> · {" "}
              <span className="font-medium">sweet123</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
