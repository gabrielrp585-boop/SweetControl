import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to track mouse position with smooth lerp (linear interpolation)
 * and normalized coordinates (-1 to +1) for 3D parallax and cursor effects.
 */
export function useMousePosition() {
  const frameRef = useRef(null);
  const pendingPositionRef = useRef(null);
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      pendingPositionRef.current = { x: e.clientX, y: e.clientY };
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const position = pendingPositionRef.current;
        if (!position) return;
        setMouse({
          x: position.x,
          y: position.y,
          normalizedX: (position.x / window.innerWidth) * 2 - 1,
          normalizedY: (position.y / window.innerHeight) * 2 - 1,
          targetX: position.x,
          targetY: position.y,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return mouse;
}
