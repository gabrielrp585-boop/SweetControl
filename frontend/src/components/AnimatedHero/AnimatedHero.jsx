import React from "react";
import { motion } from "framer-motion";
import { Cake, Sparkles, Heart } from "lucide-react";
import { LuxuryLoginCard } from "./LoginCard/LuxuryLoginCard";

/**
 * AnimatedHero orchestrates a 100vw x 100vh full-screen high-definition seamless
 * background animation with a Liquid Glass login form overlay.
 */
export function AnimatedHero() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-transparent text-white selection:bg-rose-400/40 selection:text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-6 sm:px-10 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="liquid-glass flex h-12 w-12 items-center justify-center rounded-2xl">
              <Cake className="h-6 w-6 text-rose-300" />
            </div>
            <span className="heading-serif text-2xl font-bold tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-3xl">
              SweetControl
            </span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="liquid-glass hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-100 sm:flex"
          >
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" /> Gestão de Confeitaria
          </motion.span>
        </header>

        <main className="grid flex-1 items-center gap-6 sm:gap-10 py-6 sm:py-12 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl text-center lg:text-left mx-auto lg:mx-0"
          >
            <h1 className="heading-serif text-3xl sm:text-6xl font-bold leading-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
              Cada bolo,
              <br />
              <span className="font-normal italic text-rose-300">no controle certo.</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="liquid-glass mt-4 sm:mt-6 max-w-md rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-white/90 mx-auto lg:mx-0"
            >
              Gerencie encomendas, custos, estoque e receitas da sua confeitaria com clareza e elegância.
            </motion.p>
          </motion.section>

          <section className="flex justify-center lg:justify-end">
            <LuxuryLoginCard />
          </section>
        </main>

        <footer className="flex items-center justify-between gap-3 text-xs font-medium text-white/80 drop-shadow">
          <span>&copy; {new Date().getFullYear()} SweetControl · Todos os direitos reservados</span>
          <span className="hidden items-center gap-1.5 sm:flex">
            Feito com carinho <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400 animate-pulse" />
          </span>
        </footer>
      </div>
    </div>
  );
}
