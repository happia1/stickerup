"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState="checking"|"teacher"|"anonymous";

function StudentConnectionContent(){
 const searchParams=useSearchParams();const token=searchParams.get("token")?.trim()??"";const [name,setName]=useState("");const [studentId,setStudentId]=useState("");const [requestActive,setRequestActive]=useState(false);const [message,setMessage]=useState("");const [loading,setLoading]=useState(Boolean(token));const [authState,setAuthState]=useState<AuthState>("checking");
 useEffect(()=>{let active=true;async function checkAuth(){const client=getSupabaseBrowserClient();const {data}=await client!.auth.getSession();if(!data.session){if(active)setAuthState("anonymous");return;}const response=await fetch("/api/auth/profile",{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:"no-store"});const profile=await response.json();if(!active)return;if(response.ok&&(profile.role==="owner"||profile.role==="assistant")){setAuthState("teacher");}else{await client!.auth.signOut({scope:"local"});if(active)setAuthState("anonymous");}}void checkAuth();return()=>{active=false;};},[]);
 useEffect(()=>{if(!token){setMessage("연결 링크 정보가 없습니다.");setLoading(false);return;}fetch(`/api/student-connections/${encodeURIComponent(token)}`).then(async response=>{const payload=await response.json();if(!response.ok)throw new Error(payload.error);setName(payload.request.students?.name??"학생");setStudentId(payload.request.student_id??"");const pending=payload.request.status==="pending"&&new Date(payload.request.expires_at)>new Date();setRequestActive(pending);if(!pending)setMessage("만료되었거나 이미 처리된 링크입니다.");}).catch(error=>setMessage(error instanceof Error?error.message:"연결 요청을 확인하지 못했습니다.")).finally(()=>setLoading(false));},[token]);
 const destination=`/admin/students${studentId?`?student=${encodeURIComponent(studentId)}`:""}`;const loginHref=`/login?type=teacher&next=${encodeURIComponent(destination)}`;
 return <main className="mx-auto flex min-h-screen max-w-md items-center p-5"><div className="w-full rounded-card bg-surface-card p-6 text-center"><h1 className="text-title">학생 연결 요청</h1><p className="my-4 text-text-secondary">{loading?"요청을 확인하고 있어요.":name?`${name} 학생이 선생님 연결을 요청했습니다.`:message}</p>{!loading&&requestActive&&authState==="teacher"&&<Link href={destination} className="block w-full rounded-xl bg-brand-amber py-3 font-bold text-surface-page">학생 승인 화면으로 이동</Link>}{!loading&&requestActive&&authState==="anonymous"&&<Link href={loginHref} className="block w-full rounded-xl bg-brand-amber py-3 font-bold text-surface-page">선생님 로그인</Link>}{authState==="checking"&&!loading&&requestActive&&<p className="text-caption text-text-secondary">로그인 상태를 확인하고 있어요.</p>}{message&&name&&<p className="mt-4 text-caption text-text-secondary">{message}</p>}</div></main>;
}

export default function StudentConnectionPage(){return <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-5"><p className="text-caption text-text-secondary">요청을 확인하고 있어요.</p></main>}><StudentConnectionContent/></Suspense>;}
