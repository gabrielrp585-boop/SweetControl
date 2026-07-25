import { useState, useEffect } from "react";

/**
 * Custom hook to track mouse position with smooth lerp (linear interpolation)
 * and normalized coordinates (-1 to +1) for 3D parallax and cursor effects.
 */
export function useMousePosition() {
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    let animationFrameId;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const update = () => {
      // Lerp smoothing (0.1 factor for elegant, fluid motion)
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      const normX = (currentX / window.innerWidth) * 2 - 1;
      const normY = (currentY / window.innerHeight) * 2 - 1;

      setMouse({
        x: currentX,
        y: currentY,
        normalizedX: normX,
        normalizedY: normY,
        targetX,
        targetY,
      });

      animationFrameId = requestAnimationFrame(update);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return mouse;
}
