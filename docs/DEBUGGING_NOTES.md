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

## [2026-07-21] 초대 가입자 아이디 및 선생님 유형 초기화 오류

- 증상: 초대 가입 화면에 현재 로그인된 김정원 선생님의 아이디가 고정되고, `type=teacher` 초대도 학생 가입 유형으로 돌아갔다.
- 원인: 초대 화면에서도 기존 Supabase 세션 메타데이터를 폼에 주입해 아이디를 비활성화했고, 초대 조회 성공 처리에서 초대 역할을 설정한 직후 `student`를 다시 설정하는 중복 코드가 있었다.
- 조치: 초대 링크 진입 시 로컬 기존 세션을 종료하고 아이디·비밀번호를 빈 입력값으로 초기화했다. 중복 학생 유형 설정을 제거해 DB의 `inviteeRole`을 유지하고, 학원 이름은 초대 데이터의 읽기 전용 값으로 유지했다.

## [2026-07-21] 선생님 권한 수정 경계 누락

- 증상: 조직 관리에 권한 토글이 표시되지만 모두 비활성화되어 원장도 수정할 수 없었고, 역할을 서버에서 검증하는 권한 변경 API가 없었다.
- 원인: 초기 화면 구현이 권한 조회 UI까지만 연결되고 실제 저장 mutation과 owner 검증 경계가 구현되지 않았다.
- 조치: 동일 조직의 `owner`만 보조 선생님의 권한을 변경할 수 있는 PATCH API를 추가했다. 클라이언트도 원장에게만 토글을 활성화하고 보조 선생님 및 원장 본인 권한은 수정하지 못하도록 했다.

## [2026-07-21] 학생-선생님 연결 링크 500 오류

- 증상: 학생이 발급한 `/connect/student/{token}` 링크를 배포 환경에서 열면 HTTP 500이 발생했다.
- 원인: 앞서 `/join/{token}`에서도 500을 일으킨 동적 진입 페이지와 동일한 구조로 연결 화면이 구현되어 있었다.
- 조치: 연결 화면을 정적 `/connect/student?token=...` 경로로 추가하고 신규 링크는 해당 주소로 발급한다. 기존 `/connect/student/{token}` 주소는 Next.js 리디렉션으로 새 주소에 연결했다.
- 배포 확인: `https://stickerup.vercel.app/connect/student/connect-f78a530f7eaf4a3d`는 500, 같은 토큰의 연결 API는 200, 새 쿼리 화면은 404였다. 따라서 토큰/DB가 아니라 아직 수정 코드가 배포되지 않은 상태로 확인됐다.

## [2026-07-21] Vercel 랭킹 기간 함수 타입 오류

- 증상: Vercel 빌드에서 `app/admin/rewards/page.tsx`가 `computePeriodBounds`에 인자 5개를 전달했지만 함수는 1~3개만 받도록 정의되어 타입 검사가 실패했다.
- 원인: 커스텀 기간 UI 호출부와 공용 기간 계산 함수의 변경이 서로 다른 커밋에 포함되어 깨끗한 배포 체크아웃에서 시그니처가 일치하지 않았다.
- 조치: 공용 함수에 선택적 시작일·종료일 인자를 추가하고 관련 기간 타입까지 원격 커밋에 포함했다. 로컬 프로덕션 빌드와 실제 배포 페이지 HTTP 200을 확인했다.

## [2026-07-21] happia1 개발자 로그인 권한 차단

- 증상: `happia1` 비밀번호 인증은 성공했지만 후속 API 권한 검사에서 `개발자 계정만 접근할 수 있습니다.`가 표시됐다.
- 원인: 단일 고정 개발자 계정도 Vercel 환경변수 허용 목록과 다시 대조해, 환경변수 적용 범위나 재배포 시점이 맞지 않으면 정상 계정이 차단됐다.
- 조치: `happia1`의 고정 내부 Auth 이메일을 기본 개발자 계정으로 서버에서 직접 인정했다. 비밀번호 검증은 계속 Supabase Auth가 담당하며 환경변수는 추가 개발자 계정을 허용할 때만 사용한다.

## [2026-07-21] 일반 회원가입에 기존 개발자 계정이 고정되는 오류

- 증상: 개발자 로그인 후 일반 회원가입으로 이동하면 내부 Auth 이메일과 기존 이름·학원 정보가 입력란에 고정되고 비밀번호를 새로 입력할 수 없었다.
- 원인: `/signup`이 모든 기존 Supabase 세션을 이메일 인증 후 가입 재개 세션으로 간주해 메타데이터를 폼에 주입했다.
- 조치: `resume=1`로 명시된 가입 재개 요청에서만 기존 세션을 사용한다. 일반 및 신규 초대 회원가입은 로컬 세션을 종료하고 아이디·비밀번호·이름·나이·학원명을 빈 값으로 초기화한다.

## [2026-07-21] 로컬 Next 빌드 캐시 파일 점유

- 증상: 상품 카탈로그 변경 검증 중 빌드가 `.next/server/middleware-manifest.json` 누락 후 재시도에서 `.next/trace` EPERM으로 중단됐다.
- 원인: 작업 폴더에서 실행 중인 다른 Node/Next 프로세스가 동일한 `.next` 빌드 디렉터리를 점유했다.
- 조치: 사용자 실행 프로세스는 종료하지 않았다. `npm.cmd run typecheck`와 `git diff --check`로 소스 검증을 완료하고, 격리된 Vercel clean build에서 최종 확인하도록 남겼다.

## [2026-07-21] 연결 승인 후 학생 홈 프로필 없음 오류

- 증상: 선생님 연결 승인 후 학생 홈에 `Student profile: no data returned.`와 학생 정보를 불러오지 못했다는 안내가 표시됐다.
- 확인: 최근 승인 요청의 `students` 행, Auth 사용자, `invited_by_teacher_id`가 모두 정상적으로 존재했다.
- 원인: 연결 링크 처리 과정에서 같은 브라우저가 선생님 계정으로 로그인되어 있었고, 그 선생님 Auth ID로 학생 홈 API를 호출해 대응하는 학생 프로필이 없었다.
- 조치: 학생 홈에서 먼저 현재 계정 역할을 확인한다. 선생님 세션이면 관리자 대시보드로 이동하고, 학생 프로필이 없는 계정에는 학생 계정 재로그인을 명확히 안내한다.

## [2026-07-22] 로그인 역할별 조직 데이터 미동기화

- 증상: 하위 선생님에게 반·공지·관리자 프로필이 보이지 않고, 학생 마이페이지·반 선택·랭킹 이벤트가 비어 있으며 칭찬 요청이 관리자 승인함에 나타나지 않았다.
- 원인: 전역 AppStore가 빈 mock seed로 시작했고 학생 홈만 별도 API 데이터를 사용했다. 반·공지·이벤트 생성 및 학생 출석·숙제·칭찬 요청도 대부분 브라우저 메모리에만 저장됐다.
- 확인: 실제 Supabase 조직에는 선생님 2명, 학생 3명, 기본반 1개만 존재했고 notices/reward_campaigns/homework_submissions/praise_requests는 0건이었다.
- 조치: `/api/app-state` 전역 hydrate, `/api/student/actions`, `/api/admin/approvals`, `/api/app-mutations`를 추가해 조직 데이터 조회와 변경을 Supabase에 연결했다.
- 참고: 과거 브라우저 메모리에만 만들고 DB에 저장되지 않은 특강반·공지·이벤트는 서버에서 복구할 수 없으므로 배포 후 다시 등록해야 한다.
