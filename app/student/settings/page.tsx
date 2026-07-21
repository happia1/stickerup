"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

export default function StudentSettingsPage() {
  const showToast = useToast();
  const [notifications, setNotifications] = useState(true);

  return (
    <div>
      <Card>
        <h2 className="text-subtitle mb-2">환경설정</h2>
        <button
          type="button"
          role="switch"
          aria-checked={notifications}
          onClick={() => {
            setNotifications((value) => !value);
            showToast(notifications ? "알림을 껐어요." : "알림을 켰어요.");
          }}
          className="w-full flex items-center justify-between py-2.5"
        >
          <span>
            <span className="block text-body text-left">알림 받기</span>
            <span className="block text-caption text-text-muted text-left">숙제·칭찬 승인, 스티커 롤백 알림</span>
          </span>
          <span className={clsx("w-11 h-6 rounded-full relative transition-colors", notifications ? "bg-brand-amber" : "bg-surface-raised")}>
            <span className={clsx("absolute top-0.5 w-5 h-5 rounded-full bg-surface-page transition-transform", notifications ? "translate-x-[22px]" : "translate-x-0.5")} />
          </span>
        </button>
      </Card>
    </div>
  );
}
