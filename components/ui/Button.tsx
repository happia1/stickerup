import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "@/lib/clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", fullWidth, className, children, ...rest }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl font-bold transition active:scale-[0.98] disabled:cursor-not-allowed";
  const sizing = "px-4 py-2.5 text-body";
  const variants = {
    primary: "bg-brand-amber text-white disabled:bg-border disabled:text-text-muted",
    secondary: "bg-white border border-border text-text-primary disabled:text-text-muted",
  };
  return (
    <button
      className={clsx(base, sizing, variants[variant], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
