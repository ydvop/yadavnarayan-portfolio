"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Projects", href: "#work" },
];

const resumeHref = "/Yadav%20Narayan%20Resume.pdf";
const resumeDownloadName = "Yadav Narayan Resume.pdf";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Detect background color at viewport top
      const element = document.elementFromPoint(window.innerWidth / 2, 100);
      if (element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        // Parse RGB to detect if it's light or dark
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const [r, g, b] = rgbMatch.map(Number);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          setIsDarkBg(luminance < 0.5);
        }
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial check
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(var(--bg-primary))/0.9] backdrop-blur-md border-b border-[hsl(var(--border))]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5 lg:px-12">
        <a
          href="#"
          className={`text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
            isDarkBg
              ? "text-[hsl(var(--text-primary))]"
              : "text-gray-800"
          }`}
        >
          YADAV NARAYAN
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-normal transition-colors ${
                isDarkBg
                  ? "text-white hover:text-[hsl(var(--accent-orange))]"
                  : "text-gray-700 hover:text-[hsl(var(--accent-orange))]"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href={resumeHref}
            download={resumeDownloadName}
            className={`text-sm font-normal transition-colors ${
              isDarkBg
                ? "text-white hover:text-[hsl(var(--accent-orange))]"
                : "text-gray-700 hover:text-[hsl(var(--accent-orange))]"
            }`}
          >
            Resume
          </a>
          <a
            href="#contact"
            className="rounded-full bg-[hsl(var(--accent-orange))] px-6 py-2.5 text-sm font-semibold text-[hsl(var(--text-primary))] transition-transform hover:scale-105"
          >
            CONTACT
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-[hsl(var(--text-primary))] transition-all duration-300 ${
              mobileOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-[hsl(var(--text-primary))] transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-[hsl(var(--text-primary))] transition-all duration-300 ${
              mobileOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(0_0%_7%/0.95)] backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--text-primary))]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={resumeHref}
                download={resumeDownloadName}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium text-[hsl(var(--text-primary))] transition-colors hover:text-[hsl(var(--accent-orange))]"
              >
                Resume
              </a>
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full bg-[hsl(var(--accent-orange))] px-5 py-3 text-center text-sm font-semibold text-[hsl(var(--text-primary))] transition-transform hover:scale-105"
              >
                CONTACT
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
