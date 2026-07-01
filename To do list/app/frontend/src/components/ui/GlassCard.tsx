import { HTMLAttributes } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "pink" | "peach" | "lemon" | "mint" | "sky" | "lavender" | "lilac";
}

const ACCENT_RING: Record<NonNullable<GlassCardProps["accent"]>, string> = {
  pink: "before:bg-pastel-pink",
  peach: "before:bg-pastel-peach",
  lemon: "before:bg-pastel-lemon",
  mint: "before:bg-pastel-mint",
  sky: "before:bg-pastel-sky",
  lavender: "before:bg-pastel-lavender",
  lilac: "before:bg-pastel-lilac",
};

/** Base "liquid glass" surface used across the dashboard, forms, and modals. */
export function GlassCard({ accent, className, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={clsx(
        "glass-card relative overflow-hidden",
        accent &&
          "before:absolute before:-top-6 before:-right-6 before:h-16 before:w-16 before:rounded-full before:blur-2xl before:opacity-70",
        accent && ACCENT_RING[accent],
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
