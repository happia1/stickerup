# DEBUG NOTES

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
