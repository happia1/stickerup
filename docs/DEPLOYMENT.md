# Vercel 배포 가이드

## 배포 전 확인

로컬에서 아래 명령을 통과시킨 뒤 배포합니다.

```bash
npm run typecheck
npm run build
```

`.env.local`은 로컬 전용 파일이며 Git에 추적하지 않습니다. 값의 이름과 빈 템플릿은 루트의 `.env.example`에서 확인합니다.

## Vercel 환경변수

Vercel Dashboard에서 프로젝트를 열고 **Settings > Environment Variables**로 이동합니다. 아래 세 값을 각각 Development, Preview, Production 환경에 등록합니다. Preview에서 별도 Supabase 프로젝트를 사용한다면 해당 Preview 값을 분리합니다.

| 이름 | 용도 | 브라우저 노출 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 예 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저용 Supabase anon key | 예 |
| `SUPABASE_SERVICE_ROLE_KEY` | API route의 서버 전용 관리자 key | 아니요 |

`SUPABASE_SERVICE_ROLE_KEY`에는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 이 프로젝트에서는 `lib/supabase/admin.ts`와 `lib/supabase/server-config.ts`가 `server-only`로 보호되고, 이를 사용하는 코드는 `app/api/**/route.ts` 및 서버 전용 repository에만 둡니다.

환경변수를 추가하거나 수정한 뒤에는 새 배포를 실행해야 빌드 시점의 `NEXT_PUBLIC_` 값이 반영됩니다.

## GitHub 자동 배포

1. Vercel에서 GitHub 저장소를 Import하고 Framework Preset으로 Next.js를 선택합니다.
2. Production Branch를 `main`으로 설정합니다.
3. 위 환경변수를 등록한 뒤 최초 배포를 실행합니다.
4. 이후 `main` 브랜치 푸시는 프로덕션 배포를 만들고, pull request 푸시는 Preview 배포를 만듭니다.

배포가 실패하면 Vercel Deployments의 Build Logs에서 먼저 환경변수 누락과 `npm run build` 오류를 확인합니다.

## Vercel CLI 검증

이 저장소를 점검한 환경에는 Vercel CLI가 설치되어 있습니다. 프로젝트를 연결하고 Vercel 환경변수를 내려받은 뒤, 로컬에서 Vercel 빌드를 재현할 수 있습니다.

```bash
vercel pull --environment=development
vercel build
vercel deploy --prebuilt
```

PowerShell 실행 정책으로 `vercel` shim이 차단되면 Windows에서는 `vercel.cmd pull --environment=development`, `vercel.cmd build`처럼 실행합니다. `vercel pull`이 생성하는 `.vercel` 디렉터리는 Git ignore 대상입니다.

## 배포 후 확인

- `/`, `/login`, `/onboarding`, `/onboarding/teacher`, `/onboarding/student`이 정상 응답하는지 확인합니다.
- 실제 초대 코드로 `/join/[inviteCode]`을 확인합니다.
- Supabase Auth 가입, 이메일 확인, 역할별 이동을 확인합니다.
- Vercel 로그에 service role key, access token, 사용자 입력값이 출력되지 않는지 확인합니다.

문제가 생기면 Vercel Deployments에서 직전 정상 배포를 Promote하거나 해당 배포로 롤백합니다.
