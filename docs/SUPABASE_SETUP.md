# Supabase Setup

StickerUp은 현재 mock store 기반 UI를 유지하면서 Supabase 연동 구조만 준비한 상태다. 실제 데이터 연결은 2차 Supabase 마이그레이션 이후 점진적으로 진행한다.

## 환경 변수

로컬에서는 루트의 `.env.example`을 참고해 `.env.local`을 만들고 값을 채운다. `.env.local`은 Git에 커밋하지 않는다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Vercel에는 Project Settings > Environment Variables에 같은 값을 등록한다.

## Client 분리

- `lib/supabase/client.ts`: 브라우저용 anon key client factory
- `lib/supabase/admin.ts`: 서버 전용 service role client factory

`SUPABASE_SERVICE_ROLE_KEY`는 절대 client component에서 import하지 않는다. 관리자 권한 작업은 서버 액션, route handler, 또는 Edge Function에서 `lib/supabase/admin.ts`를 통해 수행한다.

## 현재 주의점

- `lib/store` mock store는 유지한다.
- 2차 마이그레이션 전 `lib/types.ts`와 SQL schema의 랭킹 주기/정책 모델 차이를 정리해야 한다.
- production build 전 실행 중인 dev 서버가 있으면 Windows에서 `.next/trace` EPERM이 날 수 있으므로 dev 서버를 종료한 뒤 build를 실행한다.
