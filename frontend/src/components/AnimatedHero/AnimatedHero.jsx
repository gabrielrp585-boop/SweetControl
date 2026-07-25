import React from "react";
import { motion } from "framer-motion";
import { Cake, Sparkles, Heart } from "lucide-react";
import { LenisProvider } from "./ScrollController/LenisProvider";
import { useMousePosition } from "./MouseInteraction/useMousePosition";
import { LuxuryPastelBackground } from "./Background/LuxuryPastelBackground";
import { ConfectioneryParticles } from "./Particles/ConfectioneryParticles";
import { CustomConfectioneryCursor } from "./CursorEffects/CustomConfectioneryCursor";
import { ParallaxContainer } from "./Parallax/ParallaxContainer";
import { FramePlayer } from "./FramePlayer/FramePlayer";
import { LuxuryLoginCard } from "./LoginCard/LuxuryLoginCard";

/**
 * AnimatedHero orchestrates a 100vw x 100vh full-screen background video loop at 30 FPS,
 * with unblocked page scrolling, mouse-driven dynamic lighting & parallax, floating particles,
 * and a glassmorphic login form overlay.
 */
export function AnimatedHero() {
  const mouse = useMousePosition();

  return (
    <LenisProvider>
      <div className="relative w-full min-h-screen text-stone-900 selection:bg-rose-200 selection:text-rose-900 font-sans cursor-none overflow-x-hidden">
        {/* Custom Bakery Cursor */}
        <CustomConfectioneryCursor mouse={mouse} />

        {/* Ambient Pastel Backdrop */}
        <LuxuryPastelBackground />

        {/* Full-Screen 100vw x 100vh Cake Frame Video Loop (30 FPS Automatic) */}
        <FramePlayer />

        {/* Mouse-Driven Dynamic Spotlight Lighting over the Cake */}
        {mouse.x ? (
          <div
            className="fixed pointer-events-none z-10 w-[600px] h-[600px] rounded-full mix-blend-soft-light transition-transform duration-300 ease-out"
            style={{
              left: mouse.x - 300,
              top: mouse.y - 300,
              background: `radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(253,230,238,0.2) 45%, transparent 70%)`,
            }}
          />
        ) : null}

        {/* Interactive Floating Confectionery Particles */}
        <ConfectioneryParticles mouse={mouse} />

        {/* Foreground Page Layout (Scroll is 100% Free & Unblocked) */}
        <div className="relative z-20 w-full min-h-screen flex flex-col justify-between p-6 sm:p-10 pointer-events-none">

          {/* Top Brand Navigation Header */}
          <header className="w-full flex items-center justify-between pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3 group"
            >
              <div className="h-11 w-11 rounded-2xl bg-white/85 backdrop-blur-md flex items-center justify-center shadow-lg shadow-rose-200/40 border border-white/90 group-hover:scale-105 transition-transform">
                <Cake className="h-6 w-6 text-rose-500" />
              </div>
              <span className="heading-serif text-3xl font-bold tracking-tight text-stone-900 drop-shadow-sm">
                SweetControl
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/75 backdrop-blur border border-white/90 shadow-md text-stone-800 text-xs uppercase tracking-widest font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Gestão de Confeitaria
            </motion.div>
          </header>

          {/* Main Grid: Clean Title Typography (Left) & Floating Glassmorphic Login Form (Right) */}
          <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-none my-auto py-8">

            {/* Left Headline Column */}
            <div className="lg:col-span-6 flex flex-col items-start space-y-4 text-left pointer-events-auto">
              <ParallaxContainer mouse={mouse} depth={0.4}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  className="heading-serif text-4xl sm:text-6xl xl:text-7xl font-bold text-stone-900 leading-[1.08] drop-shadow-sm"
                >
                  Cada bolo, <br />
                  <span className="italic font-normal text-rose-600 underline decoration-rose-300 decoration-wavy underline-offset-8">
                    no controle certo.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.3 }}
                  className="text-stone-700 max-w-md text-base sm:text-lg font-normal leading-relaxed mt-4 bg-white/45 backdrop-blur-md p-5 rounded-2xl border border-white/70 shadow-sm"
                >
                  Gerencie encomendas, custos, estoque e receitas da sua confeitaria com a delicadeza que o seu negócio merece.
                </motion.p>
              </ParallaxContainer>
            </div>

            {/* Right Column: Floating Luxury Login Card */}
            <div className="lg:col-span-6 flex items-center justify-center lg:justify-end w-full pointer-events-auto">
              <ParallaxContainer mouse={mouse} depth={0.6}>
                <LuxuryLoginCard />
              </ParallaxContainer>
            </div>

          </main>

          {/* Footer Bar */}
          <footer className="w-full flex items-center justify-between text-xs text-stone-600 pointer-events-auto font-medium py-2">
            <span className="bg-white/65 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-sm">
              &copy; {new Date().getFullYear()} SweetControl · Todos os direitos reservados
            </span>
            <span className="hidden sm:flex items-center gap-1.5 bg-white/65 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-sm">
              Feito com carinho <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </footer>

        </div>

      </div>
    </LenisProvider>
  );
}
