# DEVLOG

이 파일은 작업 세션별 진행 기록이다. 새 항목은 파일 맨 아래에 추가한다.

---

## 2026-07-20

- 한 일: Next.js 앱(mock 데이터 기반) 로컬 세팅, npm install 트러블슈팅(ENOTEMPTY 에러 해결), Supabase 스키마/RLS/시드 마이그레이션 추가, 디자인 가이드를 블랙 기본 다크 테마로 전면 개정하고 학생·관리자 앱 전체에 적용
- 상태: npm install 완료, `npm run dev`로 학생·관리자 전체 라우트 정상 렌더링 확인, 다크 테마 리디자인 커밋·푸시 완료. `npm run build`(프로덕션 빌드)는 이 환경에서 `EISDIR` 오류 발생 중(원인 미해결, dev 서버는 정상)
- 다음 할 일: `npm run build` EISDIR 오류 원인 조사, Supabase 실제 연동(mock 데이터 레이어 교체)

---

## 2026-07-20 (2)

- 한 일: 다크 테마 반영본을 기준으로 새 기능(스티커 등급 아이콘, 관리자 정책 편집기 `TierEditor`, `StickerCount` 컴포넌트, 랭킹 커스텀 기간, 공지 고정 체크박스, 상품 이미지 업로드)을 병합한 zip으로 app/, components/, lib/, package.json 전체 교체. lucide-react 아이콘 라이브러리 추가
- 상태: npm install 완료(lucide-react 등 2개 패키지 추가), `npm run dev`로 신규/변경 라우트(관리자 정책·리워드·공지·로그·랭킹설정, 학생 홈) 전부 정상 렌더링 확인, 커밋·푸시 완료
- 다음 할 일: 새 기능(정책 편집기, 상품 이미지 업로드 등) 실제 동작 브라우저 확인, `npm run build` EISDIR 오류 원인 조사, Supabase 실제 연동
