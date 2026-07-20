"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";

export default function AdminOrgPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = state.teachers.find((t) => t.id === state.currentUserId);
  const isOwner = me?.role === "owner";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      <h2 className="text-title mb-1">조직 관리</h2>
      <p className="text-caption text-text-secondary mb-5">
        조교를 추가해 운영을 위임하거나, 학생 초대 링크를 발급/관리해요.
      </p>

      <p className="text-subtitle mb-2">선생님 목록</p>
      <div className="border border-border rounded-xl overflow-hidden mb-6">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">이름</th>
              <th className="p-2.5">이메일</th>
              <th className="p-2.5">역할</th>
              <th className="p-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {state.teachers.map((t) => (
              <tr key={t.id} className="border-b last:border-0 border-border">
                <td className="p-2.5 font-semibold">{t.name}</td>
                <td className="p-2.5">{t.email}</td>
                <td className="p-2.5">
                  <Pill tone={t.role === "owner" ? "wait" : "neutral"}>{t.role === "owner" ? "원장" : "조교"}</Pill>
                </td>
                <td className="p-2.5">
                  {isOwner && t.role === "assistant" && (
                    <button
                      className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                      onClick={() => {
                        dispatch({ type: "REMOVE_TEACHER", teacherId: t.id });
                        showToast("조교를 제거했어요.");
                      }}
                    >
                      제거
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOwner && (
        <div className="bg-surface-page rounded-card p-5 max-w-lg mb-6">
          <h4 className="text-body font-bold mb-3">조교 추가</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">이름</label>
              <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">이메일</label>
              <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={() => {
              if (!name.trim() || !email.trim()) {
                showToast("이름과 이메일을 입력해주세요.");
                return;
              }
              dispatch({ type: "ADD_TEACHER", name, email, invitedBy: state.currentUserId });
              showToast(`${name}님을 조교로 추가했어요.`);
              setName("");
              setEmail("");
            }}
          >
            조교 추가하기
          </Button>
        </div>
      )}

      <p className="text-subtitle mb-2">학생 초대 링크</p>
      <div className="border border-border rounded-xl overflow-hidden mb-4">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">토큰</th>
              <th className="p-2.5">발급자</th>
              <th className="p-2.5">상태</th>
            </tr>
          </thead>
          <tbody>
            {state.inviteLinks.map((link) => {
              const issuer = state.teachers.find((t) => t.id === link.issuer_teacher_id);
              return (
                <tr key={link.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5 font-mono text-caption">/invite/{link.token}</td>
                  <td className="p-2.5">{issuer?.name}</td>
                  <td className="p-2.5">
                    <Pill tone={link.status === "active" ? "ok" : "neutral"}>{link.status === "active" ? "활성" : link.status}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button
        variant="secondary"
        onClick={() => {
          const token = `invite-${Math.random().toString(36).slice(2, 8)}`;
          dispatch({ type: "ADD_INVITE_LINK", issuerTeacherId: state.currentUserId, token });
          showToast("새 초대 링크가 발급되었어요.");
        }}
      >
        + 새 초대 링크 발급
      </Button>
    </div>
  );
}
