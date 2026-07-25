import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cake } from "lucide-react";

const TOTAL_FRAMES = 240;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33.33ms per frame

const getFrameUrl = (index) => {
  return `/frame/frame (${index + 1}).jpg`;
};

/**
 * FramePlayer renders an automatic, continuous 30 FPS background video loop
 * of the 240 cake frames on a full-screen (100vw x 100vh) HTML5 Canvas.
 */
export function FramePlayer() {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const imagesRef = useRef([]);
  const frameIndexRef = useRef(0);
  const directionRef = useRef(1); // 1 = forward, -1 = reverse (smooth ping-pong loop)
  const lastFrameTimeRef = useRef(0);
  const rafIdRef = useRef(null);

  // 1. Preload 240 frames into memory
  useEffect(() => {
    let isCancelled = false;
    const loadedImages = new Array(TOTAL_FRAMES);
    let count = 0;

    const preloadNext = (index) => {
      if (isCancelled || index >= TOTAL_FRAMES) return;

      const img = new Image();
      img.src = getFrameUrl(index);
      img.onload = () => {
        if (isCancelled) return;
        loadedImages[index] = img;
        count++;
        if (count === TOTAL_FRAMES) {
          imagesRef.current = loadedImages;
          setIsReady(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loadedImages[index] = loadedImages[index - 1] || null;
        count++;
        if (count === TOTAL_FRAMES) {
          imagesRef.current = loadedImages;
          setIsReady(true);
        }
      };
    };

    const BATCH_SIZE = 16;
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      setTimeout(() => preloadNext(i), Math.floor(i / BATCH_SIZE) * 15);
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Render current frame onto full-screen canvas (object-fit: cover)
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameIndex)));
    const img = imagesRef.current[idx];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Object-fit: cover math to fill 100vw x 100vh completely without any gaps
    const imgRatio = img.width / img.height;
    const screenRatio = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (screenRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      drawHeight = height;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  };

  // 3. Automatic 30 FPS Loop with smooth ping-pong direction reversal
  useEffect(() => {
    if (!isReady) return;

    const loop = (timestamp) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);

        // Advance or reverse frame index smoothly
        frameIndexRef.current += directionRef.current;

        if (frameIndexRef.current >= TOTAL_FRAMES - 1) {
          frameIndexRef.current = TOTAL_FRAMES - 1;
          directionRef.current = -1; // Reverse direction
        } else if (frameIndexRef.current <= 0) {
          frameIndexRef.current = 0;
          directionRef.current = 1; // Forward direction
        }

        drawFrame(frameIndexRef.current);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    drawFrame(0);
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isReady]);

  // Redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isReady) {
        drawFrame(frameIndexRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isReady]);

  return (
    <>
      {/* Clean Minimalist Loading Overlay without technical text or percentages */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-rose-200/50 border border-rose-100 flex items-center justify-center"
              >
                <Cake className="w-7 h-7 text-rose-500" />
              </motion.div>
              <span className="heading-serif text-2xl font-bold text-stone-900 tracking-tight">
                SweetControl
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Canvas Background (100vw x 100vh) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isReady ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block filter brightness-[1.02] contrast-[1.02]"
        />
        {/* Soft Vignette & Atmospheric Light Diffusion */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7]/60 via-transparent to-[#FDFBF7]/40 pointer-events-none mix-blend-soft-light" />
      </motion.div>
    </>
  );
}
