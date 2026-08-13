"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeTransition } from "@/lib/motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  const reduceMotion = useReducedMotion();

  const content = (
    <>
      <div className="min-w-0">
        <h1
          className="truncate text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "sticky top-0 z-30 -mx-8 -mt-8 mb-6 flex items-center justify-between gap-4 border-b border-border/40 px-8 pt-8 pb-4",
        "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      {reduceMotion ? (
        content
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={easeTransition}
          className="flex w-full items-center justify-between gap-4"
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}
