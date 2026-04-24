"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const facts = [
  "I started editing at the age of 12",
  "I love gaming",
  "Fun fact: HR(s) love me",
];

export function RotatingFacts() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, 3500); // Show each fact for 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--accent-orange))] inline-block"
        >
          {facts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
