"use client";

import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { Button } from "@/components/ui/Button";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import type { Notice } from "@/lib/types";

function ImageField({ value, onChange, inputId }: { value: string; onChange: (value: string) => void; inputId: string }) {
  const showToast = useToast();
  function selectImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("이미지 파일만 등록할 수 있습니다."); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("이미지는 5MB 이하로 등록해주세요."); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.onerror = () => showToast("이미지를 불러오지 못했습니다.");
    reader.readAsDataURL(file);
  }
  return (
    <div className="mb-3">
      <p className="mb-1 text-caption font-semibold text-text-secondary">이미지 삽입 (선택)</p>
      {value ? <div className="rounded-xl border border-border p-3"><img src={value} alt="공지 이미지 미리보기" className="aspect-square w-full rounded-lg bg-surface-raised object-cover" /><div className="mt-2 flex gap-2"><label htmlFor={inputId} className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-caption">이미지 변경</label><button type="button" onClick={() => onChange("")} className="px-3 py-1.5 text-caption text-state-danger">이미지 삭제</button></div></div> : <label htmlFor={inputId} className="inline-flex cursor-pointer rounded-lg border border-border px-3 py-2 text-caption text-text-secondary">+ 이미지 선택</label>}
      <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ""; }} />
    </div>
  );
}

export default function AdminNoticesPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pinned, setPinned] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPinned, setEditPinned] = useState(false);

  const sorted = [...state.notices].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.created_at.localeCompare(a.created_at));
  const editingNotice = state.notices.find((notice) => notice.id === editingId) ?? null;

  function openNotice(notice: Notice) {
    setEditingId(notice.id); setEditTitle(notice.title); setEditContent(notice.content); setEditImageUrl(notice.image_url ?? ""); setEditPinned(notice.pinned);
  }

  function saveEdit() {
    if (!editingNotice || !editTitle.trim()) { showToast("제목을 입력해주세요."); return; }
    dispatch({ type: "UPDATE_NOTICE", noticeId: editingNotice.id, title: editTitle.trim(), content: editContent || "-", imageUrl: editImageUrl || null, pinned: editPinned });
    setEditingId(null);
    showToast("공지사항을 수정했어요.");
  }

  return (
    <div>
      <h2 className="text-title mb-1">공지사항 게시판</h2>
      <p className="text-caption text-text-secondary mb-5">여기에 등록한 공지는 학생 앱 홈 화면 상단의 플랩 배너에 순환 노출돼요.</p>

      <div className="border border-border rounded-xl overflow-hidden mb-5">
        <table className="w-full text-body">
          <thead><tr className="text-caption text-text-secondary text-left border-b border-border"><th className="p-2.5">제목</th><th className="p-2.5">내용</th><th className="p-2.5">등록일</th><th className="p-2.5">고정</th><th className="p-2.5"></th></tr></thead>
          <tbody>{sorted.map((notice) => <tr key={notice.id} tabIndex={0} role="button" onClick={() => openNotice(notice)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openNotice(notice); }} className="cursor-pointer border-b last:border-0 border-border transition-colors hover:bg-surface-raised focus:bg-surface-raised focus:outline-none">
            <td className="p-2.5 font-semibold">{notice.title}{notice.image_url && <span className="ml-2 text-caption text-brand-amber">이미지</span>}</td>
            <td className="max-w-[280px] whitespace-pre-wrap break-words p-2.5">{notice.content}</td><td className="p-2.5">{fmtDate(notice.created_at)}</td>
            <td className="p-2.5"><label className="flex cursor-pointer items-center gap-1.5" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={notice.pinned} onChange={(event) => dispatch({ type: "SET_NOTICE_PIN", noticeId: notice.id, pinned: event.target.checked })} /><span className="text-caption text-text-secondary">고정</span></label></td>
            <td className="p-2.5"><button className="rounded-lg border border-border px-2 py-1 text-caption text-state-danger" onClick={(event) => { event.stopPropagation(); dispatch({ type: "DELETE_NOTICE", noticeId: notice.id }); showToast("공지사항이 삭제되었어요."); }}>삭제</button></td>
          </tr>)}</tbody>
        </table>
      </div>

      <div className="bg-surface-page rounded-card p-5 max-w-lg">
        <h4 className="text-body font-bold mb-3">새 공지 작성</h4>
        <label className="block text-caption font-semibold text-text-secondary mb-1">제목</label><input className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3" value={title} onChange={(event) => setTitle(event.target.value)} />
        <label className="block text-caption font-semibold text-text-secondary mb-1">내용</label><textarea className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3 min-h-[96px]" value={content} onChange={(event) => setContent(event.target.value)} />
        <ImageField value={imageUrl} onChange={setImageUrl} inputId="new-notice-image" />
        <label className="flex items-center gap-2 text-caption text-text-secondary mb-3.5"><input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} />상단 고정</label>
        <Button onClick={() => { if (!title.trim()) { showToast("제목을 입력해주세요."); return; } dispatch({ type: "ADD_NOTICE", title: title.trim(), content: content || "-", imageUrl: imageUrl || null, pinned, authorId: state.currentUserId }); setTitle(""); setContent(""); setImageUrl(""); setPinned(false); showToast("공지사항이 등록되었어요."); }}>공지 등록하기</Button>
      </div>

      {editingNotice && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5" onClick={() => setEditingId(null)}>
        <section role="dialog" aria-modal="true" aria-labelledby="notice-edit-title" className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card bg-surface-page p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <button type="button" aria-label="닫기" onClick={() => setEditingId(null)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-text-secondary">✕</button>
          <h3 id="notice-edit-title" className="mb-1 pr-10 text-title">공지사항 수정</h3><p className="mb-5 text-caption text-text-muted">{fmtDate(editingNotice.created_at)} 등록</p>
          <label className="mb-1 block text-caption font-semibold text-text-secondary">제목</label><input autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mb-3 w-full rounded-lg border border-border px-3 py-2" />
          <label className="mb-1 block text-caption font-semibold text-text-secondary">내용</label><textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} className="mb-3 min-h-36 w-full rounded-lg border border-border px-3 py-2" />
          <ImageField value={editImageUrl} onChange={setEditImageUrl} inputId="edit-notice-image" />
          <label className="mb-5 flex items-center gap-2 text-caption text-text-secondary"><input type="checkbox" checked={editPinned} onChange={(event) => setEditPinned(event.target.checked)} />상단 고정</label>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-border px-4 py-2">취소</button><button type="button" onClick={saveEdit} className="rounded-xl bg-brand-amber px-5 py-2 font-bold text-surface-page">수정 저장</button></div>
        </section>
      </div>}
    </div>
  );
}
