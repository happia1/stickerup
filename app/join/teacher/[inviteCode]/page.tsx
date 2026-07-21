"use client";
import { useEffect } from "react";

export default function JoinTeacherInvitePage({ params }: { params: { inviteCode: string } }) {
  useEffect(() => { window.location.replace(`/signup?type=teacher&invite=${encodeURIComponent(params.inviteCode)}`); }, [params.inviteCode]);
  return <main className="flex min-h-screen items-center justify-center p-5"><p className="text-caption text-text-secondary">초대 정보를 확인하고 있습니다.</p></main>;
}
