# DEBUGGING NOTES

이 파일은 발생한 이슈의 증상/원인/조치를 기록한다.

---

## [2026-07-20] npm install ENOTEMPTY 에러

- 증상: `node_modules\axobject-query\...` 등에서 `rmdir ENOTEMPTY`로 npm install 실패
- 원인 추정: 이전 install이 타임아웃으로 중간에 끊겨 node_modules가 불완전한 상태로 남음
- 조치: node_modules, package-lock.json 삭제 → `npm cache clean --force` → npm install 재실행

## [2026-07-20] 학생/관리자 라우트 stub 및 build 검증

- 증상: 학생 마이페이지/설정/스티커와 관리자 주요 페이지가 단순 안내 카드 수준으로 축소되어 앱 구조가 뒤섞여 보였고, 이전 복원 내용이 일부 누락됨.
- 원인: `3e44de5` 이후 라우트 파일이 삭제되거나 stub으로 재생성되면서, `61b9aa9`의 레이아웃/정책/store 기능 일부가 워크트리에 반영되지 않음.
- 조치: 학생 화면을 PRD 기준으로 홈·스티커·마이페이지·설정 역할에 맞게 재구성하고, 관리자 라우트/store/type을 이전 완성 커밋 기준으로 복원했다. `npm.cmd run build`로 Windows PowerShell 실행 정책을 우회해 production build 통과 확인.

## [2026-07-20] Supabase 패키지 설치 및 build trace 잠금

- 증상: `npm.cmd install @supabase/supabase-js` 최초 실행 시 사용자 npm cache 경로에서 `EPERM` 실패. 이후 `npm.cmd run build` 최초 실행 시 `.next/trace` open `EPERM` 실패.
- 원인: npm cache 접근 권한이 sandbox에 막혔고, 3001 dev 서버가 `.next/trace`를 잡고 있어 production build가 trace 파일을 열 수 없었음.
- 조치: npm install은 승인된 권한으로 재실행해 성공. 3001 dev 서버 프로세스를 종료한 뒤 `npm.cmd run build`를 재실행해 성공.

## [2026-07-20] 코드리뷰 중 unused/typecheck 위험 정리

- 증상: `npx.cmd tsc --noEmit --noUnusedLocals --noUnusedParameters` 실행 시 unused 변수/import/상수 6건이 `TS6133`으로 실패.
- 원인: 이전 UI 복원 과정에서 `todayAttendance`, `useState`, `Pill`, `useRef`, `computePeriodBounds`, `MEDAL_LABEL`이 남아 있었지만 실제 렌더링 경로에서 사용되지 않음.
- 조치: 사용하지 않는 선언을 제거하고 `npm.cmd run typecheck`, `npm.cmd run build`, 엄격 unused 체크를 모두 통과시킴.

## [2026-07-21] `/signup` query parameter build failure

- 증상: `/signup?invite=...` 통합 후 production build에서 `prerender-manifest.json`이 생성되지 않았습니다.
- 원인: client page의 `useSearchParams` 호출에 Suspense 경계가 없어 Next.js 정적 prerender가 완료되지 않았습니다.
- 조치: 회원가입 폼을 `Suspense`로 감싸고 typecheck 및 production manifest 생성을 다시 확인했습니다.

## [2026-07-21] Signup invalid request-path message

- 증상: 회원가입 시 비밀번호 입력 아래에 `Invalid path specified in request URL`이 표시되었습니다.
- 확인: Supabase URL 형식과 server-only service key 읽기 연결은 정상입니다.
- 조치: 이메일 확인 복귀 주소를 현재 앱의 `/login`으로 명시하고, 같은 Auth 오류는 Supabase Site URL 및 Redirect URLs 설정을 안내하는 문구로 교체했습니다.

## 2026-07-21 Supabase Hosted Auth password minimum

- 증상: 앱의 6자 미만 비밀번호 정책과 Supabase Hosted Auth의 가입 제한이 달라 회원가입이 거부될 수 있었다.
- 원인: Supabase Hosted Auth의 최소 비밀번호 길이는 6자 미만으로 설정할 수 없다.
- 조치: 로그인·회원가입 검증과 화면 안내를 최소 6자로 통일했다.

## 2026-07-21 한글 아이디와 자동 로그인

- 증상: 한글 아이디를 입력하면 브라우저가 이메일 형식 오류를 먼저 표시할 수 있었다.
- 원인: `type=email` 입력은 앱의 한글 아이디 변환 전 브라우저 기본 검증을 실행한다.
- 조치: 로그인·회원가입 식별자 입력을 `type=text`로 유지하고, 자동 로그인 체크 상태에 따라 Supabase 세션 저장소를 localStorage 또는 sessionStorage로 분리했다.

## 2026-07-21 Vercel 회원가입 리디렉션 URL

- 증상: `https://stickerup.vercel.app/signup` 이메일 가입에서 `Invalid path specified in request URL`가 발생했고, 앱이 Supabase URL 설정 오류로 잘못 안내했다.
- 원인: `window.location.origin`을 직접 조합한 `emailRedirectTo`에 유효성 검증·환경변수 보조값·생략 처리 경로가 없었다.
- 조치: 현재 브라우저 origin을 검증해 우선 사용하고 `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_APP_URL`을 보조값으로 사용한다. 유효한 URL을 만들 수 없으면 `emailRedirectTo`를 보내지 않아 Supabase Site URL 기본값을 사용한다.

