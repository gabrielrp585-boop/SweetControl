import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CustomConfectioneryCursor renders a bakery-inspired luxury cursor
 * with trailing sugar sparkles and a sprinkle explosion effect on interactive hover.
 */
export function CustomConfectioneryCursor({ mouse }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [bursts, setBursts] = useState([]);
  const burstIdRef = useRef(0);

  // Track hover state over buttons, inputs, links
  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("interactive")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = (e) => {
      setIsMouseDown(true);
      triggerSprinkleBurst(e.clientX, e.clientY);
    };

    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const triggerSprinkleBurst = (x, y) => {
    const id = burstIdRef.current++;
    const particleCount = 14;
    const colors = ["#E4B5C6", "#E6D7FF", "#F5E6BA", "#FFFFFF", "#D4AF37", "#F48FB1"];

    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
      const distance = Math.random() * 50 + 25;
      return {
        id: `${id}-${i}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: colors[i % colors.length],
        scale: Math.random() * 0.8 + 0.5,
        rotation: Math.random() * 360,
      };
    });

    setBursts((prev) => [...prev, { id, x, y, particles: newParticles }]);

    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 800);
  };

  if (!mouse.x) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Primary Glowing Cursor Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-rose-300/80 bg-rose-200/20 backdrop-blur-[2px] shadow-[0_0_15px_rgba(244,143,177,0.4)]"
        style={{
          x: mouse.x - 16,
          y: mouse.y - 16,
        }}
        animate={{
          scale: isHovered ? 2.2 : isMouseDown ? 0.75 : 1,
          borderColor: isHovered ? "rgba(212, 175, 55, 0.9)" : "rgba(244, 143, 177, 0.8)",
          backgroundColor: isHovered ? "rgba(245, 230, 186, 0.25)" : "rgba(228, 181, 198, 0.2)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />

      {/* Center Sugar Sparkle Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-200 via-rose-300 to-white shadow-[0_0_8px_#FFF]"
        style={{
          x: mouse.targetX - 5,
          y: mouse.targetY - 5,
        }}
        animate={{
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      />

      {/* Sprinkle Explosion Bursts on Click/Hover */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ transform: `translate3d(${burst.x}px, ${burst.y}px, 0)` }}
          >
            {burst.particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: p.scale }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: 0.2,
                  rotate: p.rotation,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
