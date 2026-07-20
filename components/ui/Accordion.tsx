"use client";
import { useState } from "react";
import clsx from "@/lib/clsx";

export function Accordion({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-0.5 text-micro font-bold text-text-secondary"
      >
        <span>{label}</span>
        <span className={clsx("text-[11px] transition-transform", open && "rotate-180")}>⌄</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
