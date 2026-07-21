"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type { AppState, Action } from "./types";
import { appReducer } from "./reducer";
import {
  seedTenant, seedTeachers, seedInviteLinks, seedStudents, seedClasses,
  seedEnrollments, seedLedger, seedHomeworkSubmissions, seedPraiseRequests,
  seedRankingPeriodConfigs, seedRewardCampaigns, seedRewardItems, seedRewardClaims,
  seedNotices,
} from "@/lib/mock/data";
import { DEFAULT_ATTENDANCE_TIERS, DEFAULT_HOMEWORK_TIERS } from "@/lib/types";

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
    notices: seedNotices,
    attendancePolicy: DEFAULT_ATTENDANCE_TIERS.map((t) => ({ ...t })),
    homeworkPolicy: DEFAULT_HOMEWORK_TIERS.map((t) => ({ ...t })),
    homeworkGradingMode: "manual",
  };
}

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<Action> | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);
  const stateValue = useMemo(() => state, [state]);

  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

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
