# DEBUG NOTES

## [2026-07-21] Onboarding trigger result-data error

- Symptom: student signup failed with `query has no destination for result data` after reaching the database insert stage.
- Cause: the deployed tenant or student onboarding trigger function differs from the current migration definition and contains a `SELECT` whose result is not assigned or returned.
- Resolution: added `20260719_06_repair_onboarding_triggers.sql` to reapply both trigger functions with `SELECT ... INTO`. Run it after migration 05 in the Supabase SQL Editor.

## [2026-07-21] Academy not found during general student signup

- Symptom: a student without an invite link received `Academy was not found` after entering an academy name.
- Cause: the onboarding flow required a pre-existing `tenants` row even though the product flow allows general student signup to remain pending before teacher approval.
- Resolution: when no tenant matches the submitted academy name, the server creates an ownerless pending tenant, creates a pending enrollment, and lets a later teacher signup with the same name claim that tenant.

## [2026-07-21] Students table permission denied during signup

- Symptom: Korean identifier signup reached the server onboarding path but failed with `permission denied for table students`.
- Cause: the browser remains protected by RLS, and the deployed database did not have explicit PostgreSQL privileges for the server-only `service_role` on the migrated public tables. The student onboarding flow checks and then inserts into `students`.
- Resolution: added `20260719_05_service_role_permissions.sql`, which grants privileges only to `service_role` and leaves browser RLS enabled. Run this migration in the Supabase SQL Editor before retrying signup.

## [2026-07-21] Supabase REST endpoint used as project URL

- Symptom: Korean identifier signup kept failing with `Invalid path specified in request URL` even after redirect handling changes.
- Cause: `NEXT_PUBLIC_SUPABASE_URL` was configured as `https://<project-ref>.supabase.co/rest/v1/`. Korean identifier signup bypasses browser email signup and calls the server admin client, which requires the Supabase project root URL rather than a REST endpoint path.
- Resolution: both browser and server admin clients now normalize the configured value to its HTTPS origin before creating a Supabase client. Vercel should still store `https://<project-ref>.supabase.co` without `/rest/v1/` or `/auth/v1/`.

## [2026-07-21] Signup confirmation redirect fallback

- Symptom: signup continued to return `Invalid path specified in request URL` after validating the client-side origin and configuring the Vercel production URL.
- Cause: the optional `emailRedirectTo` request value was still present in the client Auth signup call, leaving the flow dependent on application-side redirect URL handling.
- Resolution: removed `emailRedirectTo` entirely. Email signup now relies only on the Supabase Dashboard Site URL, so the application does not construct or prevalidate a confirmation redirect URL.

## [2026-07-21] Supabase service-role configuration during signup

- Symptom: a Vercel deployment can fail to complete signup when `SUPABASE_SERVICE_ROLE_KEY` is missing or does not belong to the configured Supabase project, without a clear user-facing explanation.
- Cause: the admin client was created only after client-side Auth work and missing or invalid server credentials could surface as an unhandled route error or low-level Supabase response.
- Resolution: email signup now checks a server-only admin status route before starting Auth signup. Missing public configuration, a missing service-role key, and an invalid service-role key return distinct safe messages with HTTP `503`; the signup route applies the same mapping.

## [2026-07-21] Vercel signup redirect origin

- Symptom: email-based signup on `https://stickerup.vercel.app/signup` displayed `Invalid path specified in request URL`, which the app presented as a Supabase URL configuration error.
- Cause: the signup page directly concatenated `window.location.origin` into `emailRedirectTo` and treated the low-level error as a dashboard configuration failure. It had no validated origin fallback and no way to omit the optional redirect value.
- Resolution: the client now uses a validated current browser origin first, falls back to `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_APP_URL`, and omits `emailRedirectTo` if no valid origin exists so Supabase uses its configured Site URL. The production fallback is documented as `https://stickerup.vercel.app`.

## [2026-07-21] Supabase Hosted Auth password minimum

- Symptom: the app allowed passwords shorter than the Supabase Hosted Auth minimum, so signup attempts were rejected.
- Cause: Supabase Hosted Auth does not allow its minimum password length to be configured below 6 characters.
- Resolution: aligned signup API and client validation, login validation, and user-facing password guidance to a minimum of 6 characters.

## [2026-07-21] Signup invalid request-path message

- Symptom: signup displayed `Invalid path specified in request URL` below the password input.
- Investigation: the configured Supabase URL parses correctly, and a server-only read using the configured service key succeeds.
- Resolution: signup now explicitly sends users back to `${window.location.origin}/login` after email confirmation and replaces the low-level Auth path error with an actionable Supabase Site URL/Redirect URLs message. The dashboard must allow the current app origin for the confirmation redirect.

## [2026-07-21] Signup query parameter build failure

- Symptom: the first production build after adding `/signup?invite=...` ended before generating `prerender-manifest.json`.
- Cause: the client page called `useSearchParams` without a Suspense boundary, so Next.js could not complete static prerendering.
- Resolution: wrapped the signup form in a `Suspense` boundary. `npm.cmd run typecheck` passed and the rebuilt `.next` output includes `BUILD_ID`, `app-paths-manifest.json`, and `prerender-manifest.json`.

## [2026-07-20] Auth entry flow build lock prevention

- Symptom: port 3001 was occupied by an existing Next.js development server before the production build.
- Cause: the development server can keep `.next/trace` open on Windows, which risks the known `EPERM` build failure.
- Resolution: stopped the port 3001 process before running the build. `npm.cmd run typecheck` passed, and the production build generated `BUILD_ID`, `app-paths-manifest.json`, and `prerender-manifest.json` successfully.

