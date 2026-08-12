"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownOption =
  | string
  | { value: string; label: string; disabled?: boolean };

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
}

function normalizeOptions(options: DropdownOption[]) {
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option, disabled: false }
      : { disabled: false, ...option }
  );
}

export default function CustomDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "w-full sm:w-48",
  menuClassName,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);

  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-sm text-foreground shadow-sm transition-colors",
          "focus:border-indigo-500 focus:outline-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          !selectedOption && "text-muted-foreground"
        )}
      >
        <span className="truncate whitespace-nowrap">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={cn(
            "absolute left-0 right-0 z-30 mt-2 w-full rounded-2xl border border-border/80 bg-card py-2 shadow-xl animate-in fade-in zoom-in-95 duration-150",
            menuClassName
          )}
        >
          <div className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="my-1 h-px bg-border/40" />
          <div className="max-h-60 overflow-y-auto">
            {normalizedOptions.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (option.disabled) return;
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors",
                    option.disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "truncate",
                      isSelected
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="ml-2 h-4 w-4 shrink-0 text-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
