"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  DEFAULT_FOOTER_SETTINGS,
  normalizedFooterSettings,
  type FooterSettings,
} from "@/lib/footer-settings";
import { useToast } from "@/lib/toast/provider";

export function AppFooter({ initialName = "" }: { initialName?: string }) {
  const showToast = useToast();
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/site-footer", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (active) setFooter(normalizedFooterSettings(payload.settings));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (initialName && !name) setName(initialName);
  }, [initialName, name]);

  async function submitInquiry() {
    if (!name.trim() || !contact.trim() || !content.trim()) {
      return showToast("성함, 연락처, 문의 내용을 모두 입력해 주세요.");
    }
    setSubmitting(true);
    try {
      const client = getSupabaseBrowserClient();
      const { data } = await client!.auth.getSession();
      if (!data.session) throw new Error("로그인 후 문의해 주세요.");
      const response = await fetch("/api/support-inquiries", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, contact, content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "문의를 접수하지 못했습니다.");
      setContact("");
      setContent("");
      setInquiryOpen(false);
      showToast("문의가 접수되었습니다.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "문의를 접수하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <footer className="mt-8 border-t border-border px-1 pb-8 pt-7">
        <div className="relative aspect-[1731/909] w-44">
          <Image src="/brand/bar.png" alt="StickerUp" fill sizes="176px" className="object-contain" />
        </div>
        <p className="mt-1 text-caption text-text-secondary">{footer.tagline}</p>
        <p className="mt-1 text-caption text-text-muted">by. {footer.creator_name}</p>
        <button
          type="button"
          onClick={() => setInquiryOpen(true)}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-body font-bold text-text-primary transition-colors hover:border-text-secondary"
        >
          <span aria-hidden="true" className="text-lg leading-none">✉</span>
          문의하기
        </button>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-micro">
          <Link href={footer.terms_url} className="text-text-secondary underline-offset-4 hover:underline">{footer.terms_label}</Link>
          <Link href={footer.privacy_url} className="font-bold text-text-primary underline-offset-4 hover:underline">{footer.privacy_label}</Link>
        </div>
        <p className="mt-3 text-micro text-text-muted">{footer.copyright_text}</p>
      </footer>

      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={() => setInquiryOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="support-inquiry-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-surface-card p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="support-inquiry-title" className="text-title">문의하기</h2>
                <p className="mt-2 text-caption leading-6 text-text-secondary">문의 남겨주시면 빠른 시일 내로 답변드리도록 하겠습니다. 답변받으실 연락처와 성함, 문의 내용을 남겨 주세요.</p>
              </div>
              <button type="button" aria-label="문의창 닫기" className="p-2 text-text-muted" onClick={() => setInquiryOpen(false)}>✕</button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-caption text-text-secondary">성함<input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} className="mt-1 w-full rounded-xl border border-border px-3 py-3" placeholder="성함을 입력해 주세요"/></label>
              <label className="block text-caption text-text-secondary">답변받으실 연락처<input value={contact} onChange={(event) => setContact(event.target.value)} maxLength={100} className="mt-1 w-full rounded-xl border border-border px-3 py-3" placeholder="휴대전화 번호 또는 이메일"/></label>
              <label className="block text-caption text-text-secondary">문의 내용<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} className="mt-1 min-h-36 w-full rounded-xl border border-border px-3 py-3" placeholder="문의하실 내용을 자세히 입력해 주세요"/><span className="mt-1 block text-right text-micro text-text-muted">{content.length}/2000</span></label>
            </div>
            <div className="mt-5 flex gap-2">
              <Button fullWidth disabled={submitting} onClick={() => void submitInquiry()}>{submitting ? "접수 중..." : "문의 접수"}</Button>
              <Button variant="secondary" className="!px-5" onClick={() => setInquiryOpen(false)}>취소</Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
