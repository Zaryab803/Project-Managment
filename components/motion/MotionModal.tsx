"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  modalBackdropVariants,
  modalPanelVariants,
  springTransition,
} from "@/lib/motion";

interface MotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export default function MotionModal({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
}: MotionModalProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion && isOpen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs",
          overlayClassName
        )}
      >
        <div className={cn("w-full", className)}>{children}</div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close modal"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalBackdropVariants}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={cn(
              "absolute inset-0 bg-background/80 backdrop-blur-xs",
              overlayClassName
            )}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalPanelVariants}
            transition={springTransition}
            className={cn("relative z-10 w-full", className)}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
