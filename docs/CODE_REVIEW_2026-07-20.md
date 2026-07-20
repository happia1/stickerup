# Code Review: 2026-07-20

범위: `app/`, `components/`, `lib/`, `tailwind.config.ts`, `app/globals.css`, `package.json`, `docs/DEVLOG.md`, `docs/DEBUG_NOTES.md`

목적: 2차 Supabase 마이그레이션 전에 mock 기반 UI를 유지하면서 client/server 경계, 다크테마 안정성, 타입/schema 정합성, 죽은 코드, 문서 상태를 점검한다.

---

## Critical

### 없음

- 문제 위치: 해당 없음
- 문제 설명: 현재 코드에서 `SUPABASE_SERVICE_ROLE_KEY`가 client component 또는 브라우저용 Supabase client로 import되는 경로는 발견되지 않았다.
- 왜 문제가 되는지: service role key 노출은 즉시 데이터 전체 접근 위험으로 이어질 수 있으나, 현재는 `lib/supabase/admin.ts`가 `server-only`로 분리되어 있다.
- 수정 제안: 이후 서버 액션/API route 작성 시에도 `lib/supabase/admin.ts`만 서버 파일에서 import하도록 유지한다.
- 처리 판단: Supabase 연결 이후에도 계속 감시

---

## High

### Supabase SQL schema와 TypeScript 타입의 랭킹 주기/정책 모델 불일치

- 문제 위치: `lib/types.ts:7`, `lib/types.ts:141`, `supabase/migrations/20260719_01_init_schema.sql:68`, `supabase/migrations/20260719_01_init_schema.sql:156`
- 문제 설명: 앱 타입은 `RankingUnit = "day" | "week" | "month" | "quarter" | "custom"`과 `ranking_period_config.custom_days`를 사용하지만, SQL schema는 `custom`과 `custom_days`를 허용하지 않는다. 또한 앱은 `attendancePolicy`, `homeworkPolicy`, `TierConfig`를 동적 정책으로 운영하지만 SQL은 `attendance_records.tier`, `homework_submissions.completion_tier`에 고정 check 제약을 둔다.
- 왜 문제가 되는지: 2차 Supabase 마이그레이션에서 현재 UI/store 상태를 DB에 저장하려 하면 `custom` 주기나 동적 tier가 DB 제약에 막힌다.
- 수정 제안: 2차 마이그레이션에서 `ranking_period_config.custom_days` 추가, `classes.ranking_unit`/`ranking_period_config.unit` check에 `custom` 추가, 정책 테이블 또는 JSON 정책 저장 구조를 확정한다.
- 처리 판단: Supabase 2차 마이그레이션에서 수정

### Supabase client/admin이 import 시점에 환경변수 오류를 던지는 구조

- 문제 위치: `lib/supabase/client.ts:3`, `lib/supabase/admin.ts:4`
- 문제 설명: 현재 client/admin 모듈은 import되는 즉시 환경변수를 검사하고 client를 생성한다.
- 왜 문제가 되는지: mock store 기반 UI를 유지하는 전환기에는 `.env.local`이 없는 로컬/테스트 환경에서도 파일 import만으로 런타임 오류가 날 수 있다.
- 수정 제안: module top-level singleton 대신 `createSupabaseBrowserClient()` / `createSupabaseAdminClient()` factory로 바꿔 호출 시점에만 환경변수를 검증한다.
- 처리 판단: 지금 바로 수정

---

## Medium

### 다크테마 토큰 대신 `text-black` 하드코딩 사용

- 문제 위치: `components/student/FlapBanner.tsx:35`, `components/student/FlapBanner.tsx:37`, `components/ui/Podium.tsx:50`
- 문제 설명: 블랙 기본 다크 테마에서 `text-black`이 직접 사용된다.
- 왜 문제가 되는지: 표면 색이 바뀌거나 raised/card 위에 배치될 때 대비가 깨지고, 디자인 토큰 기반 테마 변경을 어렵게 만든다.
- 수정 제안: 일반 텍스트는 `text-text-primary`, 어두운 텍스트가 필요한 앰버/메달 위 텍스트는 `text-surface-page` 토큰으로 교체한다.
- 처리 판단: 지금 바로 수정

