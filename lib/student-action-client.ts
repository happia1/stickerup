import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function submitStudentAction(body: Record<string, unknown>) {
  const client = getSupabaseBrowserClient();
  const { data } = await client!.auth.getSession();
  if (!data.session) throw new Error("학생 로그인이 필요합니다.");
  const response = await fetch("/api/student/actions", {
    method: "POST",
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "요청을 저장하지 못했습니다.");
  return payload;
}
