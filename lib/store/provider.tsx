"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { AppState, Action } from "./types";
import { appReducer } from "./reducer";
import {
  seedTenant, seedTeachers, seedInviteLinks, seedStudents, seedClasses,
  seedEnrollments, seedLedger, seedHomeworkSubmissions, seedPraiseRequests,
  seedRankingPeriodConfigs, seedRewardCampaigns, seedRewardItems, seedRewardClaims,
  seedNotices,
} from "@/lib/mock/data";
import { DEFAULT_ATTENDANCE_TIERS, DEFAULT_HOMEWORK_TIERS } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function buildInitialState(): AppState {
  return {
    currentUserId: "",
    currentUserRole: "student",
    tenant: seedTenant,
    teachers: seedTeachers,
    inviteLinks: seedInviteLinks,
    students: seedStudents,
    classes: seedClasses,
    enrollments: seedEnrollments,
    ledger: seedLedger,
    homeworkSubmissions: seedHomeworkSubmissions,
    praiseRequests: seedPraiseRequests,
    rankingPeriodConfigs: seedRankingPeriodConfigs,
    rewardCampaigns: seedRewardCampaigns,
    rewardItems: seedRewardItems,
    rewardClaims: seedRewardClaims,
    productCatalog: [],
    notices: seedNotices,
    attendancePolicy: DEFAULT_ATTENDANCE_TIERS.map((t) => ({ ...t })),
    homeworkPolicy: DEFAULT_HOMEWORK_TIERS.map((t) => ({ ...t })),
    homeworkGradingMode: "manual",
  };
}

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<Action> | null>(null);
const LoadingContext = createContext(true);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(appReducer, undefined, buildInitialState);
  const [loading, setLoading] = useState(true);
  const lastSyncedUserRef = useRef<string | null>(null);
  const stateValue = useMemo(() => state, [state]);
  const dispatch = useCallback<React.Dispatch<Action>>((action) => {
    rawDispatch(action);
    const persistedActions = new Set(["ADD_CLASS", "UPDATE_CLASS_ATTENDANCE_TIME", "UPDATE_CLASS_SPECIAL_PERIOD", "ADD_NOTICE", "UPDATE_NOTICE", "SET_NOTICE_PIN", "DELETE_NOTICE", "SET_RANKING_UNIT", "ADD_REWARD_CAMPAIGN", "UPDATE_REWARD_CAMPAIGN", "UPDATE_TEACHER_PROFILE"]);
    if (!persistedActions.has(action.type)) return;
    const client = getSupabaseBrowserClient();
    void client?.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const response = await fetch("/api/app-mutations", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (!response.ok) console.error("Unable to persist app action", await response.text());
    });
  }, []);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) { setLoading(false); return; }
    let active = true;

    async function sync(accessToken?: string, userId?: string) {
      if (!accessToken || !userId) { if (active) setLoading(false); return; }
      if (lastSyncedUserRef.current === userId) return;
      lastSyncedUserRef.current = userId;
      const response = await fetch("/api/app-state", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
      if (!response.ok) { lastSyncedUserRef.current = null; if (active) setLoading(false); return; }
      const payload = await response.json() as { state?: Partial<AppState> & Pick<AppState, "currentUserId" | "currentUserRole" | "tenant"> };
      if (active && payload.state) rawDispatch({ type: "HYDRATE_APP_STATE", state: payload.state });
      if (active) setLoading(false);
    }

    void client.auth.getSession().then(({ data }) => sync(data.session?.access_token, data.session?.user.id));
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { lastSyncedUserRef.current = null; if (active) setLoading(false); return; }
      void sync(session?.access_token, session?.user.id);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={dispatch}><LoadingContext.Provider value={loading}>{children}</LoadingContext.Provider></DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppLoading() { return useContext(LoadingContext); }

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStoreProvider");
  return ctx;
}

export function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error("useAppDispatch must be used within AppStoreProvider");
  return ctx;
}
