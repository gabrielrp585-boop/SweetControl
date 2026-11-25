import React, { useEffect, useRef } from "react";

/**
 * SeamlessVideoBackground renders a single persistent, hardware-accelerated
 * HTML5 video layer across the entire application with the exact same
 * crystal-clear login lighting and contrast veil everywhere.
 */
export function SeamlessVideoBackground({ src = "/modelo.mp4" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.play().catch(() => {});

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none bg-[#120d16]">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          filter: "contrast(1.12) saturate(1.16) brightness(0.98)",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
        className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
      />

      {/* Unified login-style ambient veil so the background video looks equally vivid inside the system */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#100a15]/60 via-[#100a15]/32 to-[#100a15]/22" />
    </div>
  );
}
