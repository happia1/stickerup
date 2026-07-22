"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { campaignStatus, rankingPeriodLabel } from "@/lib/store/selectors";
import { getRanking } from "@/lib/ranking";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign } from "@/lib/types";

type Filter = "scheduled" | "active" | "ended";
const FILTER_LABEL: Record<Filter, string> = { scheduled: "다가오는 이벤트", active: "진행중", ended: "지난 이벤트" };

function campaignTitle(campaign: RewardCampaign, state: ReturnType<typeof useAppState>) {
  if (campaign.title?.trim()) return campaign.title;
  const cls = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id) : null;
  return cls ? `${cls.name} 랭킹 이벤트` : "전체 랭킹 이벤트";
}

function scopeName(campaign: RewardCampaign, state: ReturnType<typeof useAppState>) {
  if (!campaign.class_id) return "전체";
  return state.classes.find((item) => item.id === campaign.class_id)?.name ?? "알 수 없는 반";
}

function RankingResults({ campaign }: { campaign: RewardCampaign }) {
  const state = useAppState();
  const rows = getRanking({ ledger: state.ledger, enrollments: state.enrollments, studentIds: state.students.map((item) => item.id), classId: campaign.class_id, periodStart: campaign.period_start, periodEnd: campaign.period_end });
  if (!rows.length) return <p className="rounded-lg bg-surface-card p-4 text-center text-caption text-text-muted">집계된 학생 랭킹이 없습니다.</p>;
  return <div className="overflow-hidden rounded-xl border border-border"><table className="w-full text-body"><thead><tr className="border-b border-border text-left text-caption text-text-secondary"><th className="p-2.5">순위</th><th className="p-2.5">학생</th><th className="p-2.5 text-right">스티커</th></tr></thead><tbody>{rows.map((row)=><tr key={row.student_id} className="border-b border-border last:border-0"><td className="p-2.5 font-bold text-brand-amber">{row.rank}등</td><td className="p-2.5">{state.students.find((item)=>item.id===row.student_id)?.name??"-"}</td><td className="p-2.5 text-right">{row.total_count}장</td></tr>)}</tbody></table></div>;
}

function EditForm({ campaign, close }: { campaign: RewardCampaign; close: () => void }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [title,setTitle]=useState(campaign.title??"");
  const [description,setDescription]=useState(campaign.description??"");
  const [start,setStart]=useState(campaign.period_start);
  const [end,setEnd]=useState(campaign.period_end);
  const [distType,setDistType]=useState<"count"|"ratio">(campaign.target_distribution.type);
  const [distValue,setDistValue]=useState(campaign.target_distribution.value);
  return <div className="mt-3 rounded-xl bg-surface-card p-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-caption text-text-secondary sm:col-span-2">이벤트명<input className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={title} onChange={event=>setTitle(event.target.value)}/></label><label className="text-caption text-text-secondary sm:col-span-2">설명<textarea className="mt-1 min-h-20 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={description} onChange={event=>setDescription(event.target.value)}/></label><label className="text-caption text-text-secondary">시작일<input type="date" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={start} onChange={event=>setStart(event.target.value)}/></label><label className="text-caption text-text-secondary">종료일<input type="date" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={end} onChange={event=>setEnd(event.target.value)}/></label><label className="text-caption text-text-secondary">순위 기준<select className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={distType} onChange={event=>setDistType(event.target.value as "count"|"ratio")}><option value="count">상위 인원</option><option value="ratio">상위 비율</option></select></label><label className="text-caption text-text-secondary">{distType==="count"?"인원":"비율(%)"}<input type="number" min="1" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={distType==="count"?distValue:Math.round(distValue*100)} onChange={event=>{const value=Number(event.target.value)||1;setDistValue(distType==="count"?value:value/100);}}/></label></div><div className="mt-4 flex gap-2"><Button onClick={()=>{if(!title.trim()||!start||!end||start>end)return toast("이벤트명과 기간을 확인해 주세요.");dispatch({type:"UPDATE_REWARD_CAMPAIGN",campaignId:campaign.id,title:title.trim(),description:description.trim(),distributionType:distType,distributionValue:distValue,periodStart:start,periodEnd:end});toast("이벤트를 수정했어요.");close();}}>저장</Button><Button variant="secondary" onClick={close}>취소</Button></div></div>;
}

