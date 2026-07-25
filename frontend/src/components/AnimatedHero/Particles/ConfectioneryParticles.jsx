import React, { useEffect, useRef } from "react";

/**
 * ConfectioneryParticles renders ambient floating sweets particles
 * (sugar crystals, flour dust, cocoa specks, golden micro-stars) on an HTML5 Canvas,
 * gently reacting to mouse movements.
 */
export function ConfectioneryParticles({ mouse }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle Types & Configurations
    const PARTICLE_COUNT = 65;
    const particles = [];

    const colors = {
      sugar: ["rgba(255, 255, 255, 0.8)", "rgba(255, 240, 245, 0.85)"],
      flour: ["rgba(253, 251, 247, 0.5)", "rgba(245, 235, 240, 0.45)"],
      gold: ["rgba(212, 175, 55, 0.75)", "rgba(245, 222, 179, 0.8)"],
      rose: ["rgba(228, 181, 198, 0.7)", "rgba(244, 143, 177, 0.6)"],
      cocoa: ["rgba(93, 64, 55, 0.4)", "rgba(121, 85, 72, 0.35)"],
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const type =
        i % 5 === 0
          ? "gold"
          : i % 4 === 0
          ? "rose"
          : i % 3 === 0
          ? "cocoa"
          : i % 2 === 0
          ? "flour"
          : "sugar";

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1.2,
        baseRadius: Math.random() * 3 + 1.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2, // Slow upwards float
        type,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.6 + 0.4,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.pulse += 0.03;

        // Wrap around boundaries
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Mouse interaction (gentle repulsion)
        if (mouse && mouse.x) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Draw particle based on type
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity + Math.sin(p.pulse) * 0.2;

        if (p.type === "gold" || p.type === "sugar") {
          // Draw 4-point sparkle star or sugar diamond
          const r = p.radius * (1 + Math.sin(p.pulse) * 0.25);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.8);
          ctx.quadraticCurveTo(0, 0, r * 1.8, 0);
          ctx.quadraticCurveTo(0, 0, 0, r * 1.8);
          ctx.quadraticCurveTo(0, 0, -r * 1.8, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r * 1.8);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === "rose") {
          // Draw soft heart or circle
          const r = p.radius;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw soft flour / cocoa dust circle
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouse]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
}
