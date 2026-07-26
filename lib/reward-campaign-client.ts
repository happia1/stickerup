"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Action } from "@/lib/store/types";

export async function saveRewardCampaign(action: Extract<Action, { type: "UPDATE_REWARD_CAMPAIGN" }>) {
  const client = getSupabaseBrowserClient();
  const session = (await client?.auth.getSession())?.data.session;
  if (!session) throw new Error("로그인 상태를 확인한 뒤 다시 시도해 주세요.");

  const response = await fetch("/api/app-mutations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(payload?.error ?? "이벤트 수정사항을 저장하지 못했습니다.");
}
