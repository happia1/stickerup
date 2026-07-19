"use client";
import clsx from "@/lib/clsx";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  dark = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45" onClick={onClose}>
      <div
        className={clsx(
          "w-full max-w-app max-h-[85%] overflow-y-auto rounded-t-sheet p-5 pb-6 relative",
          dark ? "bg-dark-surface0 text-dark-textPrimary" : "bg-surface-page text-text-primary"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={clsx(
            "absolute top-3 right-3 w-7 h-7 rounded-full text-caption flex items-center justify-center",
            dark ? "bg-dark-border text-dark-textSecondary" : "bg-surface-page text-text-secondary"
          )}
          aria-label="닫기"
        >
          ✕
        </button>
        {title && <h3 className="text-subtitle pr-6 mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/** 성취/축하 팝업 — 디자인가이드 5.1 (다크 표면, 중앙 정렬) */
export function CelebrationModal({
  open,
  onClose,
  eyebrow,
  headline,
  icon,
  message,
  ctaLabel,
  onCta,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  headline: string;
  icon: React.ReactNode;
  message: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6" onClick={onClose}>
      <div
        className="w-full max-w-[320px] rounded-[20px] bg-dark-surface0 text-dark-textPrimary p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-caption text-dark-textSecondary mb-2">{eyebrow}</p>
        <p className="text-title mb-4">{headline}</p>
        <div className="text-[64px] leading-none mb-4">{icon}</div>
        <p className="text-body text-dark-textSecondary mb-5">{message}</p>
        <button
          type="button"
          onClick={onCta}
          className="w-full rounded-xl bg-brand-amber text-white font-bold py-3"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