## [2026-07-20] Vercel deployment readiness verification

- Symptom: `next build` emitted `outputFileTracing` deprecation and webpack cache snapshot warnings on Windows.
- Cause: the current Next.js configuration disables output file tracing, and the local Windows cache cannot snapshot some dependency paths.
- Resolution: the warnings are non-blocking. With no process listening on port 3001, `npm.cmd run typecheck` passed and `npm.cmd run build` generated `BUILD_ID`, `app-paths-manifest.json`, and `prerender-manifest.json`. No `.next/trace` `EPERM` occurred.
- Note: Vercel CLI `50.28.0` is installed. In this PowerShell environment the `vercel.ps1` shim is blocked by execution policy, so use `vercel.cmd` when running CLI commands locally.

## [2026-07-20] Removed-route Next type cache

- Symptom: `npm run typecheck` still referenced deleted `/auth` and `/api/onboarding` route modules.
- Cause: `.next/types` retained generated declarations from the previous route structure.
- Resolution: removed only the stale generated type files under `.next/types`, then reran typecheck successfully. A clean `next build` regenerates the current route declarations.

## [2026-07-20] Student home Supabase fallback type check

- Symptom: the first typecheck reported that the optional browser Supabase client could be null inside the asynchronous student-home loader.
- Cause: TypeScript does not retain a nullable client narrowing across the nested async function boundary.
- Resolution: pass the checked client as a non-null loader parameter. Missing configuration still exits before the request and keeps the mock store active.

## [2026-07-20] Supabase migration validation scope

- Symptom: the local workspace does not include the Supabase CLI or a Postgres client, so SQL migrations cannot be applied to a local database in this environment.
- Cause: this project is in application-side migration preparation; no disposable Supabase project or database connection is configured yet.
- Resolution: verified the ordered migration files and their cross-file dependencies statically, documented the exact SQL Editor execution order, and made `custom` ranking periods consistent with the current TypeScript types. Apply migrations 01–03 to a disposable Supabase project before connecting the app.

## [2026-07-20] Next.js build verification warnings

- Symptom: `next build` emitted webpack cache snapshot warnings and an `outputFileTracing` deprecation warning.
- Cause: local Windows cache snapshot limitations and the existing Next.js configuration. These warnings did not prevent the build.
- Resolution: stopped the port 3001 dev server before building, then verified the generated production manifests and `BUILD_ID`. No `.next/trace` `EPERM` occurred in this run.

이 파일은 사용자 요청 파일명에 맞춘 디버깅 기록이다. 기존 작업 지침용 기록은 `docs/DEBUGGING_NOTES.md`에도 유지한다.

---

## [2026-07-20] Supabase 패키지 설치 및 build trace 잠금

- 증상: `npm.cmd install @supabase/supabase-js` 최초 실행 시 사용자 npm cache 경로에서 `EPERM` 실패. 이후 `npm.cmd run build` 최초 실행 시 `.next/trace` open `EPERM` 실패.
- 원인: npm cache 접근 권한이 sandbox에 막혔고, 3001 dev 서버가 `.next/trace`를 잡고 있어 production build가 trace 파일을 열 수 없었음.
- 조치: npm install은 승인된 권한으로 재실행해 성공. 3001 dev 서버 프로세스를 종료한 뒤 `npm.cmd run build`를 재실행해 성공.

## [2026-07-20] 코드리뷰 중 unused/typecheck 위험 정리

- 증상: `npx.cmd tsc --noEmit --noUnusedLocals --noUnusedParameters` 실행 시 unused 변수/import/상수 6건이 `TS6133`으로 실패.
- 원인: 이전 UI 복원 과정에서 `todayAttendance`, `useState`, `Pill`, `useRef`, `computePeriodBounds`, `MEDAL_LABEL`이 남아 있었지만 실제 렌더링 경로에서 사용되지 않음.
- 조치: 사용하지 않는 선언을 제거하고 `npm.cmd run typecheck`, `npm.cmd run build`, 엄격 unused 체크를 모두 통과시킴.

## [2026-07-21] Korean identifier browser validation

- Symptom: signup could show a browser email-format warning when a user entered a Korean identifier.
- Cause: an email input type triggers native browser validation before the identifier-to-internal-Auth-email conversion can run.
- Resolution: keep all login and signup identifier controls as `type="text"`; the app validates the identifier and converts valid Korean IDs on the server path.

## [2026-07-21] Onboarding trigger repair handoff

- Symptom: student signup can return `query has no destination for result data`.
- Cause: an already-deployed database trigger function emits a `SELECT` result without assigning or discarding it.
- Resolution: the repository contains `supabase/migrations/20260719_06_repair_onboarding_triggers.sql`, which replaces the affected functions with `SELECT ... INTO` logic. This is a database-side action: run migration 05 followed by migration 06 in the Supabase SQL Editor if the deployed project has not received them yet.

## [2026-07-21] Mock student data overlapped real Supabase users

- Symptom: after creating and logging in with a real student account, the student UI still displayed seeded mock data such as 김민준.
- Cause: normal app routes still initialized the legacy React store with seeded mock students, classes, ledger entries, rewards, and notices as fallback data.
- Resolution: emptied the mock seed exports, reset the default current user id, removed the settings demo account switcher, and added an explicit empty/login state when Supabase student data is unavailable.

