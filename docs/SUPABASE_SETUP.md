# Supabase Setup

## SQL Editor migration order

Run the migration files in the Supabase Dashboard **SQL Editor** in this exact order. Run one file at a time and confirm it succeeds before proceeding.

1. `supabase/migrations/20260719_01_init_schema.sql` — tables, constraints, and indexes.
2. `supabase/migrations/20260719_02_functions_triggers.sql` — helper functions and triggers.
3. `supabase/migrations/20260719_03_rls_policies.sql` — Row Level Security and access policies.

`supabase/migrations/20260719_04_seed_dev.sql` is intentionally excluded from the production sequence. It writes fixed demo users directly to `auth.users`, so run it only against a disposable local development database. Do not run it in a production or shared Supabase project.

After steps 1–3, verify that the expected tables, functions, and RLS policies appear in the Dashboard before connecting the application to the database.

StickerUp은 현재 mock store 기반 UI를 유지하면서 Supabase 연동 구조만 준비한 상태다. 실제 데이터 연결은 2차 Supabase 마이그레이션 이후 점진적으로 진행한다.

## 환경 변수

로컬에서는 루트의 `.env.example`을 참고해 `.env.local`을 만들고 값을 채운다. `.env.local`은 Git에 커밋하지 않는다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Vercel에는 Project Settings > Environment Variables에 같은 값을 등록한다.

`NEXT_PUBLIC_SUPABASE_URL`은 `https://<project-ref>.supabase.co` 형식의 프로젝트 root URL이어야 한다. `/rest/v1/` 또는 `/auth/v1/` 경로를 포함하면 Auth 관리자 요청 경로가 잘못 조합될 수 있다.

## Service-role database permissions

After migration 03, run `supabase/migrations/20260719_05_service_role_permissions.sql` in the Supabase Dashboard SQL Editor. It grants the server-only `service_role` database privileges while keeping browser RLS enabled. Without it, signup can fail with `permission denied for table students`.

## Client 분리

- `lib/supabase/client.ts`: 브라우저용 anon key client factory
- `lib/supabase/admin.ts`: 서버 전용 service role client factory

`SUPABASE_SERVICE_ROLE_KEY`는 절대 client component에서 import하지 않는다. 관리자 권한 작업은 서버 액션, route handler, 또는 Edge Function에서 `lib/supabase/admin.ts`를 통해 수행한다.

## Auth and onboarding

- `/login` uses the browser anon-key client for email/password sign-in without a role selector. It checks `teachers` and `students` through a server route and redirects by the stored application role.
- `/signup` is the single public signup screen. Teacher signup initializes the academy; student signup uses either an invite link or an academy name. When the name is not registered, it creates a pending academy that a later teacher signup with the same name can claim. The legacy `/onboarding` routes redirect to `/signup`.
- `/join/[inviteCode]` redirects to `/signup?invite=[inviteCode]`. The public server handler confirms the invite token, then the signup screen fixes the student type and academy name. The invite token and selected role are stored in Supabase Auth user metadata so email-confirmation flows can resume signup after login.
- Email signup does not send `emailRedirectTo`. Supabase uses the Dashboard Site URL as the confirmation return location, avoiding application-side redirect URL validation.
- The signup and login forms accept an email address or a 2–10 character Korean/English identifier. Identifier accounts are created by the server with an internal Auth email and `login_identifier` user metadata; the internal address is never shown in the UI. Use a real email address when email confirmation or password recovery is required.
- The app requires passwords of at least 6 characters, matching the Supabase Hosted Auth minimum password length. The signup password field displays this requirement. Supabase recommends a stronger policy such as 8 characters when service requirements allow it.
- Profile creation, invite resolution, and student-home reads run through server route handlers. They validate the browser access token first, then use `lib/supabase/admin.ts` only on the server. Never expose `SUPABASE_SERVICE_ROLE_KEY` to a browser bundle.

If `.env.local` is missing or its public values are empty, the login, onboarding, and student home screens display a clear demo-mode notice and the existing mock store remains active. Copy `.env.example` to `.env.local`, fill the values, and restart the dev server to enable Supabase.

## Onboarding data and RLS notes

- Teacher onboarding writes `tenants`, `teachers` with `role = 'owner'`, the default `classes` row, a global `ranking_period_config`, and one active `invite_links` row. The schema trigger creates the default class, while the server repository also verifies it exists before completing setup.
- Student invite onboarding resolves `invite_links.token`, creates `students` with `invite_link_id`, then upserts an `approved` enrollment into the tenant default class.
- `invite_links` is not publicly selectable under the current RLS policies. The public `/api/invites/[inviteCode]` handler validates a token with the server/admin client and returns only the academy and issuing teacher names needed by the join screen.
- All profile and setup writes run through server route handlers that validate the browser bearer token using `lib/supabase/server-auth.ts`. `SUPABASE_SERVICE_ROLE_KEY` stays in `lib/supabase/server-config.ts` and must never be imported by a client component.
- Before enabling production signups, apply migrations 01–03 and confirm the tenant default-class trigger, `students.invite_link_id`, and RLS policies exist in the target project.

## 현재 주의점

- `lib/store` mock store는 유지한다.
- 2차 마이그레이션 전 `lib/types.ts`와 SQL schema의 랭킹 주기/정책 모델 차이를 정리해야 한다.
- production build 전 실행 중인 dev 서버가 있으면 Windows에서 `.next/trace` EPERM이 날 수 있으므로 dev 서버를 종료한 뒤 build를 실행한다.
