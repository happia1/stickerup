import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | StickerUp",
};

const sections = [
  {
    title: "1. 목적",
    body: "이 약관은 StickerUp이 제공하는 학원 출석·과제·칭찬 스티커 및 랭킹 서비스의 이용 조건과 운영자 및 이용자의 권리와 책임을 정합니다.",
  },
  {
    title: "2. 계정과 서비스 이용",
    body: "이용자는 정확한 정보를 사용하여 가입해야 하며 자신의 계정을 안전하게 관리해야 합니다. 학생 계정의 반 연결, 스티커 승인, 공지와 이벤트 운영은 연결된 학원의 관리자 또는 권한을 받은 선생님이 처리할 수 있습니다.",
  },
  {
    title: "3. 이용자의 의무",
    body: "타인의 계정을 사용하거나 서비스 운영을 방해해서는 안 됩니다. 허위 출석·과제 신청, 부적절한 게시물 작성 또는 다른 이용자의 권리를 침해하는 행위는 제한될 수 있습니다.",
  },
  {
    title: "4. 서비스의 변경 및 중단",
    body: "서비스 품질 개선, 점검 또는 불가피한 사유로 기능이 변경되거나 일시 중단될 수 있습니다. 중요한 변경은 서비스 화면을 통해 안내합니다.",
  },
  {
    title: "5. 책임",
    body: "운영자는 안정적인 서비스 제공을 위해 노력합니다. 다만 천재지변, 통신 장애, 이용자의 귀책사유 등 운영자가 통제하기 어려운 사유로 발생한 손해에 대해서는 관련 법령이 허용하는 범위에서 책임이 제한될 수 있습니다.",
  },
  {
    title: "6. 문의",
    body: "서비스 이용과 약관에 관한 문의는 학생 앱 마이페이지 하단의 문의하기를 이용해 주세요.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-app bg-surface-page px-5 py-8 text-text-primary">
      <Link href="/student/mypage" className="text-caption text-text-secondary">
        ← 마이페이지
      </Link>
      <h1 className="mt-5 text-title">이용약관</h1>
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
