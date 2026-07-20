"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { Button } from "@/components/ui/Button";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";

export default function AdminNoticesPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);

  const sorted = [...state.notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.created_at.localeCompare(a.created_at)
  );

  return (
    <div>
      <h2 className="text-title mb-1">공지사항 게시판</h2>
      <p className="text-caption text-text-secondary mb-5">
        여기에 등록한 공지는 학생 앱 홈 화면 상단의 플랩 배너에 순환 노출돼요.
      </p>

      <div className="border border-border rounded-xl overflow-hidden mb-5">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">제목</th>
              <th className="p-2.5">내용</th>
              <th className="p-2.5">등록일</th>
              <th className="p-2.5">고정</th>
              <th className="p-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((n) => (
              <tr key={n.id} className="border-b last:border-0 border-border">
                <td className="p-2.5">{n.title}</td>
                <td className="p-2.5 max-w-[280px] truncate">{n.content}</td>
                <td className="p-2.5">{fmtDate(n.created_at)}</td>
                <td className="p-2.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={n.pinned}
                      onChange={(e) => dispatch({ type: "SET_NOTICE_PIN", noticeId: n.id, pinned: e.target.checked })}
                    />
                    <span className="text-caption text-text-secondary">고정</span>
                  </label>
                </td>
                <td className="p-2.5 flex gap-1.5">
                  <button
                    className="border border-border rounded-lg px-2 py-1 text-caption text-state-danger"
                    onClick={() => {
                      dispatch({ type: "DELETE_NOTICE", noticeId: n.id });
                      showToast("공지사항이 삭제되었어요.");
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-page rounded-card p-5 max-w-lg">
        <h4 className="text-body font-bold mb-3">새 공지 작성</h4>
        <label className="block text-caption font-semibold text-text-secondary mb-1">제목</label>
        <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="block text-caption font-semibold text-text-secondary mb-1">내용</label>
        <textarea className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3 min-h-[64px]" value={content} onChange={(e) => setContent(e.target.value)} />
        <label className="flex items-center gap-2 text-caption text-text-secondary mb-3.5">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          상단 고정
        </label>
        <Button
          onClick={() => {
            if (!title.trim()) {
              showToast("제목을 입력해주세요.");
              return;
            }
            dispatch({ type: "ADD_NOTICE", title, content: content || "-", pinned, authorId: state.currentUserId });
            setTitle("");
            setContent("");
            setPinned(false);
            showToast("공지사항이 등록되었어요.");
          }}
        >
          공지 등록하기
        </Button>
      </div>
    </div>
  );
}
