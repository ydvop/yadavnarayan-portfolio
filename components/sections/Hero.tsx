"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotatingFacts } from "../ui/RotatingFacts";

function IDCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(800px) rotateX(0deg) rotateY(0deg)"
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let rafId: number;
    let usingGyro = false;

    // --- Desktop: mouse tilt ---
    const handleMouseMove = (e: MouseEvent) => {
      if (usingGyro) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        setTransform(
          `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
        );
      });
    };

    const handleMouseLeave = () => {
      if (usingGyro) return;
      setTransform(
        "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
      );
    };

    // --- Mobile: gyroscope tilt ---
    const handleOrientation = (e: DeviceOrientationEvent) => {
      usingGyro = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const beta = e.beta ?? 0;   // front-to-back tilt (-180 to 180)
        const gamma = e.gamma ?? 0; // left-to-right tilt (-90 to 90)

        // Normalize: beta resting ~45-60 when looking at phone, gamma ~0
        const tiltX = Math.max(-12, Math.min(12, (beta - 45) * 0.3));
        const tiltY = Math.max(-12, Math.min(12, gamma * 0.3));

        setTransform(
          `perspective(800px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg) translateZ(6px)`
        );
      });
    };

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice && window.DeviceOrientationEvent) {
      // iOS 13+ requires permission request
      const DevOrientation = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };

      if (typeof DevOrientation.requestPermission === "function") {
        // We listen for the first user tap to request permission
        const requestOnTap = () => {
          DevOrientation.requestPermission!().then((state: string) => {
            if (state === "granted") {
              window.addEventListener(
                "deviceorientation",
                handleOrientation,
                true
              );
            }
          });
          card.removeEventListener("click", requestOnTap);
        };
        card.addEventListener("click", requestOnTap);
      } else {
        // Android / non-iOS: just listen
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    }

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Lanyard strap */}
      <div className="h-20 w-6 rounded-b bg-[#333] lg:h-28" />
      {/* Clip connector */}
      <div className="h-4 w-10 rounded-b-sm bg-[#444]" />
      {/* Card body */}
      <div
        ref={cardRef}
        style={{ transform, transition: "transform 0.15s ease-out" }}
        className="relative w-[260px] overflow-hidden rounded-2xl border-2 border-[#333] bg-[#1a1a1a] shadow-2xl lg:w-[320px]"
      >
        {/* Portfolio tag */}
        <div className="absolute top-3 right-4 z-10 rounded-sm bg-[#222] px-2.5 py-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-primary))]">
            (PORTFOLIO)
          </span>
        </div>

        {/* Portrait */}
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/images/creator-portrait.jpg"
            alt="Portrait"
            fill
            sizes="(max-width:768px) 260px, 320px"
            priority
            className="object-cover"
            crossOrigin="anonymous"
          />
          {/* Role text overlaid at bottom */}
          <div className="absolute bottom-0 left-0 w-full px-4 pb-4">
            <span className="block text-2xl font-black uppercase leading-tight tracking-tight text-[hsl(var(--text-primary))] lg:text-3xl">
              EDITOR &
            </span>
            <span className="block text-2xl font-black uppercase leading-tight tracking-tight text-[hsl(var(--text-primary))] lg:text-3xl">
              MOTION DESIGNER
            </span>
          </div>
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center py-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--text-muted))]">
            {"SKILLS NOT REPLACED BY AI (YET)"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[hsl(var(--bg-primary))] grid-texture">
      {/* Oversized background name */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <h1 className="flex whitespace-nowrap text-[15vw] font-black uppercase leading-none tracking-tighter text-[hsl(var(--text-primary))] opacity-[0.12] lg:text-[12vw]">
          <span>YADAV</span>
          <span className="ml-[3.5vw]">NARAYAN</span>
        </h1>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Center: ID Card */}
        <div className="flex flex-1 items-start justify-center pt-0">
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <IDCard />
          </motion.div>
        </div>

        {/* Left side orange text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[28%] left-8 hidden lg:block"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--accent-orange))]">
            {"(HELLO! I'M YADAV)"}
          </span>
        </motion.div>

        {/* Right side rotating facts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-4 bottom-[15%] lg:right-8 lg:bottom-[22%]"
        >
          <RotatingFacts />
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex items-end justify-between px-8 pb-8 lg:px-12"
        >
          {/* Section number */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))]">
            <span className="text-xs font-medium text-[hsl(var(--text-muted))]">
              01
            </span>
          </div>

          {/* Scroll arrow */}
          <a
            href="#about"
            aria-label="Scroll down"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--border))] transition-colors hover:border-[hsl(var(--text-primary))]"
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-[hsl(var(--text-muted))]"
              >
                <path
                  d="M7 1v12m0 0l5-5m-5 5L2 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </a>

          {/* Currently with */}
          <div className="hidden flex-col items-end gap-0.5 lg:flex">
            <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))]">
              Currently with:
            </span>
            <span className="text-sm font-bold tracking-tight text-[hsl(var(--text-primary))]">
              HAPPENING&nbsp;
              <span className="font-normal text-[hsl(var(--text-secondary))]">
                DESIGN
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
