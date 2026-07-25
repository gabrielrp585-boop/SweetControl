import React from "react";
import { motion } from "framer-motion";

/**
 * LuxuryPastelBackground renders a multi-layered ambient backdrop with floating
 * bokeh spotlights, rich pastel gradients, and dynamic light leaks.
 */
export function LuxuryPastelBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#FDFBF7]">
      {/* Base gradient mesh */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(ellipse 85% 65% at 20% 15%, rgba(253,230,238,0.9), transparent 70%),
            radial-gradient(ellipse 70% 70% at 80% 85%, rgba(243,233,250,0.85), transparent 70%),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(254,244,228,0.75), transparent 60%),
            linear-gradient(135deg, #FDFBF7 0%, #FDF3F5 45%, #F4ECF8 100%)
          `,
        }}
      />

      {/* Floating Animated Bokeh Spotlights */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full mix-blend-multiply filter blur-3xl opacity-60 bg-[#FCE4EC]"
      />

      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-50 bg-[#F3E5F5]"
      />

      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.2, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full mix-blend-multiply filter blur-3xl opacity-55 bg-[#FFF3E0]"
      />

      {/* Subtle Golden Radial Glow in the Center for Hero Emphasis */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] max-w-[1000px] max-h-[1000px] rounded-full bg-radial from-amber-100/40 via-pink-100/20 to-transparent blur-2xl pointer-events-none" />

      {/* Tactile Grain Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
