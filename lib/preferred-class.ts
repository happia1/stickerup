"use client";
import { useEffect, useMemo, useState } from "react";
import type { ClassRoom } from "@/lib/types";

export function preferredClassStorageKey(studentId: string) { return `stickerup:preferred-class:${studentId}`; }
export function setPreferredClass(studentId: string, classId: string) { if (typeof window!=="undefined") window.localStorage.setItem(preferredClassStorageKey(studentId), classId); }

export function usePreferredClass(studentId: string, classes: ClassRoom[]) {
  const suggested = useMemo(() => classes.find((item)=>!item.is_default)?.id ?? classes[0]?.id ?? "", [classes]);
  const [classId,setClassIdState]=useState("");
  useEffect(()=>{const saved=window.localStorage.getItem(preferredClassStorageKey(studentId));const next=classes.some((item)=>item.id===saved)?saved!:suggested;setClassIdState(next);if(next)setPreferredClass(studentId,next);},[studentId,suggested,classes]);
  const setClassId=(next:string)=>{setClassIdState(next);setPreferredClass(studentId,next);};
  return [classId,setClassId] as const;
}
