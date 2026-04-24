"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

function MagneticButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setOffset({ x: x * 0.15, y: y * 0.15 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <button
      ref={btnRef}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.2s ease-out",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Contact() {
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("sending");

    try {
      const formElement = e.currentTarget;
      const formDataToSend = new FormData(formElement);
      
      const response = await fetch("https://formspree.io/f/mqedqpyn", {
        method: "POST",
        body: formDataToSend,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setFormState("success");
        setFormData({ name: "", email: "", message: "" });
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormState("idle");
        }, 5000);
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  };

  return (
    <section
      id="contact"
      className="bg-[hsl(var(--bg-primary))] px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex flex-col gap-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--accent-orange))]">
            Get in Touch
          </span>
          <h2 className="text-4xl font-black tracking-tight text-[hsl(var(--text-primary))] lg:text-5xl text-balance">
            {"Let's create something extraordinary"}
          </h2>
          <p className="text-base text-[hsl(var(--text-muted))]">
            Have a project in mind? Drop me a line and {"let's"} talk.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          suppressHydrationWarning
        >
          {/* Honeypot */}
          <input type="text" name="website" className="hidden" tabIndex={-1} aria-hidden="true" suppressHydrationWarning />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[hsl(var(--text-secondary))]"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] px-4 py-3 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:border-[hsl(var(--accent-orange))] focus:outline-none"
                placeholder="Your name"
                suppressHydrationWarning
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[hsl(var(--text-secondary))]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] px-4 py-3 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:border-[hsl(var(--accent-orange))] focus:outline-none"
                placeholder="you@example.com"
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sm font-medium text-[hsl(var(--text-secondary))]"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] px-4 py-3 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:border-[hsl(var(--accent-orange))] focus:outline-none"
              placeholder="Tell me about your project..."
              suppressHydrationWarning
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <MagneticButton
              type="submit"
              disabled={formState === "sending"}
              className="rounded-full bg-[hsl(var(--accent-orange))] px-10 py-4 text-sm font-semibold text-[hsl(var(--text-primary))] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {formState === "sending" ? "Sending..." : "Send Message"}
            </MagneticButton>

            {/* Status messages */}
            <div aria-live="polite">
              {formState === "success" && (
                <p className="text-sm text-green-400">
                  Message sent successfully. {"I'll"} be in touch soon.
                </p>
              )}
              {formState === "error" && (
                <p className="text-sm text-red-400">
                  Something went wrong. Please try again or email directly.
                </p>
              )}
            </div>
          </div>
        </motion.form>

        {/* Fallback email + Social */}
        <div className="mt-12 hidden flex-col items-center gap-4 border-t border-[hsl(var(--border))] pt-8 lg:flex">
          <p className="text-sm text-[hsl(var(--text-muted))]">
            Or reach me directly at{" "}
            <a
              href="mailto:yadavnarayann@gmail.com"
              className="font-medium text-[hsl(var(--accent-orange))] hover:underline"
            >
              yadavnarayann@gmail.com
            </a>
          </p>
          <div className="flex gap-6">
            <a
              href="https://www.youtube.com/@BhukaMendak"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
              className="text-[hsl(var(--text-muted))] transition-colors hover:text-[hsl(var(--accent-orange))]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/yadavnarayan/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="text-[hsl(var(--text-muted))] transition-colors hover:text-[hsl(var(--accent-orange))]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/bhukamendak"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="text-[hsl(var(--text-muted))] transition-colors hover:text-[hsl(var(--accent-orange))] flex items-center"
            >
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M170.663 256.157c-.083-47.121 38.055-85.4 85.167-85.483 47.121-.092 85.407 38.03 85.499 85.16.091 47.129-38.047 85.4-85.176 85.492-47.112.09-85.399-38.039-85.49-85.169zm-46.108.091c.141 72.602 59.106 131.327 131.69 131.186 72.592-.141 131.35-59.09 131.209-131.692-.141-72.577-59.114-131.335-131.715-131.194-72.585.141-131.325 59.115-131.184 131.7zm237.104-137.091c.033 16.953 13.817 30.681 30.772 30.648 16.961-.033 30.689-13.811 30.664-30.764-.033-16.954-13.818-30.69-30.78-30.657-16.962.033-30.689 13.818-30.656 30.773zm-208.696 345.4c-24.958-1.087-38.511-5.234-47.543-8.709-11.961-4.629-20.496-10.178-29.479-19.094-8.966-8.95-14.532-17.46-19.202-29.397-3.508-9.032-7.73-22.569-8.9-47.527-1.269-26.982-1.559-35.077-1.683-103.432-.133-68.339.116-76.434 1.294-103.441 1.069-24.942 5.242-38.512 8.709-47.536 4.628-11.977 10.161-20.496 19.094-29.479 8.949-8.982 17.459-14.532 29.403-19.202 9.025-3.525 22.561-7.714 47.511-8.9 26.998-1.277 35.085-1.551 103.423-1.684 68.353-.132 76.448.108 103.456 1.295 24.94 1.086 38.51 5.217 47.527 8.709 11.968 4.628 20.503 10.144 29.478 19.094 8.974 8.95 14.54 17.443 19.21 29.412 3.524 9 7.714 22.553 8.892 47.494 1.285 26.999 1.576 35.095 1.7 103.433.132 68.355-.117 76.451-1.302 103.441-1.087 24.958-5.226 38.52-8.709 47.561-4.629 11.952-10.161 20.487-19.103 29.471-8.941 8.949-17.451 14.531-29.403 19.201-9.009 3.517-22.561 7.714-47.494 8.9-26.998 1.269-35.086 1.559-103.448 1.684-68.338.132-76.424-.125-103.431-1.294zM149.977 1.773c-27.239 1.285-45.843 5.648-62.101 12.018C71.047 20.352 56.781 29.145 42.59 43.395 28.381 57.653 19.655 71.944 13.144 88.79c-6.303 16.299-10.575 34.912-11.778 62.168C.172 178.264-.102 186.973.031 256.489c.133 69.508.439 78.234 1.741 105.547 1.302 27.231 5.649 45.828 12.019 62.09C31.161 442.047 39.887 456.338 56.733 462.849c16.299 6.303 34.912 10.575 62.168 11.778 27.323 1.269 36.032 1.542 105.548 1.409 69.508-.133 78.234-.439 105.547-1.741 27.231-1.302 45.828-5.649 62.09-12.019 16.858-6.37 31.149-15.096 37.66-31.942 6.303-16.299 10.575-34.912 11.778-62.168 1.269-27.323 1.542-36.032 1.409-105.548-.133-69.508-.439-78.234-1.741-105.547-1.302-27.231-5.649-45.828-12.019-62.09-6.37-16.858-15.096-31.149-31.942-37.66-16.299-6.303-34.912-10.575-62.168-11.778C287.768 2.296 279.059 1.93 209.533 2.063 139.951 2.196 131.298 2.563 149.977 1.773Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
