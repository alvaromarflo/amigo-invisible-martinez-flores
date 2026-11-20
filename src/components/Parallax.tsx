"use client";
import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

const SceneCtx = createContext<MotionValue<number> | null>(null);

export function Scene({
  id, className = "", children, label,
}: { id: string; className?: string; children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <section ref={ref} id={id} aria-label={label} className={`scene ${className}`}>
      <SceneCtx.Provider value={scrollYProgress}>{children}</SceneCtx.Provider>
    </section>
  );
}

export function Layer({
  speed = 0.2, rotate = 0, className = "", style, children,
}: { speed?: number; rotate?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  const progress = useContext(SceneCtx)!;
  const reduced = useReducedMotion();
  const k = reduced ? 0 : 1;
  const y = useTransform(progress, [0, 1], [speed * 220 * k, -speed * 220 * k]);
  const r = useTransform(progress, [0, 1], [-rotate * k, rotate * k]);
  return (
    <motion.div aria-hidden="true" className={`layer ${className}`} style={{ ...style, y, rotate: r }}>
      {children}
    </motion.div>
  );
}

export function Reveal({
  children, delay = 0, className = "", as = "div",
}: { children: ReactNode; delay?: number; className?: string; as?: "div" | "h2" | "p" | "li" }) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
