import React from "react";
import { motion } from "framer-motion";
import { Cake, Sparkles, Heart } from "lucide-react";
import { LuxuryLoginCard } from "./LoginCard/LuxuryLoginCard";

/**
 * AnimatedHero orchestrates a 100vw x 100vh full-screen background video loop at 30 FPS,
 * with unblocked page scrolling, mouse-driven dynamic lighting & parallax, floating particles,
 * and a glassmorphic login form overlay.
 */
export function AnimatedHero() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f8f3ee] text-stone-900 selection:bg-rose-200 selection:text-rose-900">
      <img
        src="/frame/frame (1).jpg"
        alt="Bolo decorado em uma confeitaria"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fffaf4]/95 via-[#fffaf4]/80 to-[#fffaf4]/40" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-6 sm:px-10 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/85 shadow-sm">
              <Cake className="h-6 w-6 text-rose-500" />
            </div>
            <span className="heading-serif text-2xl font-bold sm:text-3xl">SweetControl</span>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase text-stone-700 sm:flex">
            <Sparkles className="h-4 w-4 text-amber-500" /> Gestão de Confeitaria
          </span>
        </header>

        <main className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-xl"
          >
            <h1 className="heading-serif text-4xl font-bold leading-tight sm:text-6xl">
              Cada bolo,
              <br />
              <span className="font-normal italic text-rose-600">no controle certo.</span>
            </h1>
            <p className="mt-5 max-w-md rounded-xl border border-white/70 bg-white/60 p-5 text-base leading-relaxed text-stone-700">
              Gerencie encomendas, custos, estoque e receitas da sua confeitaria com clareza.
            </p>
          </motion.section>

          <section className="flex justify-center lg:justify-end">
            <LuxuryLoginCard />
          </section>
        </main>

        <footer className="flex items-center justify-between gap-3 text-xs font-medium text-stone-600">
          <span>&copy; {new Date().getFullYear()} SweetControl · Todos os direitos reservados</span>
          <span className="hidden items-center gap-1.5 sm:flex">
            Feito com carinho <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </span>
        </footer>
      </div>
    </div>
  );
}
