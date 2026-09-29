"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function BlurReveal({
  children,
  delay = 0,
  y = 16,
  blur = 12,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, filter: `blur(${blur}px)`, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Headlines: each word blurs in with a stagger
export function BlurWords({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.05, delayChildren: delay }}
    >
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          variants={{
            hidden: reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(14px)", y: 14 },
            show: { opacity: 1, filter: "blur(0px)", y: 0 },
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </motion.span>
  );
}
