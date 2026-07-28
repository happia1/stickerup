import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | StickerUp",
};

const sections = [
  {
    title: "1. 수집하는 개인정보",
    body: "계정 식별 정보(아이디 또는 이메일), 이름, 생년월일, 프로필 사진, 소속 학원과 반 정보, 출석·과제·칭찬 신청 및 스티커 지급 기록, 서비스 이용 기록을 수집할 수 있습니다.",
  },
  {
    title: "2. 이용 목적",
    body: "회원 식별과 로그인 유지, 학원·선생님 연결, 출석·과제·칭찬 승인, 스티커와 랭킹 계산, 공지 및 이벤트 제공, 문의 대응과 서비스 안정성 개선을 위해 개인정보를 이용합니다.",
  },
  {
    title: "3. 보유 및 이용 기간",
    body: "개인정보는 회원 탈퇴 또는 처리 목적 달성 시 지체 없이 삭제합니다. 다만 관련 법령에 따라 보관할 의무가 있거나 분쟁 대응에 필요한 경우에는 해당 기간 동안 안전하게 보관합니다.",
  },
  {
    title: "4. 개인정보의 공유",
    body: "학생의 이름, 소속 반, 출석·과제·칭찬 신청 및 스티커 정보는 서비스 운영을 위해 연결된 학원의 관리자와 권한을 받은 선생님에게 제공될 수 있습니다. 법령에 근거가 있거나 이용자가 동의한 경우를 제외하고 개인정보를 목적 외로 제공하지 않습니다.",
  },
  {
    title: "5. 처리 위탁 및 저장",
    body: "회원 인증, 데이터 저장, 이미지 저장과 서비스 제공을 위해 클라우드 및 호스팅 서비스를 이용할 수 있습니다. 처리업체가 개인정보를 안전하게 다루도록 필요한 조치를 합니다.",
  },
  {
    title: "6. 이용자의 권리",
    body: "이용자는 자신의 개인정보를 조회·수정할 수 있고, 설정 화면의 프로필 삭제를 통해 삭제를 요청할 수 있습니다. 미성년 이용자의 경우 법정대리인이 관련 법령에 따른 권리를 행사할 수 있습니다.",
  },
  {
    title: "7. 안전성 확보 조치",
    body: "접근 권한 관리, 인증 정보 보호, 전송 구간 보호 등 개인정보의 분실·도난·유출·변조를 방지하기 위한 조치를 적용합니다.",
  },
  {
    title: "8. 개인정보 문의",
    body: "개인정보와 관련한 문의 또는 권리 행사는 학생 앱 마이페이지 하단의 문의하기를 이용해 주세요. 개인정보 처리 책임자: Jeongwon Kim",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-app bg-surface-page px-5 py-8 text-text-primary">
      <Link href="/student/mypage" className="text-caption text-text-secondary">
        ← 마이페이지
      </Link>
      <h1 className="mt-5 text-title">개인정보 처리방침</h1>
      <p className="mt-2 text-caption text-text-muted">시행일: 2026년 7월 28일</p>
      <div className="mt-7 space-y-7">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-subtitle">{section.title}</h2>
            <p className="mt-2 whitespace-pre-line text-body leading-7 text-text-secondary">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
