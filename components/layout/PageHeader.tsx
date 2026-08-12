import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "sticky top-0 z-30 -mx-8 -mt-8 px-8 pt-8 pb-4 mb-6",
        "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "border-b border-border/40 flex items-center justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        <h1
          className="text-2xl font-bold tracking-tight text-foreground truncate"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}
