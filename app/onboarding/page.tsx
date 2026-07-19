"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast/provider";

type Step = "role" | "teacher" | "student";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("role");
  const [academyName, setAcademyName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const router = useRouter();
  const showToast = useToast();

  return (
    <main className="max-w-app mx-auto min-h-screen p-6">
      <p className="text-title mb-1">시작하기</p>
      <p className="text-caption text-text-muted mb-5">
        (데모: 실제 계정 생성 없이 화면 흐름만 확인합니다)
      </p>

      {step === "role" && (
        <div className="flex flex-col gap-3">
          <Card>
            <p className="text-subtitle mb-1">선생님으로 시작하기</p>
            <p className="text-caption text-text-secondary mb-3">
              학원을 개설하고 조교 초대, 학생 초대 링크를 발급합니다.
            </p>
            <Button fullWidth onClick={() => setStep("teacher")}>
              선생님으로 시작하기
            </Button>
          </Card>
          <Card>
            <p className="text-subtitle mb-1">학생으로 시작하기</p>
            <p className="text-caption text-text-secondary mb-3">
              선생님에게 받은 초대 링크로만 가입할 수 있어요.
            </p>
            <Button variant="secondary" fullWidth onClick={() => setStep("student")}>
              초대 링크로 가입 (데모)
            </Button>
          </Card>
        </div>
      )}

      {step === "teacher" && (
        <Card>
          <label className="block text-caption font-semibold text-text-secondary mb-1">학원 이름</label>
          <input
            className="w-full border border-border rounded-lg px-3 py-2 text-body mb-4"
            placeholder="예: 해피 수학학원"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
          />
          <Button
            fullWidth
            onClick={() => {
              showToast(`"${academyName || "새 학원"}" 학원이 개설되었어요.`);
              router.push("/admin/dashboard");
            }}
          >
            학원 개설하고 시작하기
          </Button>
        </Card>
      )}

      {step === "student" && (
        <Card>
          <p className="text-caption text-text-secondary mb-3">
            초대 링크 확인됨: <b>해피 수학학원 · 김원장 선생님</b>
          </p>
          <label className="block text-caption font-semibold text-text-secondary mb-1">이름</label>
          <input
            className="w-full border border-border rounded-lg px-3 py-2 text-body mb-3"
            placeholder="이름을 입력하세요"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <label className="block text-caption font-semibold text-text-secondary mb-1">나이</label>
          <input
            type="number"
            className="w-full border border-border rounded-lg px-3 py-2 text-body mb-4"
            placeholder="나이를 입력하세요"
            value={studentAge}
            onChange={(e) => setStudentAge(e.target.value)}
          />
          <Button
            fullWidth
            onClick={() => {
              showToast(`${studentName || "학생"}님, 기본반에 자동 배정되었어요.`);
              router.push("/student/home");
            }}
          >
            가입 완료하고 시작하기
          </Button>
        </Card>
      )}
    </main>
  );
}
