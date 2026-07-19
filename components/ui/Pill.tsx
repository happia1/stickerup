import clsx from "@/lib/clsx";

type PillTone = "wait" | "ok" | "danger" | "neutral";

const TONE_CLASSES: Record<PillTone, string> = {
  wait: "bg-state-warningBg text-state-warningText",
  ok: "bg-state-successBg text-state-success",
  danger: "bg-state-dangerBg text-state-danger",
  neutral: "bg-surface-page text-text-secondary",
};

export function Pill({ tone = "neutral", children }: { tone?: PillTone; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-block rounded-full px-2.5 py-0.5 text-micro font-semibold", TONE_CLASSES[tone])}>
      {children}
    </span>
  );
}