### `docs/SUPABASE_SETUP.md`가 없음

- 문제 위치: `docs/SUPABASE_SETUP.md`
- 문제 설명: README에는 기본 Supabase 환경변수 안내가 있지만, Vercel/Supabase 설정 절차를 분리한 문서가 없다.
- 왜 문제가 되는지: 2차 마이그레이션 이후 DB push, 환경변수, service role 취급 규칙을 추적하기 어렵다.
- 수정 제안: 현재 상태 기준의 Supabase/Vercel 준비 문서를 추가한다.
- 처리 판단: 지금 바로 수정

### `npm run typecheck` 스크립트 부재

- 문제 위치: `package.json:5`
- 문제 설명: 요구사항에서 `npm run typecheck 또는 npx tsc --noEmit`을 사용하도록 되어 있지만 package script에는 `typecheck`가 없다.
- 왜 문제가 되는지: 이후 작업자가 매번 `npx` 명령을 기억해야 하고 CI 명령 표준화가 어렵다.
- 수정 제안: `"typecheck": "tsc --noEmit"` 스크립트를 추가한다.
- 처리 판단: 지금 바로 수정

---

## Low

### 엄격한 unused 검사에서 죽은 코드/unused import가 발견됨

- 문제 위치: `app/admin/dashboard/page.tsx:13`, `app/admin/ranking-settings/page.tsx:2`, `app/admin/students/page.tsx:4`, `components/student/FlapBanner.tsx:2`, `components/student/RankingBlock.tsx:10`, `components/ui/Podium.tsx:10`
- 문제 설명: 기본 `tsc`는 통과하지만 `--noUnusedLocals --noUnusedParameters`에서는 unused 변수/import/상수가 실패한다.
- 왜 문제가 되는지: Supabase 전환 중 코드가 늘어나면 실제 사용 흐름과 죽은 코드가 섞여 리뷰 비용이 커진다.
- 수정 제안: 사용하지 않는 변수/import/상수를 제거한다.
- 처리 판단: 지금 바로 수정

### README 문서 링크와 Supabase 문서 체계 보강 필요

- 문제 위치: `README.md:24`, `docs/DEVLOG.md`, `docs/DEBUG_NOTES.md`
- 문제 설명: README의 문서 링크는 현재 파일명으로 정리되어 있으나 Supabase 전용 상세 문서가 부족하다. DEVLOG에는 과거 깨진 인코딩 항목도 남아 있다.
- 왜 문제가 되는지: 새 작업자가 현재 상태와 이전 restore 기록을 빠르게 파악하기 어렵다.
- 수정 제안: 깨진 과거 로그는 보존하되 새 기록은 UTF-8로 유지하고, Supabase 절차는 `docs/SUPABASE_SETUP.md`로 분리한다.
- 처리 판단: 일부 지금 수정, 깨진 과거 로그 정리는 별도 작업으로 보류

### mock store는 UI 유지에는 적합하지만 Supabase adapter 경계가 아직 없음

- 문제 위치: `lib/store/provider.tsx:14`, `lib/store/reducer.ts:15`, `lib/store/selectors.ts:1`
- 문제 설명: 상태, selector, reducer가 모두 in-memory mock store에 직접 묶여 있다.
- 왜 문제가 되는지: Supabase 전환 시 UI를 깨지 않으려면 query/mutation adapter 경계를 먼저 정해야 한다.
- 수정 제안: 2차 마이그레이션 후 `lib/store`는 유지하되 Supabase query 결과를 같은 `AppState` shape로 normalize하는 adapter를 추가한다.
- 처리 판단: Supabase 연결 이후로 미룸

---

## 결론

- 2차 Supabase 마이그레이션으로 넘어가기 전, High 항목인 DB schema/types 불일치 설계를 먼저 반영해야 한다.
- service role key 노출 위험은 현재 발견되지 않았지만, server-only 경계를 유지해야 한다.
- 지금 바로 수정 가능한 항목은 하드코딩 색상, lazy Supabase client factory, unused 코드, typecheck script, Supabase setup 문서다.
