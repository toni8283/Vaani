"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function HowItWorksConnector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  return (
    <div ref={containerRef} className="hidden md:block absolute top-[180px] inset-x-12 h-16 pointer-events-none z-10">
      <svg
        viewBox="0 0 1000 60"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <motion.path
          d="M 160 30 Q 330 -10 500 30 T 840 30"
          stroke="#C4622D"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeLinecap="round"
          style={{ pathLength }}
          className="opacity-60"
        />
      </svg>
    </div>
  );
}
