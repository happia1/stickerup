"use client";
import { useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import { DEFAULT_TEACHER_PERMISSIONS, type TeacherPermissionKey } from "@/lib/types";

const PERMISSIONS: Array<[TeacherPermissionKey, string]> = [["notices","공지사항"],["sticker_policy","스티커 정책"],["classes","반 관리"],["students","학생 관리"],["approvals","승인"],["sticker_audit","스티커 로그 감사"],["ranking","랭킹 노출"],["rewards","상품 관리"]];
const CopyIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/></svg>;

export default function AdminOrgPage() {
  const state = useAppState(); const dispatch = useAppDispatch(); const toast = useToast();
  const me = state.teachers.find((t) => t.id === state.currentUserId); const isOwner = me?.role === "owner";
  const [opened, setOpened] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const issue = (inviteeRole: "student" | "teacher") => { const token = `${inviteeRole}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`; dispatch({ type: "ADD_INVITE_LINK", issuerTeacherId: state.currentUserId, token, inviteeRole }); toast(`${inviteeRole === "teacher" ? "선생님" : "학생"} 초대 링크를 발급했어요.`); };
  const copy = async (url: string) => { await navigator.clipboard.writeText(url); toast("초대 링크를 복사했어요."); };

  return <div>
    <h2 className="mb-1 text-title">조직 관리</h2><p className="mb-5 text-caption text-text-secondary">선생님을 초대하고 권한을 관리하거나 학생 초대 링크를 발급하세요.</p>
    <section className="mb-7">
      <div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-subtitle">선생님 목록</h3>{isOwner && <Button variant="secondary" onClick={() => issue("teacher")}>+ 선생님 초대 링크</Button>}</div>
      <div className="overflow-hidden rounded-xl border border-border">
        {!state.teachers.length && <p className="p-5 text-caption text-text-secondary">등록된 선생님이 없습니다.</p>}
        {state.teachers.map((teacher) => <div key={teacher.id} className="border-b border-border last:border-0">
          <div className="flex items-center gap-3 p-3"><button className="min-w-0 flex-1 text-left" onClick={() => setOpened(opened === teacher.id ? null : teacher.id)}><span className="block font-semibold">{teacher.name} <span className="text-text-muted">{opened === teacher.id ? "⌃" : "⌄"}</span></span><span className="block truncate text-caption text-text-secondary">{teacher.email}</span></button><Pill tone={teacher.role === "owner" ? "wait" : "neutral"}>{teacher.role === "owner" ? "원장" : "선생님"}</Pill>{isOwner && teacher.role === "assistant" && <button className="rounded-lg border border-state-danger px-2.5 py-1.5 text-caption text-state-danger" onClick={() => { dispatch({type:"REMOVE_TEACHER",teacherId:teacher.id}); toast("선생님 권한을 해지했어요."); }}>권한 해지</button>}</div>
          {opened === teacher.id && <div className="grid gap-2 border-t border-border bg-surface-card p-3 sm:grid-cols-2 lg:grid-cols-4">{PERMISSIONS.map(([key,label]) => { const checked = teacher.role === "owner" || (teacher.permissions ?? DEFAULT_TEACHER_PERMISSIONS)[key]; return <label key={key} className="flex items-center justify-between gap-3 rounded-lg bg-surface-raised px-3 py-2 text-caption"><span>{label}</span><input type="checkbox" className="h-5 w-9 accent-brand-amber" checked={checked} disabled={!isOwner || teacher.role === "owner"} onChange={(e) => dispatch({type:"SET_TEACHER_PERMISSION",teacherId:teacher.id,permission:key,enabled:e.target.checked})}/></label>; })}</div>}
        </div>)}
      </div>
    </section>
    <section><div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-subtitle">초대 링크</h3><Button variant="secondary" onClick={() => issue("student")}>+ 학생 초대 링크</Button></div>
      <div className="overflow-hidden rounded-xl border border-border">{!state.inviteLinks.length && <p className="p-5 text-caption text-text-secondary">아직 발급된 초대 링크가 없습니다.</p>}{state.inviteLinks.map((link) => { const role = link.invitee_role ?? "student"; const url = `${origin}${role === "teacher" ? "/join/teacher/" : "/join/"}${link.token}`; return <div key={link.id} className="flex flex-wrap items-center gap-3 border-b border-border p-3 last:border-0"><Pill tone={role === "teacher" ? "wait" : "neutral"}>{role === "teacher" ? "선생님" : "학생"}</Pill><span className="min-w-0 flex-1 break-all font-mono text-caption">{url}</span><button aria-label="초대 링크 복사" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-caption" onClick={() => copy(url)}><CopyIcon/> 복사</button><Pill tone={link.status === "active" ? "ok" : "neutral"}>{link.status === "active" ? "활성" : link.status}</Pill></div>; })}</div>
    </section>
  </div>;
}