export default function AdminRewardsPage() {
  const state=useAppState();
  const dispatch=useAppDispatch();
  const toast=useToast();
  const regularClass=state.classes.find((item)=>item.is_default);
  const specialClasses=state.classes.filter((item)=>!item.is_default&&item.status==="active");
  const [filter,setFilter]=useState<Filter>("active");
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [createOpen,setCreateOpen]=useState(false);
  const [scopeId,setScopeId]=useState("__default__");
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [start,setStart]=useState("");
  const [end,setEnd]=useState("");
  const [distType,setDistType]=useState<"count"|"ratio">("count");
  const [distValue,setDistValue]=useState(3);
  const campaigns=state.rewardCampaigns.filter((item)=>campaignStatus(item)===filter).sort((a,b)=>b.period_end.localeCompare(a.period_end));

  return <div>
    <div className="mb-5"><h2 className="text-title">이벤트/상품 관리</h2><p className="mt-1 text-caption text-text-secondary">기간별 랭킹 이벤트를 만들고 종료된 이벤트의 순위를 확인해요.</p></div>
    <div className="mb-5 grid max-w-md grid-cols-2 rounded-xl bg-surface-raised p-1"><button className="rounded-lg bg-brand-amber px-4 py-2.5 font-bold text-surface-page">이벤트 리스트</button><Link href="/admin/products" className="rounded-lg px-4 py-2.5 text-center font-bold text-text-secondary">경품 리스트 관리</Link></div>
    <div className="mb-4 flex gap-2 overflow-x-auto">{(Object.keys(FILTER_LABEL) as Filter[]).map(item=><button key={item} onClick={()=>setFilter(item)} className={item===filter?"shrink-0 rounded-full bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page":"shrink-0 rounded-full bg-surface-raised px-3 py-2 text-caption text-text-secondary"}>{FILTER_LABEL[item]}</button>)}</div>
    <div className="space-y-3">{campaigns.map(campaign=>{const expanded=expandedId===campaign.id;const status=campaignStatus(campaign);return <article key={campaign.id} className="rounded-card bg-surface-page p-4"><div className="flex items-start gap-3"><button className="min-w-0 flex-1 text-left" onClick={()=>setExpandedId(expanded?null:campaign.id)}><span className="block truncate text-subtitle">{campaignTitle(campaign,state)}</span><span className="mt-1 block text-caption text-text-secondary">{campaign.period_start} ~ {campaign.period_end} · {scopeName(campaign,state)}</span></button><Pill tone={status==="active"?"ok":status==="ended"?"danger":"wait"}>{FILTER_LABEL[status]}</Pill><button className="rounded-lg border border-border px-2.5 py-1.5 text-caption text-brand-amber" onClick={()=>setEditingId(editingId===campaign.id?null:campaign.id)}>수정</button><button className="rounded-lg px-2 py-1.5 text-caption text-state-danger" onClick={()=>{if(window.confirm("이벤트를 삭제할까요? 삭제한 이벤트는 복구할 수 없습니다.")){dispatch({type:"DELETE_REWARD_CAMPAIGN",campaignId:campaign.id});toast("이벤트를 삭제했어요.");}}}>삭제</button></div>{editingId===campaign.id&&<EditForm campaign={campaign} close={()=>setEditingId(null)}/>} {expanded&&editingId!==campaign.id&&<div className="mt-4 border-t border-border pt-4">{campaign.description&&<p className="mb-3 whitespace-pre-wrap text-caption text-text-secondary">{campaign.description}</p>}{status==="ended"?<RankingResults campaign={campaign}/>:<p className="text-caption text-text-muted">이벤트가 종료되면 최종 학생 순위가 표시됩니다.</p>}</div>}</article>;})}{!campaigns.length&&<p className="rounded-card bg-surface-page p-6 text-center text-caption text-text-muted">해당 이벤트가 없습니다.</p>}</div>
    <div className="mt-4 flex justify-end"><button className="text-caption font-bold text-brand-amber" onClick={()=>setCreateOpen(true)}>＋ 이벤트 생성</button></div>
    {createOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={()=>setCreateOpen(false)}><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface-page p-5" onClick={event=>event.stopPropagation()}><h3 className="mb-4 text-subtitle">이벤트 생성</h3><div className="grid gap-3 sm:grid-cols-2"><label className="text-caption text-text-secondary sm:col-span-2">이벤트명<input className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={name} onChange={event=>setName(event.target.value)}/></label><label className="text-caption text-text-secondary sm:col-span-2">설명<textarea className="mt-1 min-h-20 w-full rounded-lg border border-border px-2.5 py-2" value={description} onChange={event=>setDescription(event.target.value)}/></label><label className="text-caption text-text-secondary">대상 반<select className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={scopeId} onChange={event=>setScopeId(event.target.value)}><option value="__all__">전체</option>{regularClass&&<option value="__default__">정규반</option>}{specialClasses.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-caption text-text-secondary">순위 기준<select className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={distType} onChange={event=>setDistType(event.target.value as "count"|"ratio")}><option value="count">상위 인원</option><option value="ratio">상위 비율</option></select></label><label className="text-caption text-text-secondary">시작일<input type="date" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={start} onChange={event=>setStart(event.target.value)}/></label><label className="text-caption text-text-secondary">종료일<input type="date" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={end} onChange={event=>setEnd(event.target.value)}/></label><label className="text-caption text-text-secondary">{distType==="count"?"인원":"비율(%)"}<input type="number" min="1" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2" value={distType==="count"?distValue:Math.round(distValue*100)} onChange={event=>{const value=Number(event.target.value)||1;setDistValue(distType==="count"?value:value/100);}}/></label></div><div className="mt-5 flex gap-2"><Button onClick={()=>{const classId=scopeId==="__all__"?null:scopeId==="__default__"?regularClass?.id??null:scopeId;let periodStart=start;let periodEnd=end;if(!periodStart||!periodEnd){const period=rankingPeriodLabel(state,classId);periodStart=period.start;periodEnd=period.end;}if(!name.trim()||periodStart>periodEnd)return toast("이벤트명과 기간을 확인해 주세요.");dispatch({type:"ADD_REWARD_CAMPAIGN",title:name.trim(),description:description.trim(),classId,periodStart,periodEnd,distributionType:distType,distributionValue:distValue});setName("");setDescription("");setStart("");setEnd("");setCreateOpen(false);toast("이벤트를 생성했어요.");}}>생성</Button><Button variant="secondary" onClick={()=>setCreateOpen(false)}>취소</Button></div></div></div>}
  </div>;
}