## 2026-07-21 Supabase service-role 가입 진단

- 증상: Vercel `SUPABASE_SERVICE_ROLE_KEY`가 없거나 잘못된 경우 가입 완료가 실패해도 원인을 명확히 알기 어려웠다.
- 원인: 관리자 client가 서버 route에서 생성되지만, 이메일 인증 시작 전 서버 키 상태를 확인하는 경로와 잘못된 키의 사용자용 오류 매핑이 없었다.
- 조치: server-only 관리자 상태 점검 route와 `/api/signup`에 누락·잘못된 키를 `503`과 안내 문구로 반환하는 처리를 추가했다. admin client import는 API route와 server-only auth helper에만 존재함을 확인했다.

## 2026-07-21 회원가입 인증 링크 재발

- 증상: origin 검증과 Vercel 배포 후에도 `Invalid path specified in request URL` 기반의 가입 인증 링크 오류가 계속 발생했다.
- 원인: 선택값인 `emailRedirectTo`가 Auth `signUp` 호출에 남아 있어 앱 코드가 인증 리디렉션 주소 처리 경로에 계속 개입했다.
- 조치: `emailRedirectTo`와 origin helper를 제거하고 Supabase Dashboard Site URL 기본 동작만 사용하도록 변경했다.

## 2026-07-21 Supabase 프로젝트 URL 경로 오류

- 증상: 한글 아이디 가입에서 인증 링크 오류 메시지가 반복됐다.
- 원인: `NEXT_PUBLIC_SUPABASE_URL`이 프로젝트 root가 아닌 `.../rest/v1/` endpoint였다. 한글 아이디 가입은 server-only admin Auth 요청을 사용하므로 SDK가 잘못된 경로를 조합했다.
- 조치: Supabase browser/admin client 생성 전에 URL을 HTTPS origin으로 정규화했다. Vercel 환경변수도 `/rest/v1/` 없는 프로젝트 root URL로 수정해야 한다.

## 2026-07-21 students 테이블 권한 거부

- 증상: 한글 아이디 가입 시 `permission denied for table students`가 표시됐다.
- 원인: 서버 전용 `service_role`에 마이그레이션으로 생성된 public 테이블 권한이 명시적으로 부여되지 않았다.
- 조치: `20260719_05_service_role_permissions.sql`에 service_role 권한 부여를 추가하고, 가입 전 admin 상태 점검과 API 오류를 SQL 실행 안내로 매핑했다. Supabase SQL Editor에서 migration 05 실행이 필요하다.

## 2026-07-21 학원 미등록 학생 가입

- 증상: 초대 링크 없이 학원명을 입력한 학생이 `Academy was not found` 오류를 받았다.
- 원인: 가입 로직이 기존 tenant만 허용해 pending 또는 미연결 학생 가입 요구사항과 맞지 않았다.
- 조치: 미등록 학원명에는 ownerless pending tenant와 pending enrollment를 생성하고, 동일 학원명 선생님 가입 시 그 tenant를 이어받도록 변경했다.

## 2026-07-21 가입 트리거 결과 미수신 오류

- 증상: 학생 가입 중 `query has no destination for result data`가 발생했다.
- 원인: 실제 Supabase DB의 기본반 생성 또는 학생 자동 배정 트리거 함수가 최신 정의와 달라 SELECT 결과가 처리되지 않았다.
- 조치: `20260719_06_repair_onboarding_triggers.sql`로 두 트리거 함수를 재적용하고, API에서 SQL Editor 실행 안내를 반환하도록 변경했다.

## [2026-07-21] End-of-day onboarding database handoff

- The repository-side signup error mapping and trigger repair migration are prepared. Production signup still requires the Supabase project to run `20260719_05_service_role_permissions.sql` and then `20260719_06_repair_onboarding_triggers.sql` when those migrations have not yet been applied.

## [2026-07-21] 배포 초대 링크 500 오류

- 증상: `/join/student-f78657dc436a`가 Vercel에서 HTTP 500을 반환하고, 대응하는 `/api/invites/...`는 404 invalid/expired를 반환했다.
- 원인: 조직 관리의 초대 링크 발급이 브라우저 상태에만 추가되어 Supabase `invite_links`에 저장되지 않았다. 서버 리디렉션 진입 페이지도 배포 환경에서 500을 반환했다.
- 조치: 인증된 `/api/admin/organization`에서 초대 링크를 조회·발급해 Supabase에 저장하도록 변경하고, `/join` 진입은 클라이언트 전환 방식으로 바꿨다. 기존에 임시 상태로 발급한 링크는 새 배포 후 재발급해야 한다.
- 추가 확인: 최신 배포에서도 모든 `/join/:token` 동적 경로가 500이지만 동일한 `/signup?invite=:token` 경로는 200이었다. Next.js 설정의 라우팅 단계에서 `/join`을 `/signup`으로 넘기고, 신규 링크도 `/signup` URL을 직접 사용하도록 변경했다.
