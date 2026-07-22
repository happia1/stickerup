"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthEntryNotice({ accountType }: { accountType: "student" | "teacher" }) {
  const router=useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    const goToLogin=()=>{if(active)router.replace(`/login?type=${accountType}&reason=session_expired`);};
    void supabase.auth.getSession().then(({ data }) => { if (!data.session) goToLogin(); });
    const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT"||(!session&&event!=="INITIAL_SESSION"))goToLogin();});
    return () => {
      active = false;listener.subscription.unsubscribe();
    };
  }, [accountType, router]);

  return null;
}
