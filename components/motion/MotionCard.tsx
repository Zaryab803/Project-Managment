"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover, springTransition } from "@/lib/motion";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MotionCard({
  children,
  className,
  onClick,
}: MotionCardProps) {
  const reduceMotion = useReducedMotion();
  const Component = onClick ? motion.button : motion.div;

  if (reduceMotion) {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={className}>
          {children}
        </button>
      );
    }
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardHover}
      transition={springTransition}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}
