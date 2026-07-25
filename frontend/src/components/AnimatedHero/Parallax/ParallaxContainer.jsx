import React from "react";
import { motion } from "framer-motion";

/**
 * ParallaxContainer applies smooth 3D tilt and perspective transformation
 * based on mouse movement and scroll depth.
 */
export function ParallaxContainer({ mouse, children, depth = 1 }) {
  const rotateX = (mouse.normalizedY || 0) * -8 * depth;
  const rotateY = (mouse.normalizedX || 0) * 8 * depth;
  const translateX = (mouse.normalizedX || 0) * 15 * depth;
  const translateY = (mouse.normalizedY || 0) * 15 * depth;

  return (
    <motion.div
      className="w-full h-full relative"
      style={{ perspective: 1200 }}
      animate={{
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.5,
      }}
    >
      {children}
    </motion.div>
  );
}
