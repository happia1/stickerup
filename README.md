# stickerup

> **Seed safety:** `supabase/migrations/20260719_04_seed_dev.sql` creates fixed demo accounts and data. Run it only in a local development database; never run it in a production or shared Supabase project.

## 가입 및 로그인

- `/login`은 역할 선택 없이 이메일/비밀번호로 로그인합니다. `students` 테이블에 있으면 `/student/home`, `teachers` 테이블에 있으면 `/admin/dashboard`로 이동합니다.
- `/signup`은 학생/선생님 유형을 선택하는 단일 회원가입 화면입니다. 선생님 가입은 학원, owner 선생님, 기본반, 기본 랭킹 주기, 기본 초대 링크를 생성합니다.
- 비밀번호 정책은 Supabase Hosted Auth 기준과 동일하게 **최소 6자**입니다. 회원가입 화면의 비밀번호 입력란에서 조건을 안내합니다.
- 학생 초대 링크는 `/join/[inviteCode]`에서 `/signup?invite=[inviteCode]`로 연결됩니다. 유효한 링크는 학생 유형과 학원명을 자동으로 설정하고 기본반 승인 등록을 생성합니다.
- 초대 링크가 없는 학생은 기존 학원명을 입력해 가입할 수 있으며, 기본반 등록은 `pending` 상태로 생성되어 선생님의 승인 또는 반 신청이 필요할 수 있습니다.
- `/onboarding`, `/onboarding/teacher`, `/onboarding/student`은 이전 링크 호환을 위해 `/signup`으로 이동합니다.
- Supabase 환경변수가 비어 있으면 기존 mock UI가 계속 표시됩니다. 실제 가입을 사용하려면 `.env.example`을 `.env.local`로 복사해 값을 설정하고 개발 서버를 재시작하세요.
학원 출석/숙제/칭찬 스티커 랭킹 앱

학원 출석 · 숙제 · 칭찬 스티커 랭킹 앱. 학생은 자기 계정으로 출석 체크, 숙제 인증, 칭찬 스티커를 요청해 스티커를 모으고, 반별/전체 랭킹과 랭킹 연동 보상을 확인합니다. 선생님(관리자)은 반 운영, 승인/롤백, 랭킹 주기, 보상을 관리합니다. 여러 학원이 독립적으로 사용하는 멀티테넌트 구조입니다.

## 주요 기능

- **출석 스티커**: 정시/10분/30분/1시간/1시간 초과 5단계 고정 기준, 반별로는 정규 출석 시각만 설정
- **숙제 스티커**: 완료율 3단계(완료/절반 완료/미완료) 자가 신청 → 관리자 승인
- **칭찬 스티커**: 학생 요청 → 관리자 승인, 또는 관리자 직접 지급
- **반(그룹) 관리**: 관리자가 반을 자유롭게 생성, 학생은 반 소속을 직접 신청해 승인받는 구조
- **랭킹**: 1등(금)·2등(은)·3등(동) 고정, 포디움 UI, 전체/그룹별 랭킹, 그룹별 개별 랭킹 주기(일/주/월/분기) 설정
- **상품(리워드)**: 그룹별 랭킹 주기에 연동된 순위 기반 보상, 순차 선택(드래프트) 방식
- **공지사항**: 관리자 게시판 → 학생 홈 화면 플랩 배너 노출
- **멀티테넌시**: 학원(테넌트) 단위 데이터 격리, 원장/조교 권한 분리, 초대 링크를 통한 학생 가입
- **스티커 지급 로그 및 롤백**: 모든 지급 내역 감사, 부정 지급 취소

## 기술 스택

- **프론트엔드**: Next.js (React), 반응형 웹
- **배포**: Vercel
- **백엔드 / DB / 인증 / 스토리지**: Supabase (Postgres, Auth, Storage, Row Level Security)
- **현재 상태**: mock store 기반 UI 유지 + Supabase client 구조 준비

## 문서

- [`docs/PRD_학원스티커랭킹앱.md`](./docs/PRD_학원스티커랭킹앱.md) — 제품 요구사항 정의서
- [`docs/IA_학원스티커랭킹앱.md`](./docs/IA_학원스티커랭킹앱.md) — 정보 구조(IA) 및 화면 흐름
- [`docs/디자인가이드_학원스티커랭킹앱.md`](./docs/디자인가이드_학원스티커랭킹앱.md) — 디자인 가이드(컬러, 타이포, 컴포넌트 스펙)
- [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md) — Supabase/Vercel 환경 설정 및 client 분리 규칙
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Vercel 환경변수, GitHub 자동 배포, CLI 배포 검증

## 시작하기

### 요구 사항

- Node.js 18 이상
- Supabase 프로젝트 (Postgres + Auth + Storage)

### 설치

```bash
git clone https://github.com/<your-org>/stickerup.git
cd stickerup
npm install
```

### 환경 변수

루트의 `.env.example`을 참고해 로컬에서만 `.env.local`을 만들고 값을 채워주세요. `.env.local`은 Git에 커밋하지 않습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

브라우저에서 사용하는 값은 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`뿐입니다. 이메일 회원가입은 Supabase Dashboard의 Site URL 기본값으로 인증 링크를 처리합니다. `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용이며 client component에서 import하지 않도록 `lib/supabase/admin.ts`에 분리되어 있습니다.

`NEXT_PUBLIC_SUPABASE_URL`에는 `https://<project-ref>.supabase.co` 형식의 **프로젝트 root URL**을 사용합니다. `/rest/v1/`, `/auth/v1/` 같은 API 경로를 붙이지 마세요. 앱은 잘못 붙은 경로를 root URL로 정규화하지만, Vercel 환경변수도 root URL로 수정해야 합니다.

### 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

### 배포

Vercel 프로젝트의 **Environment Variables**에 아래 값을 Development, Preview, Production 환경별로 등록하세요.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`NEXT_PUBLIC_` 접두사의 두 값만 브라우저에 노출됩니다. `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용이며 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. GitHub 연동 프로젝트는 Production Branch를 `main`으로 설정하면 `main` 푸시마다 자동으로 프로덕션 배포됩니다. 자세한 절차는 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)를 참고하세요.

### Supabase 연동 구조

- `lib/supabase/client.ts`: 브라우저/client component에서 사용할 anon key 기반 client factory
- `lib/supabase/admin.ts`: 서버 전용 service role 기반 admin client factory (`server-only` import로 client bundle 유입 방지)
- 기존 `lib/store` mock store는 Supabase 전환 중에도 UI가 깨지지 않도록 유지합니다.

## 프로젝트 구조 (예정)

stickerup/
├─ app/                # Next.js 라우트 (학생 앱 / 관리자 앱)
├─ components/         # 공통 UI 컴포넌트
├─ lib/                # Supabase 클라이언트, 유틸
├─ docs/               # PRD, IA, 디자인 가이드
└─ supabase/           # 마이그레이션, RLS 정책

## 라이선스

미정 (Private)
