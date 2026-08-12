import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface NexusLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-9 w-9",
};

const iconSizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export default function NexusLogo({
  size = "md",
  className,
  iconClassName,
}: NexusLogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/20",
        sizeClasses[size],
        className
      )}
    >
      <Zap
        className={cn("text-white fill-white/20", iconSizeClasses[size], iconClassName)}
        strokeWidth={2.25}
      />
    </div>
  );
}
