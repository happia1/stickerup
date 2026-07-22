# DEVLOG

???뚯씪? ?묒뾽 ?몄뀡蹂?吏꾪뻾 湲곕줉?대떎. ????ぉ? ?뚯씪 留??꾨옒??異붽??쒕떎.

---

## 2026-07-20

- ???? Next.js ??mock ?곗씠??湲곕컲) 濡쒖뺄 ?명똿, npm install ?몃윭釉붿뒋??ENOTEMPTY ?먮윭 ?닿껐), Supabase ?ㅽ궎留?RLS/?쒕뱶 留덉씠洹몃젅?댁뀡 異붽?, ?붿옄??媛?대뱶瑜?釉붾옓 湲곕낯 ?ㅽ겕 ?뚮쭏濡??꾨㈃ 媛쒖젙?섍퀬 ?숈깮쨌愿由ъ옄 ???꾩껜???곸슜
- ?곹깭: npm install ?꾨즺, `npm run dev`濡??숈깮쨌愿由ъ옄 ?꾩껜 ?쇱슦???뺤긽 ?뚮뜑留??뺤씤, ?ㅽ겕 ?뚮쭏 由щ뵒?먯씤 而ㅻ컠쨌?몄떆 ?꾨즺. `npm run build`(?꾨줈?뺤뀡 鍮뚮뱶)?????섍꼍?먯꽌 `EISDIR` ?ㅻ쪟 諛쒖깮 以??먯씤 誘명빐寃? dev ?쒕쾭???뺤긽)
- ?ㅼ쓬 ???? `npm run build` EISDIR ?ㅻ쪟 ?먯씤 議곗궗, Supabase ?ㅼ젣 ?곕룞(mock ?곗씠???덉씠??援먯껜)

## 2026-07-20 (restore from archive)

- 한 일: 사용자 요청에 따라 Desktop의 stickerup-current.zip 압축본을 저장소 루트에 전체 교체하고 
pm install 후 커밋·푸시 완료
- 상태: 저장소 루트 내용이 압축본 기준으로 반영됨, 커밋 3e44de5, 원격 origin/main 푸시 완료. 
pm run build는 기존 EISDIR/EPERM 환경 이슈로 실패
- 다음 할 일: 빌드 오류 원인 조사, 필요 시 추가 수정

## 2026-07-20 (layout restore and build verification)

- ???? 臾몄꽌/?붿옄??媛?대뱶 湲곗??쇰줈 ?숈깮 ?댟룹뒪?곗빱쨌留덉씠?섏씠吏쨌?ㅼ젙 ?붾㈃???щ텇由ы븯怨? ?댁쟾 ?꾩꽦 而ㅻ컠??愿由ъ옄 二쇱슂 ?쇱슦?몄? ?뺤콉/??궧/由ъ썙??store 湲곕뒫??蹂듭썝?덈떎.
- ?곹깭: `npm.cmd run build` ?듦낵. `/student/home`, `/student/sticker`, `/student/mypage`, `/student/settings` 諛?愿由ъ옄 二쇱슂 ?쇱슦?멸? production build???ы븿??
- ?ㅼ쓬 ???? ?ㅼ젣 釉뚮씪?곗??먯꽌 3001 ?ы듃 ?뚮뜑留??뺤씤, ?꾩슂 ??Git 而ㅻ컠/?몄떆 吏꾪뻾.

## 2026-07-20 (borderless student UI cleanup)

- ???? ?숈깮 ???곷떒諛??섎떒 ?낅컮 諛곌꼍??surface-page 釉붾옓?쇰줈 ?듭씪?섍퀬, ?섎떒 ?낅컮 ?대え?곗퐯???쒓굅???띿뒪??以묒븰 ?뺣젹濡?蹂寃쏀뻽?? ??궧 ?щ뵒?? 由ъ뒪?명삎 ??궧?쇰줈 諛붽씀怨? ??궧/由ъ썙???ㅽ떚而?留덉씠?섏씠吏 移대뱶 ?뚮몢由щ? ?쒓굅?덈떎.
- ?곹깭: `npx.cmd tsc --noEmit` ?듦낵. `npm.cmd run build`??Windows `.next/trace` ?좉툑 ?댁뒋濡?以묐떒?섏뼱 蹂꾨룄 ?뺤씤 ?꾩슂.
- ?ㅼ쓬 ???? dev ?쒕쾭?먯꽌 ?쒓컖 ?뺤씤 ???꾩슂 ??媛꾧꺽/紐낅룄 誘몄꽭 議곗젙.

## 2026-07-20 (mypage/settings information split)

- ???? 留덉씠?섏씠吏 理쒖긽???꾨줈???대쫫 ?놁뿉 ?몄쭛 踰꾪듉??異붽??섍퀬 ?꾨줈???ㅼ젙??諛뷀??쒗듃濡??대룞?덈떎. ?숈썝 ?뺣낫???꾨줈??諛붾줈 ?꾨옒濡???린怨? ?뚯냽 諛??꾪솴 移대뱶 ?덉뿉 ?뚯냽 諛??좎껌 UI瑜?蹂묓빀?덈떎.
- ?곹깭: ?곷떒諛??ㅼ젙 ?섏씠吏???섍꼍?ㅼ젙/?곕え 怨꾩젙 ?꾪솚留??④?. `npx.cmd tsc --noEmit` ?듦낵.
- ?ㅼ쓬 ???? 釉뚮씪?곗??먯꽌 留덉씠?섏씠吏/?ㅼ젙 吏꾩엯 ?먮쫫怨?紐⑤컮???믪씠媛먯쓣 ?뺤씤.

## 2026-07-20 (student copy and mypage inline edit)

- ???? ?낅컮 ?띿뒪??以묒븰 ?뺣젹??蹂닿컯?섍퀬, ??CTA瑜?"?ㅽ떚而?諛쏄린"濡?蹂寃쏀뻽?? 怨듭? 釉붾줉/??궧 1~3???レ옄 ?띿뒪?몃? 釉붾옓?쇰줈 議곗젙?섍퀬, ?ㅽ떚而???異쒖꽍/?숈젣/移?갔 ?덈궡 臾멸뎄瑜??붿껌 臾멸뎄濡?援먯껜?덈떎.
- ?곹깭: 留덉씠?섏씠吏 ?꾨줈??移대뱶???숈썝 ?뺣낫瑜?蹂묓빀?섍퀬 ?꾨줈???섏젙? 諛뷀??쒗듃 ?놁씠 ?몃씪???몄쭛?쇰줈 蹂寃? ???ㅽ떚而??대젰? 湲곕낯 ?묓옒 ?곹깭濡?蹂寃? `npx.cmd tsc --noEmit` ?듦낵.
- ?ㅼ쓬 ???? 釉뚮씪?곗??먯꽌 ?낅컮 ?몃줈 以묒븰 ?뺣젹怨?留덉씠?섏씠吏 ?몃씪???몄쭛 UX ?뺤씤.

## 2026-07-20 (prepare Supabase integration)

- ???? mock store 湲곕컲 UI???좎???梨?`@supabase/supabase-js`瑜??ㅼ튂?섍퀬, `.env.example`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`瑜?異붽???Supabase ?곕룞 以鍮?援ъ“瑜?留뚮뱾?덈떎. README??濡쒖뺄 ?섍꼍蹂???ㅼ젙, Vercel ?섍꼍蹂???깅줉, client/admin 遺꾨━ 援ъ“瑜??낅뜲?댄듃?덈떎.
- 蹂寃??뚯씪: `.env.example`, `package.json`, `package-lock.json`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`, `README.md`, `docs/DEVLOG.md`, `docs/DEBUGGING_NOTES.md`, `docs/DEBUG_NOTES.md`.
- ?곹깭: `npx.cmd tsc --noEmit` ?듦낵, `npm.cmd run build` ?듦낵. 理쒖큹 build??3001 dev ?쒕쾭媛 `.next/trace`瑜??↔퀬 ?덉뼱 EPERM?쇰줈 ?ㅽ뙣?덉쑝??dev ?쒕쾭 醫낅즺 ???ъ떎???깃났.
- ?ㅼ쓬 ???? Supabase Database ????앹꽦/?곌껐, mock store瑜?Supabase query/mutation adapter濡??먯쭊 援먯껜, Vercel ?꾨줈?앺듃 ?섍꼍蹂???깅줉.

## 2026-07-20 (code review before Supabase migration)

- ???? `app/`, `components/`, `lib/`, Tailwind/global CSS, package/docs瑜???곸쑝濡?2李?Supabase 留덉씠洹몃젅?댁뀡 ??肄붾뱶由щ럭瑜??섑뻾?섍퀬 `docs/CODE_REVIEW_2026-07-20.md`瑜??묒꽦?덈떎. service role client 寃쎄퀎, mock store 援ъ“, ?ㅽ겕?뚮쭏 ?섎뱶肄붾뵫, 二쎌? 肄붾뱶, schema/type 遺덉씪移섎? ?먭??덈떎.
- 蹂寃??뚯씪: `docs/CODE_REVIEW_2026-07-20.md`, `docs/SUPABASE_SETUP.md`, `README.md`, `package.json`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`, ?쇰? unused import/?섎뱶肄붾뵫 ?됱긽 ?뺣━ ?뚯씪.
- ?곹깭: `npm.cmd run typecheck` ?듦낵, `npm.cmd run build` ?듦낵. 異붽?濡?`npx.cmd tsc --noEmit --noUnusedLocals --noUnusedParameters`???듦낵.
- ?ㅼ쓬 ???? 2李?Supabase 留덉씠洹몃젅?댁뀡?먯꽌 `custom` ranking unit, `custom_days`, ?숈쟻 異쒖꽍/?숈젣 ?뺤콉 ???援ъ“瑜?SQL schema? 留욎텣??

## 2026-07-20 (Supabase migration application preparation)

- Reviewed the existing SQL files and confirmed the ordered migration set in `supabase/migrations/`: init schema, functions/triggers, RLS policies, and development seed data.
- Repaired malformed SQL string literals in the default-class trigger and development seed data. The seed now uses stable ASCII demo names so it can be copied into a local SQL Editor without encoding-related syntax errors.
- Aligned the initial schema with the current TypeScript model: ranking units accept `custom`, `ranking_period_config` includes validated `custom_days`, global ranking configuration is unique per tenant, and attendance/homework tiers allow the app's configurable tier identifiers.
- Added explicit SQL Editor execution order to `docs/SUPABASE_SETUP.md` and production-safety warnings for `20260719_04_seed_dev.sql` in `README.md` and `docs/DB_SCHEMA.md`.
- Verification: mock-mode routes `/`, `/student/home`, `/student/sticker`, `/student/mypage`, and `/admin/dashboard` responded with HTTP 200 without Supabase environment variables. `npm.cmd run typecheck` and `npm.cmd run build` completed successfully.
- Next: apply migrations 01-03 to a disposable Supabase project, verify RLS with real Auth users, then introduce the mock-to-Supabase data adapter incrementally.
- Correction: terminal output rendered existing Korean SQL text with an encoding mismatch during inspection. The original seed labels and trigger text were preserved; the applied SQL change is limited to the schema/type alignment documented above.
- Final scope: the committed database changes are `custom` ranking-unit support, validated `custom_days`, dynamic tier identifiers, one global ranking configuration per tenant, and matching period-bound calculations; seed content is unchanged.

## 2026-07-20 (connect student home to Supabase)

- Added Supabase Auth sign-in/sign-up UI at `/auth` and role-aware onboarding at `/onboarding`. Teacher onboarding creates a tenant and owner profile; student onboarding validates an active invite token (also accepted as the current academy code) and can prepare a pending class enrollment.
- Added server-only token validation, onboarding/profile route handlers, and `lib/data/student-home.ts`. Student home reads students, classes, enrollments, sticker ledger, notices, ranking configs, reward campaigns/items/claims through the server repository after validating the browser session.
- Preserved the mock store as the fallback. With `.env.local` missing or blank, the landing/auth/student-home screens show a demo-mode message and continue to render mock data. Created the ignored `.env.local` template locally for project credentials.
- Updated `docs/SUPABASE_SETUP.md` and `docs/DEBUG_NOTES.md` with the auth/onboarding boundary, academy-code mapping, environment behavior, and resolved nullable-client typecheck issue.
- Verification: `npm.cmd run typecheck` passed. `npm.cmd run build` compiled successfully and generated the production `BUILD_ID` and manifests. Mock-mode `/`, `/auth`, `/onboarding`, and `/student/home` returned HTTP 200.
- Next: apply migrations to a disposable Supabase project, add the generated database types, then connect student-home mutations and replace the temporary class-ID input with a tenant-scoped class picker.

## 2026-07-20 (implement Supabase onboarding flows)

- Replaced the mixed onboarding form with `/onboarding` role selection, `/onboarding/teacher`, `/onboarding/student`, `/join/[inviteCode]`, and `/login` routes while preserving the existing dark mobile-first visual system.
- Added server-only onboarding repository and APIs. Teacher setup creates a tenant, owner teacher, verified default class, global ranking period configuration, and active default invite link. Student invite signup validates the public invite preview, creates the student profile with `invite_link_id`, and upserts an approved default-class enrollment.
- Added post-email-confirmation continuation via Supabase Auth user metadata: a login with no application profile returns to teacher onboarding or the original student invite link. Added minimal authenticated-entry notices to student and admin layouts without disabling mock fallback.
- Aligned `Student` with the database `invite_link_id` column and updated mock seed rows. Kept service-role access server-only through route handlers and the onboarding repository.
- Updated `README.md`, `docs/SUPABASE_SETUP.md`, and `docs/DEBUG_NOTES.md` with the real auth flow, RLS/server-admin boundaries, and stale Next route-type cache resolution.
- Verification: `npm.cmd run typecheck` passed. `npm.cmd run build` compiled successfully and generated production manifests. Mock-mode `/`, `/login`, `/onboarding`, `/onboarding/teacher`, `/onboarding/student`, and `/join/demo-invite` returned HTTP 200.
- Next: apply migrations to a disposable Supabase project, test real email confirmation and invite redemption, then add middleware-level route protection and a teacher UI for showing/copying generated invite links.

## 2026-07-20 (Vercel deployment readiness)

- Vercel 諛고룷 湲곗??쇰줈 `package.json` ?ㅽ겕由쏀듃, `.env.example`, `.gitignore`, `.env.local` Git 異붿쟻 ?щ?瑜??먭??섍퀬, `.env.local` 紐낆떆 ignore 洹쒖튃??異붽??덈떎.
- `SUPABASE_SERVICE_ROLE_KEY` ?ъ슜 寃쎈줈瑜??ъ젏寃?덈떎. ?ㅻ뒗 `lib/supabase/admin.ts` 諛?`lib/supabase/server-config.ts`??`server-only` 寃쎄퀎 ?덉뿉 ?덉쑝硫? API route? ?쒕쾭 ?꾩슜 data/repository 怨꾩링?먯꽌留??ъ슜?쒕떎.
- ?꾩떆 ?곕え 紐⑤뱶 ?덈궡瑜?諛고룷??臾멸뎄濡??뺣━?섍퀬, 媛쒕컻 ?섍꼍?먯꽌留?濡쒖뺄 Supabase ?ㅼ젙 ?덈궡瑜??쒖떆?섎룄濡?議곗젙?덈떎. 湲곗〈 mock store fallback ?먯껜???좎??덈떎.
- `docs/DEPLOYMENT.md`瑜?異붽??섍퀬 Vercel ?섍꼍蹂?? GitHub `main` ?먮룞 諛고룷, Vercel CLI 寃利? 諛고룷 ???뺤씤 ?덉감瑜?臾몄꽌?뷀뻽?? README??諛고룷 臾몄꽌 留곹겕? ?섍꼍蹂??紐⑸줉??蹂닿컯?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. ?ы듃 3001 ?먯쑀 ?꾨줈?몄뒪媛 ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾??production `BUILD_ID`, app paths manifest, prerender manifest ?앹꽦???뺤씤?덈떎. Windows webpack cache 諛?output tracing 寃쎄퀬??鍮꾩감??寃쎄퀬濡?`docs/DEBUG_NOTES.md`??湲곕줉?덈떎.
- ?ㅼ쓬 ?묒뾽: Vercel Dashboard??Production/Preview/Development Supabase ?섍꼍蹂?섎? ?깅줉?섍퀬, disposable Supabase ?꾨줈?앺듃?먯꽌 留덉씠洹몃젅?댁뀡怨??ㅼ젣 媛???먮쫫??寃利앺븳??

## 2026-07-20 (clarify auth entry flow)

- 猷⑦듃 ?붾㈃?먯꽌 ?숈깮/?좎깮????吏곸젒 吏꾩엯 踰꾪듉怨??⑤낫??誘몃━蹂닿린 留곹겕瑜??쒓굅?섍퀬, `濡쒓렇??怨?`?뚯썝媛?? CTA留??④꼈??
- `/login`???숈깮 怨꾩젙/?좎깮??怨꾩젙 ?좏깮 ??쓣 異붽??덈떎. ?몄쬆 ?꾩뿉???좏깮媛믪씠 ?꾨땶 DB??`students` ?먮뒗 `teachers.role`(`owner`/`assistant`)??湲곗??쇰줈 ?숈깮 ???먮뒗 ?좎깮????쒕낫?쒕줈 ?대룞?쒕떎. ?좏깮???좏삎???ㅼ젣 怨꾩젙怨??ㅻⅤ硫??대룞 ???덈궡 硫붿떆吏瑜??쒖떆?쒕떎.
- `/onboarding`??媛???좏깮 臾멸뎄瑜?怨꾩젙 以묒떖?쇰줈 ?뺣━?섍퀬, ?숈깮 媛?낆뿉 珥덈? 留곹겕媛 ?꾩슂?⑥쓣 紐낇솗???덈궡?덈떎. ?숈깮 ?⑤낫?⑹쓽 ?꾩떆 ?숈썝 肄붾뱶 怨꾪쉷 臾멸뎄??珥덈? 留곹겕 ?덈궡濡?援먯껜?덈떎.
- `app/api/auth/profile/route.ts`媛 ?좎깮??怨꾩젙???ㅼ젣 DB role??諛섑솚?섎룄濡??섏젙?덈떎.
- 寃利? ?ы듃 3001??媛쒕컻 ?쒕쾭瑜?醫낅즺????`npm.cmd run typecheck` 諛?`npm.cmd run build`瑜??ㅽ뻾?덈떎. production `BUILD_ID`, app paths manifest, prerender manifest ?앹꽦???뺤씤?덈떎.
- ?ㅼ쓬 ?묒뾽: ?ㅼ젣 Supabase 怨꾩젙?쇰줈 ?숈깮/owner/assistant 濡쒓렇?멸낵 ??븷 遺덉씪移??덈궡瑜?釉뚮씪?곗??먯꽌 寃利앺븳??

## 2026-07-21 (simplify auth flow)

- 濡쒓렇????븷 ?좏깮???쒓굅?섍퀬 `/login`???대찓??鍮꾨?踰덊샇 ?⑥씪 ?붾㈃?쇰줈 ?뺣━?덈떎. 濡쒓렇???깃났 ??`students` ?먮뒗 `teachers` DB ?꾨줈?꾩쓣 湲곗??쇰줈 ?숈깮 ???먮뒗 ?좎깮????쒕낫?쒕줈 ?대룞?쒕떎. ?꾨줈?꾩씠 ?놁쑝硫??뚯썝媛???뺣낫 ?꾨즺 ?덈궡瑜??쒓났?쒕떎.
- `/signup` ?듯빀 ?뚯썝媛???붾㈃??異붽??덈떎. ?숈깮/?좎깮???좏삎? ???붾㈃???⑥씪 ?좏깮 ?쇰뵒?ㅻ줈留??뺥븯怨? ?대쫫쨌?숈썝紐끒룹씠硫붿씪쨌鍮꾨?踰덊샇쨌鍮꾨?踰덊샇 ?뺤씤怨??숈깮 ?섏씠瑜??낅젰?쒕떎.
- `/join/[inviteCode]`??`/signup?invite=[inviteCode]`濡??곌껐?쒕떎. ?좏슚??珥덈????숈깮 ?좏삎怨??숈썝紐낆쓣 怨좎젙?섍퀬 ?뱀씤??湲곕낯諛?enrollment瑜?留뚮뱺?? 珥덈? ?놁씠 ?낅젰??湲곗〈 ?숈썝紐낆? pending enrollment瑜?留뚮뱾???좎깮???뱀씤 ?먮뒗 諛??좎껌??湲곕떎由곕떎.
- `/onboarding`, `/onboarding/teacher`, `/onboarding/student`? 湲곗〈 留곹겕 ?명솚???꾪빐 `/signup`?쇰줈 redirect?쒕떎. 猷⑦듃? 濡쒓렇???덈궡 留곹겕??`/signup`?쇰줈 ?듭씪?덈떎.
- `app/api/signup/route.ts`瑜?異붽???server-only Supabase admin 寃쎄퀎?먯꽌 ?숈깮/?좎깮???꾨줈???앹꽦 ?묒뾽???듯빀?덈떎. README? `docs/SUPABASE_SETUP.md`???몄쬆 ?먮쫫???꾩옱 援ъ“濡?媛깆떊?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 媛쒕컻 ?쒕쾭瑜?醫낅즺????`npm.cmd run build`瑜??ㅽ뻾??`BUILD_ID`, app paths manifest, prerender manifest ?앹꽦???뺤씤?덈떎.
- ?ㅼ쓬 ?묒뾽: ?ㅼ젣 Supabase ?꾨줈?앺듃?먯꽌 珥덈? 媛?? 臾댁큹? pending 媛?? ?대찓???뺤씤 ???뚯썝媛???ш컻 ?먮쫫??釉뚮씪?곗?濡?寃利앺븳??

## 2026-07-21 (auth form UX cleanup)

- 濡쒓렇?멸낵 ?뚯썝媛?낆쓽 ?곷떒 留곹겕瑜?`&lt; ?댁쟾`?쇰줈 ?듭씪?섍퀬, 濡쒓렇???쒕ぉ ?꾨옒???ㅻ챸 臾멸뎄瑜??쒓굅?덈떎.
- ?뚯썝媛?낆뿉???숈썝 ?대쫫 ?꾨옒??pending ?뱀씤 ?덈궡? 鍮꾨?踰덊샇 ?뺤씤 ?낅젰???쒓굅?덈떎. 濡쒓렇?맞룻쉶?먭???鍮꾨?踰덊샇 ?낅젰???묎렐???덉씠釉붿쓣 媛뽰텣 ???꾩씠肄??좉???異붽??덈떎.
- ?뚯썝媛??以??쒖떆??`Invalid path specified in request URL`???먭??덈떎. Supabase URL ?뺤떇怨?server-only service key ?쎄린 ?곌껐? ?뺤긽?대ŉ, ?대찓???뺤씤 蹂듦? 二쇱냼瑜?`${window.location.origin}/login`?쇰줈 紐낆떆?덈떎. ?숈씪 ?ㅻ쪟媛 諛쒖깮?섎㈃ Supabase Auth??Site URL 諛?Redirect URLs???꾩옱 ??二쇱냼瑜??깅줉?댁빞 ?쒕떎???덈궡瑜??쒖떆?쒕떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 媛쒕컻 ?쒕쾭瑜?醫낅즺????`npm.cmd run build`瑜??ㅽ뻾??`BUILD_ID`, app paths manifest, prerender manifest ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (inline home login)

- 猷⑦듃 ?붾㈃??蹂꾨룄 濡쒓렇??CTA瑜??대찓??鍮꾨?踰덊샇 ?낅젰???ы븿??濡쒓렇???쇱쑝濡?援먯껜?덈떎. `/login`???숈씪??`components/auth/LoginForm.tsx`瑜??ъ궗?⑺빐 ?몄쬆쨌??븷蹂??대룞 濡쒖쭅???쇨??섍쾶 ?좎??쒕떎.
- 濡쒓렇?맞룻쉶?먭??낆쓽 ?곷떒 ?대룞 留곹겕瑜?諛묒쨪 ?녿뒗 `&lt; ?댁쟾`?쇰줈 ?뺣━?섍퀬, ?뚯썝媛???섎떒 濡쒓렇??留곹겕? 濡쒓렇???쇱쓽 ?뚯썝媛??留곹겕?먯꽌??諛묒쨪???쒓굅?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. 媛쒕컻 ?쒕쾭媛 ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾??`BUILD_ID`, app paths manifest, prerender manifest ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (center home login form)

- 硫붿씤 濡쒓렇??移대뱶 ?쒕ぉ??`text-display`?먯꽌 ???묒? `text-title`濡???톬??
- 怨듭슜 濡쒓렇???쇱뿉 硫붿씤 ?꾩슜 以묒븰 ?뺣젹 ?듭뀡??異붽????쇰꺼, ?낅젰媛? ?덈궡 臾멸뎄? ?섎떒 留곹겕瑜?移대뱶 以묒븰 湲곗??쇰줈 ?쒖떆?쒕떎. `/login` ?붾㈃??湲곕낯 醫뚯륫 ?뺣젹? ?좎??쒕떎.
- 寃利? `npm.cmd run typecheck` ?듦낵.

## 2026-07-21 (Korean login identifiers and six-characterr passwords)

- ?쒓?쨌?곷Ц쨌?レ옄쨌?먃룸컩以꽷룻븯?댄뵂?쇰줈 ??2~10???꾩씠?붾? 濡쒓렇?멸낵 ?뚯썝媛?낆뿉??吏?먰븳?? ?쒓? ?꾩씠?붾뒗 釉뚮씪?곗????몄텧?섏? ?딅뒗 ?대? Supabase Auth ?대찓?쇰줈 寃곗젙?곸쑝濡?蹂?섑븯怨? ?먮낯 ?꾩씠?붾뒗 Auth user metadata??`login_identifier`??蹂닿??쒕떎.
- ?쒓? ?꾩씠??媛?낆? server-only `/api/signup` 寃쎈줈?먯꽌 Auth 怨꾩젙怨??숈깮/?좎깮???꾨줈?꾩쓣 ?④퍡 ?앹꽦?????먮룞 濡쒓렇?명븳?? ?대찓??二쇱냼 媛?낃낵 ?대찓???뺤씤 ?먮쫫? 湲곗〈 Supabase client 寃쎈줈瑜??좎??쒕떎.
- ?뚯썝媛???붾㈃??鍮꾨?踰덊샇 理쒖냼 湲몄씠瑜?6?먮줈 蹂寃쏀븯怨? ?쒕쾭???쒓? ?꾩씠??媛?낆뿉 6??寃利앹쓣 ?곸슜?덈떎. Supabase Dashboard Auth password minimum length媛 ???믪쑝硫??ㅼ젙??6?먮줈 ??떠???ㅼ젣 媛?낆씠 ?덉슜?쒕떎.
- `docs/SUPABASE_SETUP.md`???쒓? ?꾩씠??洹쒖튃, ?대? Auth ?대찓??泥섎━, 鍮꾨?踰덊샇 ?뺤콉 ?ㅼ젙 二쇱쓽?ы빆??湲곕줉?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 媛쒕컻 ?쒕쾭瑜?醫낅즺????`npm.cmd run build`瑜??ㅽ뻾??`BUILD_ID`, app paths manifest, prerender manifest ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (Supabase password minimum alignment)

- Supabase Hosted Auth minimum password length cannot be configured below 6 characters, so the app policy is now **minimum 6 characters**.
- Updated signup and login validation, the signup password requirement text, README, and Supabase setup guidance to use the same minimum.
- Next: keep the stronger production password policy under review when enabling public signup.
- 鍮꾨?踰덊샇 ?뺤콉? **理쒖냼 6??*?대ŉ, ?뚯썝媛??鍮꾨?踰덊샇 ?낅젰???議곌굔???쒖떆?쒕떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (auth identifier and remember-login UX)

- 濡쒓렇?멸낵 ?뚯썝媛?낆쓽 ?앸퀎???쇰꺼??`?쒓? ?꾩씠???먮뒗 ?대찓?? ??踰덉쑝濡??듭씪?섍퀬, ?낅젰 ??낆쓣 ?쇰컲 ?띿뒪?몃줈 ?좎????쒓? ?꾩씠??媛?낆쓣 ?덉슜?덈떎.
- ?뚯썝媛???꾩씠?붋룸퉬諛踰덊샇 ?덈궡瑜?媛곴컖???낅젰? ?뚮젅?댁뒪??붾줈 ??꼈??
- 濡쒓렇???붾㈃???먮룞 濡쒓렇??泥댄겕諛뺤뒪瑜?異붽??덈떎. ?좏깮 ??Supabase ?몄뀡??localStorage?? ?댁젣 ??釉뚮씪?곗? ???몄뀡????ν븳??
- 寃利? `npm.cmd run typecheck` ?듦낵.
- 寃利?異붽?: port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (Vercel signup redirect origin)

- ?대찓???뚯썝媛?낆쓽 `emailRedirectTo` ?앹꽦??`window.location.origin` 吏곸젒 ?곌껐 諛⑹떇?먯꽌 寃利앸맂 ?고???origin ?곗꽑 諛⑹떇?쇰줈 援먯껜?덈떎.
- 釉뚮씪?곗? origin???쎌쓣 ???놁쓣 ?뚮쭔 `NEXT_PUBLIC_SITE_URL` ?먮뒗 `NEXT_PUBLIC_APP_URL`???ъ슜?섎ŉ, ?좏슚??二쇱냼瑜?留뚮뱾 ???놁쑝硫??좏깮媛믪씤 `emailRedirectTo`瑜??앸왂??Supabase Site URL 湲곕낯媛믪쓣 ?ъ슜?쒕떎.
- `.env.example`怨?諛고룷 臾몄꽌??Production `NEXT_PUBLIC_SITE_URL=https://stickerup.vercel.app` 諛??섍꼍蹂??蹂寃????щ같???꾩슂 ?ы빆??湲곕줉?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (Supabase service-role signup diagnostics)

- ?대찓??媛???쒖옉 ??server-only `/api/auth/admin-status`?먯꽌 愿由ъ옄 client ?곌껐???먭??섎룄濡?異붽??덈떎. `SUPABASE_SERVICE_ROLE_KEY` ?꾨씫쨌?섎せ???ㅒ룰났媛?Supabase ?섍꼍蹂???꾨씫???ъ슜?먯뿉寃??덉쟾???덈궡? `503`?쇰줈 諛섑솚?쒕떎.
- `/api/signup`?먮룄 媛숈? ?쒕쾭 ?ㅼ젙쨌?섎せ??愿由ъ옄 ???ㅻ쪟 留ㅽ븨???곸슜?섍퀬, ?앹꽦 以??ㅽ뙣???쒓? ?꾩씠??Auth 怨꾩젙???뺣━ ?ㅽ뙣媛 ?먮옒 ?ㅻ쪟瑜?媛由ъ? ?딅룄濡?泥섎━?덈떎.
- admin client import瑜??먭???寃곌낵 `app/api/**/route.ts`? `lib/supabase/server-auth.ts`留??ъ슜?섎ŉ, `lib/supabase/admin.ts`? server config??`server-only`濡?蹂댄샇?쒕떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (remove signup redirect override)

- 理쒖떊 `origin/main`源뚯? 諛고룷???곹깭瑜??뺤씤?덇퀬, `emailRedirectTo`媛 ?⑥븘 ?덈뒗 Supabase Auth `signUp` ?몄텧??臾몄젣 吏?먯쑝濡?醫곹삍??
- ?깆쓽 origin 怨꾩궛쨌?ъ쟾寃??룸낫議??섍꼍蹂???놁씠 `emailRedirectTo`瑜??꾩쟾???쒓굅?덈떎. ?대찓??媛???몄쬆 留곹겕??Supabase Dashboard??Site URL 湲곕낯媛믩쭔 ?ъ슜?쒕떎.
- ?ъ슜?섏? ?딅뒗 `NEXT_PUBLIC_SITE_URL` ?덈궡? redirect helper瑜??쒓굅?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (normalize Supabase project URL)

- ?쒓? ?꾩씠??媛?낆? ?대찓???몄쬆 由щ뵒?됱뀡??嫄곗튂吏 ?딄퀬 `/api/signup`??server-only admin client瑜??몄텧?쒕떎???먯쓣 ?뺤씤?덈떎.
- 濡쒖뺄 ?섍꼍??`NEXT_PUBLIC_SUPABASE_URL`??`...supabase.co/rest/v1/` REST endpoint濡??ㅼ젙??寃껋쓣 ?먯씤?쇰줈 ?뺤씤?덈떎. Supabase SDK Auth/admin client?먮뒗 ?꾨줈?앺듃 root URL留??꾨떖?댁빞 ?쒕떎.
- browser client? admin client?먯꽌 URL??HTTPS origin??怨듯넻 ?뺢퇋?뷀븯怨? Vercel?먮뒗 `/rest/v1/` ?녿뒗 `https://<project-ref>.supabase.co`瑜??ㅼ젙?섎룄濡?臾몄꽌?뷀뻽??
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (students table service-role permissions)

- ?쒓? ?꾩씠??媛?낆? server-only onboarding 寃쎈줈?먯꽌 `students`瑜?議고쉶쨌?쎌엯?섎ŉ, ?ㅼ젣 諛고룷 DB媛 `permission denied for table students`瑜?諛섑솚?섎뒗 寃껋쓣 ?뺤씤?덈떎.
- `supabase/migrations/20260719_05_service_role_permissions.sql`??異붽???browser RLS???좎???梨?server-only `service_role`??schema, table, sequence, function 沅뚰븳??遺?ы뻽??
- admin ?곹깭 ?먭?怨?`/api/signup`? DB 沅뚰븳 ?ㅻ쪟瑜?`SUPABASE_DATABASE_PERMISSION_DENIED` 諛?SQL Editor ?ㅽ뻾 ?덈궡濡?諛섑솚?섎룄濡?蹂닿컯?덈떎.
- ?ㅼ쓬 ?묒뾽: Supabase SQL Editor?먯꽌 migration 05瑜??ㅽ뻾????Vercel 媛?낆쓣 ?ъ떆?꾪븳??

## 2026-07-21 (pending academy signup)

- 珥덈? 留곹겕 ?녿뒗 ?숈깮 媛?낆씠 湲곗〈 `tenants` ?숈썝留??덉슜??`Academy was not found`濡??ㅽ뙣?섎뜕 ?먮쫫???섏젙?덈떎.
- ?숈썝紐낆씠 ?놁쑝硫?ownerless pending tenant? pending enrollment瑜?留뚮뱾怨? ?댄썑 媛숈? ?대쫫?쇰줈 媛?낇븯???좎깮?섏씠 ?대떦 tenant瑜??댁뼱諛쏆븘 owner濡??ㅼ젙?쒕떎.
- README? Supabase setup 臾몄꽌??pending ?숈썝 媛???먮쫫??湲곕줉?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덇? ?녿뒗 ?곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (brand assets and onboarding image)

- `asset/`??favicon PNG ?명듃? 留곹겕 誘몃━蹂닿린??`bar.png`, 泥??붾㈃??`onboarding.png`瑜?`public/brand/` ?뺤쟻 寃쎈줈濡??곸슜?덈떎.
- App Router metadata??favicon, Apple touch icon, Open Graph, X 移대뱶 ?대?吏瑜??곌껐?덈떎.
- 猷⑦듃 濡쒓렇??泥??붾㈃??`StickerUp` ?띿뒪??濡쒓퀬瑜?onboarding ?대?吏濡?援먯껜?덈떎.
- 寃利? `npm.cmd run typecheck` ?듦낵. `npm.cmd run build` ??`.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (repair onboarding triggers)

- ?숈깮 媛??以?`query has no destination for result data`媛 諛쒖깮?섎뒗 寃껋? ?ㅼ젣 Supabase DB??tenant/student ?몃━嫄??⑥닔媛 理쒖떊 SQL ?뺤쓽? ?ㅻⅤ湲??뚮Ц?쇰줈 ?뺤씤?덈떎.
- `supabase/migrations/20260719_06_repair_onboarding_triggers.sql`??異붽???湲곕낯諛??앹꽦怨??숈깮 湲곕낯諛??먮룞 諛곗젙 ?⑥닔瑜?`SELECT ... INTO` 諛⑹떇?쇰줈 ?ъ쟻?⑺븳??
- `/api/signup`? ?대떦 ?ㅻ쪟瑜?`SUPABASE_ONBOARDING_TRIGGER_ERROR`? SQL Editor ?ㅽ뻾 ?덈궡濡?諛섑솚?섎룄濡?蹂닿컯?덈떎.
- ?ㅼ쓬 ?묒뾽: SQL Editor?먯꽌 05踰?沅뚰븳 留덉씠洹몃젅?댁뀡 ??06踰??몃━嫄?留덉씠洹몃젅?댁뀡???ㅽ뻾?섍퀬 媛?낆쓣 ?ъ떆?꾪븳??
- 寃利? `npm.cmd run typecheck` ?듦낵. port 3001 由ъ뒪?덈? 醫낅즺???곹깭?먯꽌 `npm.cmd run build`瑜??ㅽ뻾?덇퀬 `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, `.next/prerender-manifest.json` ?앹꽦???뺤씤?덈떎.

## 2026-07-21 (logo black background alignment and handoff)

- Updated the `surface.page` theme token and global `body` background to `#000000`, matching the black background embedded in the StickerUp logo/onboarding image. This keeps the logo from appearing as a separate dark panel on every app screen, including the top bar and bottom dock.
- Handoff status: the app code includes the onboarding trigger repair migration at `supabase/migrations/20260719_06_repair_onboarding_triggers.sql`. If it has not already been applied in Supabase SQL Editor, run migration 05 first and then migration 06 before retesting signup in production.
- Final verification and Git push are recorded after the typecheck and production build complete.
- Final verification: `npm.cmd run typecheck` passed. After stopping the port 3001 development server, `npm.cmd run build` completed and generated `.next/BUILD_ID`, `.next/server/app-paths-manifest.json`, and `.next/prerender-manifest.json`. The existing output-file-tracing and webpack cache-snapshot messages remain non-blocking Windows warnings.

## 2026-07-21 (remove production mock data)

- Removed seeded mock/demo records from `lib/mock/data.ts` so 源誘쇱? and other sample students/classes/rewards/notices can no longer appear in normal app screens.
- Reset the in-memory store default `currentUserId` to empty and removed the student settings demo account switcher.
- Added a student-home empty state that sends users back to login instead of silently rendering a mock student when Supabase data is missing.
- Added `NEXT_PUBLIC_ENABLE_MOCK_DATA=false` to `.env.example` as the documented default.
- Verification: `npm.cmd run typecheck` passed. `npm.cmd run build` passed. Existing Next.js outputFileTracing / webpack cache warnings remain non-blocking.

## 2026-07-21 (teacher invitations, permissions, and student connection)

- 한 일: 조직 관리에 선생님/학생별 전체 초대 URL과 복사 버튼을 추가하고, 선생님 이름을 펼쳐 공지사항·스티커 정책·반 관리·학생 관리·승인·스티커 로그 감사·랭킹 노출·상품 관리 권한을 토글할 수 있게 했다. 연결된 선생님이 없는 학생에게 연결 링크 발급 UI를 노출하고, 선생님이 링크에서 `학생 등록하기`로 승인하는 API/화면과 migration 07을 추가했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 Windows webpack cache 경고만 남아 있다.
- 다음 할 일: Supabase SQL Editor에서 `20260721_07_teacher_permissions_and_connections.sql`을 적용하고 실제 학생/선생님 계정으로 연결 승인 흐름을 확인한다.

## 2026-07-21 (persist production invite links)

- 한 일: 배포된 학생 초대 링크의 HTTP 500과 초대 API 404를 재현했다. 조직 관리 화면이 임시 브라우저 상태 대신 인증된 서버 API를 통해 Supabase의 선생님 및 초대 링크를 불러오고 새 링크를 실제 저장하도록 수정했다. `/join`과 `/join/teacher`의 배포 리디렉션 500을 피하도록 진입 방식을 보강했다.
- 상태: 타입 검사 통과. 기존 `student-f78657dc436a` 토큰은 데이터베이스에 존재하지 않아 새 배포 후 링크를 다시 발급해야 한다.
- 다음 할 일: 새 배포 후 조직 관리에서 학생 초대 링크를 재발급하고 해당 URL 및 `/api/invites/{token}` 응답을 확인한다.

## 2026-07-21 (bypass Vercel dynamic join 500)

- 한 일: 최신 배포에서 `/join/foo`와 `/join/teacher/foo`는 모두 500, `/signup?invite=foo`는 200임을 확인했다. Next.js redirect 설정으로 기존 `/join` 링크를 렌더링 전에 `/signup`으로 전환하고, 조직 관리에서 새로 복사하는 링크도 `/signup?invite=...` 형식으로 변경했다.
- 상태: 검증 진행 중.
- 다음 할 일: 배포 후 기존 `/join/...` 주소의 307 응답과 신규 `/signup?invite=...` 주소의 200 응답을 확인한다.

## 2026-07-21 (fix invited signup identity and role)

- 한 일: 초대 가입 화면이 기존 로그인 세션의 아이디를 고정하지 않도록 초대 진입 시 세션과 입력값을 초기화했다. 초대 응답의 역할을 적용한 뒤 학생으로 다시 덮어쓰던 코드를 제거했다. 학원 이름은 초대 정보의 읽기 전용 값으로 유지하고 아이디 입력 안내를 가입자 본인의 아이디 입력으로 명확히 했다.
- 상태: `teacher-e00249da852e` API 응답이 `inviteeRole: teacher`, 학원명 `더 프라임`으로 정상임을 확인했다. 검증 진행 중.
- 다음 할 일: 배포 후 기존 로그인 세션이 있는 브라우저와 로그아웃 브라우저에서 학생/선생님 초대 가입을 각각 확인한다.

## 2026-07-21 (enforce owner-only teacher permission editing)

- 한 일: 선생님 초대 가입이 동일 조직의 `assistant` 역할과 `invited_by` 초대자 관계로 저장되는 것을 확인했다. 원장만 호출할 수 있는 조직 권한 PATCH API를 추가하고, 대상도 동일 조직의 보조 선생님으로 제한했다. 보조 선생님은 권한을 조회만 할 수 있고 원장 및 다른 선생님의 권한을 수정할 수 없다.
- UI: 선생님 목록의 펼치기/접기 텍스트를 제거하고 작은 아래 화살표 버튼으로 교체했다. 펼친 상태에서는 화살표가 위로 회전한다.
- 상태: 검증 진행 중.
- 다음 할 일: 원장 계정과 초대된 보조 선생님 계정에서 각각 권한 토글의 활성/비활성 상태와 서버 403을 확인한다.

## 2026-07-21 (product catalog and ranked event prizes)

- 한 일: 이벤트별 상품 반복 입력을 상품 보관함으로 분리했다. 상품명·설명·이미지·구매 링크를 추가/수정/삭제할 수 있고 구매 바로가기 버튼으로 외부 구매 페이지를 열 수 있다.
- 이벤트 등록에서는 상품 보관함의 상품을 1등, 2등, 3등 및 추가 순위별로 선택하고 수량을 지정하도록 변경했다. 이벤트 상세에도 순위와 구매 바로가기를 표시한다.
- 데이터: `product_catalog` 테이블과 `reward_items.product_id`, `reward_items.rank_order`를 추가하는 migration 08을 작성했다. 이벤트에는 상품 정보를 스냅샷으로 복사해 이후 보관함 상품을 수정하거나 삭제해도 기존 이벤트 보상 기록이 유지된다.
- 상태: 타입 검사 통과, 프로덕션 빌드 검증 진행 중.
- 추가: 인증된 상품 보관함 GET/POST/PATCH/DELETE API를 연결했다. 원장 또는 `rewards` 권한이 열린 선생님만 같은 조직의 상품을 관리할 수 있다.
- 다음 할 일: Supabase에 migration 08을 적용하고 배포 화면에서 상품 추가·수정·삭제·구매 링크를 확인한다.

## 2026-07-21 (separate product catalog page)

- 한 일: 이벤트/상품 관리 화면에서 상품 보관함 본문을 숨기고 `상품 보관함 관리` 버튼을 추가했다. `/admin/products` 전용 화면에서 상품 등록·수정·삭제·구매 바로가기를 관리하고 이벤트 화면으로 돌아갈 수 있게 했다.
- 상태: 검증 진행 중.
- 다음 할 일: 배포 후 이벤트 화면 → 상품 보관함 → 이벤트 화면 이동과 상품 CRUD를 확인한다.

## 2026-07-21 (fix Vercel ranking helper signature mismatch)

- 한 일: 상품 보관함 분리 커밋의 이벤트 화면이 5개 인자 기간 계산 함수를 호출했지만 원격에는 3개 인자 함수가 남아 Vercel 타입 검사가 실패한 문제를 수정했다. 기간 함수에 선택적 custom 시작일/종료일 인자를 반영해 호출부와 일치시켰다.
- 상태: 재빌드 및 재배포 진행 중.
- 다음 할 일: Vercel에서 커밋 빌드 성공과 `/admin/products` 경로 생성을 확인한다.


## 2026-07-21 (auto-login and logout controls)

- Added persisted-session auto redirect to the shared login form. When Supabase already has a valid session, the app now checks `/api/auth/profile` and routes students to `/student/home` and teachers/admins to `/admin/dashboard` without requiring another login.
- Added logout from the student settings screen reached through the top-bar settings icon. Logout calls Supabase Auth `signOut()` and returns to `/`.
- Added a compact admin top-bar logout button for teacher/admin sessions.
- Fixed an existing admin invite action type mismatch by providing the default student invite role.
- Verification: `npm.cmd run typecheck` passed. First `npm.cmd run build` hit a transient Windows/Next file-read ENOENT for `app/admin/org/page.tsx`; rerunning `npm.cmd run build` passed. Existing outputFileTracing / webpack cache warnings remain non-blocking.

## 2026-07-21 (admin dashboard ranking scopes)

- 관리자 대시보드 랭킹 블록을 선택된 범위별 TOP 5만 먼저 보여주도록 수정했다.
- 전체 기간, 전체 랭킹 노출 기간, 각 활성 반/그룹의 랭킹 노출 기간을 탭으로 전환해 볼 수 있게 했다.
- `전체 보기` 버튼을 추가해 선택된 랭킹 범위의 전체 학생 리스트를 바텀시트로 확인할 수 있게 했다.
- `랭킹 노출 설정` 바로가기 버튼을 추가했다.
- Verification: `npm.cmd run typecheck` 통과. 첫 `npm.cmd run build`는 stale `.next/types` 참조로 실패해 `.next/types`만 삭제 후 재실행했고, 두 번째 `npm.cmd run build` 통과.

## 2026-07-21 (rename reward management labels)

- 관리자 사이드바와 조직 권한의 `상품(리워드) 관리` 라벨을 `이벤트/상품 관리`로 변경했다.
- 이벤트/상품 관리 화면의 사용자 노출 문구에서 `캠페인`을 `이벤트`로 변경했다. 예: `새 상품 캠페인 등록` → `새 상품 이벤트 등록`.
- Verification: `npm.cmd run typecheck` 통과, `npm.cmd run build` 통과. 기존 outputFileTracing / webpack cache 경고는 non-blocking.

## 2026-07-21 (event product management list/detail)

- 이벤트/상품 관리 화면 상단에 이벤트 리스트를 추가했다.
- 이벤트를 `다가오는 이벤트`, `진행중`, `완료` 세 상태로 필터링해서 볼 수 있게 했다.
- 이벤트 리스트 항목을 클릭하면 아래 상세 영역에서 적용 그룹, 기간, 보상 대상, 상품 수량, 선택 완료/잔여 수량을 확인할 수 있게 구조화했다.
- 기존 수정 폼은 선택된 이벤트 상세 안에서 열리도록 유지했다.
- Verification: `npm.cmd run typecheck` 통과, `npm.cmd run build` 통과. 기존 outputFileTracing / webpack cache 경고는 non-blocking.

## 2026-07-21 (admin profile settings)

- 관리자 상단바에 알림 아이콘과 설정 아이콘을 추가했다.
- 관리자 알림 바텀시트에서 숙제/칭찬/반 승인 대기 건수를 확인하고 관련 탭으로 이동할 수 있게 했다.
- `/admin/settings` 화면을 추가해 관리자 자신의 프로필, 이름, 사진 추가/제거, 로그아웃을 할 수 있게 했다.
- 관리자 프로필 이미지/이름을 저장할 수 있도록 teacher 타입과 mock store action을 추가했다.
- Verification: `npm.cmd run typecheck` 통과, `npm.cmd run build` 통과. 기존 outputFileTracing / webpack cache 경고는 non-blocking.

## 2026-07-21 (teacher invite link in org management)

- ?? ??? ??? ?? ??? `+ ??? ?? ??` ??? ????.
- ???(owner)? ??? ?? ??? ??? ? ?? ??, ??? ??? `/join/teacher/[token]` ???? ?? ?? ??? ??/???? ??.
- ?? ?? ?? ??? ?? ?? ???? ??? ????.
- Verification: `npm.cmd run typecheck` ??, `npm.cmd run build` ??. ?? outputFileTracing / webpack cache ??? non-blocking.

## 2026-07-21 (조직 관리 초대 링크 삭제)

- 조직 관리의 발급된 초대 링크 각 항목에 접근성 라벨과 툴팁이 있는 X 삭제 버튼을 추가했다.
- 조직과 링크 ID를 함께 검증하는 `DELETE /api/admin/organization` API를 추가했으며, 선생님 초대 링크 삭제는 관리자(owner)만 가능하도록 기존 발급 권한과 일치시켰다.
- 삭제 중 중복 요청을 막고, 성공 시 목록에서 즉시 제거하며 성공/실패 토스트를 표시하도록 처리했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 `useEffect` 의존성 경고와 webpack 캐시 경고만 출력됨.
- 다음 할 일: 실제 Supabase 계정에서 학생/선생님 초대 링크 발급 후 삭제 동작과 권한별 노출을 확인한다.

## 2026-07-21 (학생-선생님 연결 링크 500 수정)

- 학생 연결 링크를 배포 환경에서 안정적으로 열 수 있는 `/connect/student?token=...` 정적 화면으로 전환했다.
- 신규 연결 링크 생성 주소를 변경하고, 이미 발급된 `/connect/student/{token}` 링크도 새 화면으로 리디렉션되도록 호환성을 유지했다.
- 연결 요청 조회, 선생님 로그인 확인, 승인 성공/실패 메시지를 새 화면에 연결했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: 배포 후 기존 링크와 신규 링크 모두에서 연결 요청 조회 및 선생님 승인 완료를 확인한다.

## 2026-07-21 (학생 연결 흐름 수정 범위 재확인)

- 초대 링크 없이 가입해 `invited_by_teacher_id`가 없는 학생에게 표시되는 `TeacherConnectionCard`가 이번 수정 대상임을 코드 경로로 재확인했다.
- 카드에서 발급하는 링크는 `/connect/student?token=...` 형식이며, 기존 `/connect/student/{token}`도 새 화면으로 이동한다.
- 참고: 링크 발급 API 자체는 기존 `POST /api/student/connection-link`를 그대로 사용하므로, 버튼 클릭 시점의 오류와 발급된 링크를 여는 시점의 오류는 구분해서 확인해야 한다.
- 상태: 코드 경로 확인 완료. 추가 변경 없음.
- 실제 배포 점검: 기존 동적 링크 500, 연결 API 200, 새 정적 쿼리 화면 404. 로컬 수정 사항이 아직 Vercel 배포본에 반영되지 않았음을 확인했다.

## 2026-07-21 (커스텀 랭킹 기간 및 학생 연결 관리)

- 랭킹 단위가 Custom일 때 일수 대신 시작일과 종료일을 직접 선택하도록 전체/그룹 설정 UI와 기간 계산 로직을 변경했다.
- `ranking_period_config.custom_start`, `custom_end`를 추가하고 기존 custom_days 데이터를 날짜 범위로 이전하는 `20260721_09_ranking_custom_range.sql`을 추가했다.
- 실제 Supabase 학생·반·등록·스티커·연결 요청을 조회하는 `/api/admin/students`를 추가했다. 앱으로 가입한 학생도 학생관리 목록에 표시되고 연결 대기 학생은 최상단에 정렬된다.
- 학생관리에서 연결 승인과 연결 해지를 처리하도록 구현했다. 승인은 기본반 등록과 연결 요청 상태를 함께 승인하며, 해지는 학생 연결과 기존 승인 등록을 해제한다.
- 관리자 상단 알림이 실제 연결 대기 학생 수를 조회해 `연결 대기중인 학생` 항목과 전체 승인 대기 건수에 반영하도록 변경했다.
- 공유 링크에서 승인하는 흐름도 기본반 등록과 연결 요청 상태를 함께 갱신하도록 일치시켰다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: Supabase SQL Editor에서 migration 09를 적용하고 실제 앱 가입 학생으로 대기 알림, 승인, 해지, 재요청 흐름을 확인한다.

## 2026-07-21 (Vercel 빌드 오류 수정 및 배포 확인)

- 이벤트 상품 보관함 변경 배포 중 `computePeriodBounds` 호출 인자와 함수 정의가 달라 발생한 타입 오류를 수정했다.
- 후속 커스텀 랭킹 기간 변경에 시작일·종료일 타입이 포함된 상태까지 원격 `main`에 반영되었는지 확인했다.
- 상태: `npm.cmd run build` 통과. 배포된 `/admin/products`, `/admin/rewards` 모두 HTTP 200 확인.
- 다음 할 일: 로그인 후 상품 보관함의 등록·수정·삭제와 이벤트 순위별 상품 선택 흐름을 실제 데이터로 점검한다.

## 2026-07-21 (판매자 추천 상품 마켓)

- 개발자/판매자가 전체 학원에 노출할 소싱 상품과 구매·제휴 링크를 관리하는 `/seller/products` 화면과 판매자 전용 API를 추가했다.
- 판매자 권한은 일반 학원 관리자 권한과 분리하고 `SELLER_USER_IDS` 또는 `SELLER_EMAILS` 환경변수에 등록된 Supabase Auth 계정만 허용한다.
- 선생님용 `/admin/product-market` 화면에서 추천 상품 검색, 개인별 하트 찜, 학원 상품 보관함 저장을 지원한다.
- 추천 상품을 저장할 때 학원별 `product_catalog`에 복사하므로 판매자가 원본 노출을 중단하거나 삭제해도 이미 저장된 경품은 유지된다.
- `marketplace_products`, `marketplace_product_favorites`와 원본 상품 연결 컬럼을 만드는 migration 10을 추가했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 webpack 캐시 경고와 신규 화면의 비차단 Hook 경고만 출력됨.
- 다음 할 일: Supabase에 migration 10을 적용하고 Vercel에 판매자 계정 환경변수를 등록한 뒤 판매자 등록 → 선생님 찜/저장 → 이벤트 경품 선택 흐름을 확인한다.

## 2026-07-21 (계정 유형별 로그인 분리)

- 일반 로그인 첫 단계에 학생/선생님 선택 버튼을 추가하고 선택 유형과 실제 계정 역할이 다르면 로그아웃 후 올바른 유형을 안내하도록 했다.
- 아이디 입력란의 `입력해 주세요` placeholder를 제거했다.
- 일반 로그인 하단에 `개발자·판매자 전용 로그인` 링크를 추가하고 `/seller/login` 전용 인증 화면을 만들었다.
- 판매자 전용 로그인은 인증 직후 서버의 판매자 허용 목록을 검사하며 권한이 없는 계정은 세션을 종료하고 진입을 차단한다.
- 추천 상품 카탈로그는 모든 선생님 관리자 계정이 조회·찜·저장할 수 있고, 저장 결과는 기존대로 학원별 상품 보관함에만 보관된다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: 배포 환경에서 학생/선생님 오선택 안내와 판매자 전용 로그인 권한 검증을 확인한다.

## 2026-07-21 (개발자 로그인 명칭 및 계정 고정)

- 사용자 화면의 `개발자·판매자` 명칭을 `개발자`로 통일하고 전용 진입 경로를 `/developer/login`, 관리 경로를 `/developer/products`로 추가했다.
- 개발자 로그인 아이디를 `happia1`로 고정해 비밀번호만 입력하도록 변경했다.
- `happia1`의 내부 Auth 이메일은 `id-68617070696131@auth.stickerup.invalid`이며 개발자 허용 환경변수를 `DEVELOPER_USER_IDS`, `DEVELOPER_EMAILS`로 정리했다. 기존 SELLER 변수는 배포 호환을 위해 계속 인식한다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: Supabase Auth에 내부 이메일 계정을 생성하고 Vercel `DEVELOPER_EMAILS`를 설정한 뒤 개발자 로그인을 확인한다.

## 2026-07-21 (개발자 환경변수 단일화)

- 개발자 권한 검사에서 기존 `SELLER_EMAILS`, `SELLER_USER_IDS` 호환 처리를 제거했다.
- 이제 `DEVELOPER_EMAILS`와 `DEVELOPER_USER_IDS`만 개발자 접근 권한에 사용하며 인증 유틸리티 명칭도 개발자 기준으로 변경했다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과.
- 다음 할 일: Vercel에서 남아 있는 `SELLER_EMAILS` 환경변수를 삭제하고 재배포한다.

## 2026-07-21 (happia1 개발자 권한 인식 수정)

- 비밀번호 인증 후 `happia1`이 개발자 허용 목록 검사에서 차단되는 문제를 수정했다.
- `happia1`의 내부 Auth 이메일을 기본 개발자 계정으로 직접 인정하고 환경변수는 향후 추가 개발자 계정에만 사용하도록 변경했다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과.
- 다음 할 일: 배포 후 기존에 설정한 Supabase 비밀번호로 `/developer/login` 진입을 확인한다.

## 2026-07-21 (개발자 상품 등록 UX 개선)

- 상품 링크의 Open Graph 정보를 읽어 상품명·설명·대표 썸네일을 자동 반영하는 개발자 전용 링크 미리보기 API를 추가했다.
- 링크 미리보기 API는 localhost와 사설 네트워크 주소를 차단하고 8초 제한 및 응답 크기 제한을 적용했다.
- 카테고리를 문구, 간식, 미용, 의류, 잡화, 상품권, 기타 드롭다운으로 변경하고 새 카테고리를 추가해 바로 선택할 수 있도록 했다.
- 이미지 URL 입력을 제거하고 앨범 선택 및 모바일 카메라 촬영 버튼을 추가했다.
- 선택한 이미지는 확대·좌우·상하 위치를 조절해 정사각형으로 자른 뒤 900×900 JPEG로 저장하도록 했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: 배포 후 쿠팡 등 실제 상품 링크의 OG 썸네일 허용 여부와 모바일 카메라/앨범 자르기 동작을 확인한다.

## 2026-07-21 (회원가입 기존 계정 고정 재발 수정)

- 일반 회원가입에서 현재 로그인된 개발자 계정의 내부 이메일과 프로필이 고정되는 문제를 수정했다.
- 이메일 인증 후 돌아오는 `resume=1` 경로만 기존 인증 세션을 재사용하고, 일반 회원가입은 세션과 폼 값을 모두 초기화한다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과.
- 다음 할 일: 개발자 로그인 상태에서 일반 회원가입으로 이동해 빈 아이디·비밀번호 입력란이 표시되는지 확인한다.

## 2026-07-21 (상품 카탈로그 화면 재구성 및 경품 이미지 분리)

- 관리자 사이드바에서 추천 상품 메뉴를 제거하고 상품 카탈로그 최상단에 추천 상품 목록을 통합했다.
- 이벤트 생성의 순위별 상품 오른쪽에 상품 카탈로그 관리 버튼을 배치하고 `새 상품 이벤트 등록` 명칭을 `이벤트 생성`으로 변경했다.
- 내 상품 목록 아래의 작은 버튼을 눌러야 직접 상품 등록 폼이 열리도록 정리했다.
- 개발자 상품에 구매 상품 이미지와 이벤트 경품 이미지를 분리하고, 추천 저장 시 경품 이미지를 학원 상품 카탈로그에 복사하도록 했다.
- `marketplace_products.prize_image_url`을 추가하는 migration 11을 작성했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: Supabase에 migration 11을 적용한 뒤 구매 이미지와 경품 이미지가 각각 추천 목록과 이벤트에 표시되는지 확인한다.

## 2026-07-21 (반 관리 특강 기간 수정)

- 반 관리 목록의 특강반 기간 옆에 `수정` 버튼을 추가했다.
- 수정 모드에서 특강 시작일과 종료일을 날짜 입력으로 변경하고 저장하거나 취소할 수 있다.
- 시작일·종료일 필수 입력과 종료일이 시작일보다 빠른 경우를 검증한다.
- 변경된 기간을 스토어에 반영하고 기간 재설정 시 반 상태를 운영중으로 갱신한다. 기본반은 기존처럼 상시 운영으로 고정했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 outputFileTracing 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: 배포 후 특강반 기간 수정·취소·날짜 역전 검증과 종료된 반의 재활성화를 확인한다.

## 2026-07-21 (학생 연결 링크의 선생님 승인 동선 정리)

- 학생 연결 링크에서 직접 등록을 실행하던 `학생 등록하기` 버튼을 제거했다.
- 선생님 로그인 상태면 학생관리의 해당 학생 행으로 이동하는 `학생 승인 화면으로 이동` 버튼을 표시한다.
- 미로그인 또는 학생 계정 상태면 `선생님 로그인` 버튼을 표시하고, 로그인 완료 후 해당 학생관리 화면으로 복귀한다.
- 학생관리 화면은 링크에서 전달받은 학생 행으로 스크롤하고 강조 표시해 `연결 승인` 버튼을 바로 찾을 수 있도록 했다.
- 만료되었거나 이미 처리된 요청에는 로그인·승인 이동 버튼을 표시하지 않는다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: 로그아웃·선생님 로그인·학생 로그인 세 상태에서 연결 링크 버튼과 로그인 후 복귀를 확인한다.

## 2026-07-21 (상품 카탈로그 장바구니·추천 탭 분리)

- 상품 카탈로그를 `내 장바구니`, `추천 상품` 탭으로 나누고 장바구니를 기본 탭으로 배치했다.
- 추천 상품은 카테고리·상품명·가격만 기본 노출하고 설명은 `더보기`로 펼치도록 변경했다.
- 추천 상품 버튼을 `구매하기`, `장바구니 담기`로 변경하고 담은 상품에는 `담김` 상태를 표시한다.
- 개발자 상품과 학원별 장바구니에 가격·카테고리를 저장하는 migration 12와 API 처리를 추가했다.
- 링크 메타데이터에 가격 정보가 있으면 자동 반영하고 없으면 개발자 저장 시 직접 입력받는다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과. 로컬 build는 실행 중인 Next 프로세스가 `.next/trace`를 점유해 EPERM으로 중단됐으며 소스 컴파일과 타입 검사는 통과했다.
- 다음 할 일: Supabase에 migration 12를 적용하고 Vercel clean build 후 가격 표시와 장바구니 담기 흐름을 확인한다.

## 2026-07-21 (공지 수정 모달 및 이미지 첨부)

- 공지사항 목록 행을 클릭하면 화면 중앙에 공지 수정 모달이 열리도록 변경했다.
- 수정 모달에서 제목, 내용, 상단 고정 여부, 첨부 이미지를 수정·교체·삭제할 수 있다.
- 새 공지 작성에도 이미지 선택란과 미리보기를 추가했으며 이미지 형식과 5MB 용량 제한을 검증한다.
- 공지 타입과 스토어에 `image_url` 및 공지 수정 액션을 추가하고 학생 홈 공지 상세에도 첨부 이미지를 표시한다.
- Supabase notices 테이블에 이미지 필드를 추가하는 `20260721_10_notice_images.sql` 마이그레이션을 추가했다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. `<img>` 최적화 권고와 기존 outputFileTracing/webpack 캐시 경고만 출력됨.
- 다음 할 일: Supabase SQL Editor에서 migration 10을 적용하고 배포 후 공지 등록·수정·이미지 교체·학생 화면 노출을 확인한다.

## 2026-07-21 (연결 학생 홈 세션 역할 오류 수정)

- 실제 Supabase에서 최근 승인 학생의 프로필 행, Auth 계정, 선생님 연결 값을 확인했고 데이터가 정상임을 확인했다.
- 학생 홈이 데이터를 요청하기 전에 현재 인증 프로필 역할을 검사하도록 변경했다.
- 연결 승인 과정에서 선생님 세션으로 바뀐 브라우저가 학생 홈에 접근하면 프로필 오류 대신 관리자 대시보드로 이동한다.
- 학생 역할이 아니며 가입 프로필도 없는 경우 학생 계정으로 다시 로그인하라는 명확한 오류를 표시한다.
- 상태: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 및 webpack 캐시 경고만 출력됨.
- 다음 할 일: 배포 후 같은 브라우저의 선생님 세션과 별도 학생 세션에서 각각 올바른 화면으로 이동하는지 확인한다.

## 2026-07-22 (선생님·학생 조직 데이터 전역 동기화)

- 로그인 역할과 tenant를 기준으로 선생님, 학생, 반, 등록, 스티커 원장, 숙제, 칭찬, 공지, 랭킹 설정, 이벤트 데이터를 전역 AppStore에 hydrate하는 `/api/app-state`를 추가했다.
- 학생 마이페이지와 스티커 화면이 승인된 기본반·특강반을 사용하고, 비동기 동기화 후 출석/숙제 반 선택이 자동 설정되도록 수정했다.
- 출석·숙제·칭찬 요청을 저장하는 `/api/student/actions`와 관리자 승인/반려 및 스티커 지급을 저장하는 `/api/admin/approvals`를 추가했다.
- 반·공지·랭킹 기간·이벤트·관리자 프로필 변경을 Supabase에 자동 저장하는 `/api/app-mutations`를 추가했다.
- 실제 DB에는 과거 UI에서 만든 특강반·공지·이벤트가 없고 기본반 1개만 존재함을 확인했다. 기존 메모리 데이터는 복구할 수 없어 배포 후 재등록이 필요하다.
- 관리자 프로필 이미지 저장용 `20260722_13_teacher_profile_image.sql`을 추가했다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과. production 소스 컴파일과 lint/type 단계는 통과했으나 기존 `.next` 점유 상태에서 build가 제한 시간 120초를 초과했다.
- 다음 할 일: migration 13 적용 및 clean 배포 후 원장·하위 선생님·학생 간 데이터 동기화를 실제 계정으로 확인한다.

## 2026-07-22 (학생 연결 상태 복구 및 관리 기능 보강)

- 학생 초대 링크는 현재 활성 기간 동안 여러 학생이 함께 사용할 수 있는 재사용 링크임을 코드와 실제 사용 건수로 확인했다. 동일 링크를 사용한 학생 2명이 존재하며 사용 후 자동 소진되지 않는다.
- 연결 해지가 승인된 기본반 enrollment까지 rejected로 변경하던 버그를 수정해, 앞으로는 선생님 연결만 해제하고 반 승인 상태는 유지한다.
- 기존 버그로 연결과 기본반 승인이 풀린 권혁민·김홍준 학생의 연결 및 기본반 승인을 Supabase에서 복원했다. 현재 학생 3명 모두 connected/approved 상태를 확인했다.
- 학생관리의 연결 대기 행에 `연결 승인`, `대기 해지`를 제공하고, 연결된 학생에는 확인창이 있는 `연결 해지`를 제공한다.
- owner 관리자에게 학생 계정과 관련 데이터를 제거하는 `삭제` 버튼을 추가했으며 되돌릴 수 없는 작업임을 확인창으로 안내한다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과.
- 다음 할 일: 배포 후 학생관리에서 연결 해지가 반 소속을 유지하는지, 대기 해지와 owner 전용 삭제가 정상 동작하는지 확인한다.

## 2026-07-22 (학생 독바 아이콘 및 관리자 반응형 개편)

- 학생 하단 독바에 상단바와 동일한 선형 SVG 스타일의 홈·스티커·마이페이지 아이콘을 추가했다.
- 모바일 관리자 화면은 세로 레이아웃과 상단 가로 스크롤 메뉴를 사용하고 콘텐츠 여백을 화면 폭에 맞게 줄였다.
- 태블릿 세로 화면은 180px 고정 사이드바와 넓은 단일 콘텐츠 영역을 사용하며 데스크톱에서는 210px 사이드바를 유지한다.
- 관리자 표는 모바일·태블릿에서 셀이 뭉개지지 않도록 콘텐츠 영역 안에서 가로 스크롤되게 했다.
- 상태: `npm.cmd run typecheck`, `git diff --check` 통과.
- 다음 할 일: 실제 모바일과 세로형 태블릿에서 메뉴 스크롤, 표 스크롤, 학생 독바 safe-area 간격을 확인한다.
## [2026-07-22] 상품 화면·기본반·이벤트 동기화 개선

- 개발자 상품 화면을 `새 추천상품`/`소싱상품` 상단 탭으로 분리하고, 링크 썸네일을 구매 상품 이미지로 자동 반영하도록 정리했다. 경품 이미지 별도 등록과 `구매 상품 이미지와 동일하게 사용` 옵션, 소싱상품 목록형/카드형 전환을 추가했다.
- 관리자 추천상품과 장바구니 상품에 카테고리·제목·가격·더보기를 동일하게 노출하고, 장바구니의 구매/수정/삭제 동작을 우측 정렬했다.
- 이벤트 목록을 기본 접힘형 아코디언으로 바꾸고 제목 옆에 기간 및 우측 화살표를 표시했다. 상세 정보는 선택한 블록 내부에서 펼쳐지며 경품은 카테고리와 이름만 표시한다.
- 반 관리에서 기본반 설정을 상단 독립 영역으로 분리하고, 특강반 추가/목록을 하단에 배치했다. 기본반 소속을 항상 승인 상태로 보정하는 `20260722_14_default_class_membership.sql`을 추가했다.
- 학생 특강반 신청을 `/api/student/actions`의 실제 Supabase 승인대기 저장과 연결하고, 새 공지·신규 특강반을 학생 알림 목록에 포함했다.
- 고정 데모 날짜 때문에 새 기본반 이벤트가 예정 상태로 잘못 분류되던 로직을 실제 현재 날짜 기준으로 변경했다.
- 검증: `npm.cmd run typecheck`, `git diff --check`, `npm.cmd run build` 통과. 기존 `<img>` 최적화 경고만 남아 있다.
- 다음 할 일: Supabase에 `20260722_14_default_class_membership.sql` 적용 후 실제 학생 계정으로 기본반 이벤트와 특강 승인 요청을 확인한다.
## [2026-07-22] 로그인 오류 복구 경로 500 방지

- 학생 정보 로드 실패 화면의 로그인 버튼을 `/login?reauth=1&type=student`로 변경했다.
- 오류 복구용 로그인 진입에서는 기존 로컬 Supabase 세션을 먼저 종료해, 잘못된 역할/프로필 세션의 자동 리디렉션과 재조회가 반복되지 않도록 했다.
- 로그인 페이지의 `type`, `next`, `reauth` 쿼리 파라미터가 배열로 전달되는 경우에도 문자열 메서드 호출로 500이 발생하지 않도록 타입을 안전하게 처리했다.
- 검증: `npm.cmd run typecheck`, `git diff --check`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.
## [2026-07-22] 출석·과제 스티커 즉시 자동 지급

- 출석과 과제 버튼 문구를 `체크하기`로 통일했다.
- 과제 체크 저장 시 `homework_submissions`를 즉시 approved로 생성하고 같은 요청 ID로 `sticker_ledger`를 생성해 스티커를 자동 지급하도록 변경했다. 원장 저장 실패 시 과제 행도 제거해 불완전한 지급 상태를 남기지 않는다.
- 클라이언트 mock 상태도 과제 체크와 동시에 approved 내역 및 homework 원장 항목을 추가하도록 맞췄다.
- 관리자 승인함·상단 알림·대시보드에서 과제 승인 대기를 제외하고 칭찬 스티커만 선생님 승인 대상으로 유지했다.
- 기존 pending 과제에 스티커를 지급하고 approved로 보정하는 `20260722_15_auto_approve_homework.sql`을 추가했다.
- 검증: `npm.cmd run typecheck`, `git diff --check`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.
## [2026-07-22] 화면 로딩 지연 원인 조사

- 공통 AppStore가 앱 시작 시 `/api/app-state`에서 14개 테이블을 한꺼번에 조회하며, `getSession()` 직후 등록한 `onAuthStateChange`의 초기 세션 이벤트로 동일 동기화가 중복 실행될 수 있음을 확인했다.
- 학생 홈은 공통 동기화와 별개로 `/api/auth/profile` 후 `/api/student/home`을 직렬 호출해 같은 학생·반·이벤트 데이터를 중복 조회한다.
- 관리자 상단바는 진입 시 `/api/admin/students`를 추가 호출하고 학생관리·조직관리·상품·이벤트 화면도 각자 세션 확인과 전용 API 호출을 다시 수행한다.
- 데이터 조회가 모두 클라이언트 `useEffect` 이후 시작되어 기본 화면이 먼저 렌더링된 뒤 실제 데이터로 교체되므로 짧은 지연과 깜빡임이 체감된다. Vercel 함수 콜드 스타트와 Supabase 왕복 시간이 첫 진입에서 이를 확대할 수 있다.
- 상태: 원인 확인 완료. 이번 요청은 조사 범위로 코드 최적화는 수행하지 않았다.
- 다음 할 일: 공통 hydrate 중복 제거, 역할/학생 홈 데이터 통합, 요청 캐시·공유 및 서버 선조회 순으로 최적화한다.
## [2026-07-22] 출석·과제 당일 1회 제한

- 출석과 과제를 한국 날짜 기준으로 학생별·반별 하루 한 번만 체크할 수 있도록 서버 중복 검사를 추가했다.
- `attendance_records`와 `homework_submissions`에 `check_date`를 추가하고 `(student_id, class_id, check_date)` 부분 고유 인덱스로 연속 클릭·다른 기기 요청도 차단하는 `20260722_16_daily_check_limit.sql`을 추가했다.
- 과거 같은 날 중복 기록은 삭제하지 않고 최초 기록만 `check_date`를 보정해 기존 데이터를 보존했다.
- 학생 화면은 오늘 해당 반에서 체크한 기록이 있으면 버튼을 `오늘 출석 체크 완료` 또는 `오늘 과제 체크 완료`로 비활성화하고 다음 날 다시 가능하다는 안내를 표시한다.
- 지급 원장 저장 실패 시 생성된 출석 기록도 제거해 체크 제한만 남는 불완전 상태를 방지했다.
- 검증: `npm.cmd run typecheck`, `git diff --check`, `npm.cmd run build` 통과.
## [2026-07-22] 학생 스티커 화면 정보 구조 개선

- 마이페이지의 `내 스티커 이력`을 제거하고 스티커 탭 최하단으로 이동했다. 기존 Accordion의 기본값을 유지해 최초 진입 시 접힌 상태로 표시한다.
- 출석 또는 과제를 오늘 체크한 반에서는 입력 선택 영역과 체크 버튼 대신 `오늘 체크 완료` 블록과 지급 스티커 수를 표시하도록 전환했다. 다른 반을 선택하면 해당 반의 당일 체크 상태를 독립적으로 반영한다.
- 주간 날짜 아래 일별 스티커 요약에 선택일 지급 수와 누적 전체 스티커 수를 나란히 표시했다.
- 스티커 이력은 최근 20건까지 펼쳐 볼 수 있도록 조정했다.
- 검증: `npm.cmd run typecheck`, `git diff --check`, `npm.cmd run build` 통과.
## [2026-07-22] 출석 완료 안내 문구 정리

- 출석 완료 블록의 `이 반의 출석은 내일 다시 체크할 수 있어요.` 문구를 제거했다.
- `오늘 출석 체크 완료` 상태와 지급 스티커 수 표시는 유지했다.

## [2026-07-22] 로딩 UX·반 자동 승인·이벤트 보상 흐름 개선

- 앱 상태 초기 동기화가 세션 확인과 인증 이벤트에서 중복 실행되지 않도록 사용자 단위로 요청을 합쳤고, 학생 홈의 프로필/홈 데이터 요청을 병렬화했다.
- 관리자 전역과 상품 카탈로그, 학생 홈에 스켈레톤을 적용해 실제 응답 전 빈 목록이나 로그인 유도 화면이 먼저 보이지 않게 했다.
- 특강반 신청을 즉시 승인으로 저장하고 반 신청 상태를 선생님 연결 대기로 해석하던 로직을 제거했다.
- 학생관리에서 복수 소속반을 태그로 표시하고 기본반을 제외한 각 특강반 소속을 개별 해지할 수 있게 했다.
- 학생 공지 상세를 하단 시트 대신 화면 중앙 모달로 변경했다.
- 이벤트명 입력·수정을 추가하고 학생 보상 카드에 등록된 경품 이미지를 노출했다. 랭킹 종료 후 서버가 실제 순위를 다시 계산해 1등부터 순차적으로 선물을 선택하도록 보상 신청 API를 추가했다.
- `reward_campaigns.title` 컬럼을 추가하는 `20260722_17_reward_campaign_title.sql`을 추가했다.
- 검증: `npm.cmd run build` 통과. 기존 `<img>` 최적화 경고만 남아 있다.

## [2026-07-22] 상품 카탈로그 가격·배너·페이지 탐색 개선

- 개발자 상품 링크 미리보기가 구조화 데이터와 페이지 가격값을 추가로 읽고, 상품명/설명에서 포장 수량을 확인할 수 있으면 `총가격 · 개당 단가` 형식으로 가격을 자동 입력하도록 개선했다.
- 관리자 상품 카드를 기존보다 작게 재배치하고 이미지를 정방형으로 통일했다. 추천상품과 장바구니 모두 페이지당 20개로 나누고 버튼 및 좌우 스와이프로 이동할 수 있게 했다.
- 장바구니 카드의 수정 버튼을 제거하고 구매·삭제 기능만 유지했다.
- 상품 카탈로그 상단에 쿠팡 파트너스 배너와 고지 문구를 추가했다. 카탈로그 검색 결과가 없으면 동일 검색어로 쿠팡 전체 상품 검색을 여는 경로를 제공한다.
- 개발자 화면에 프로모션 배너 링크 관리 기능을 추가했다. 배너는 링크의 대표 이미지를 자동 확인하며 관리자 카탈로그 하단에서 2초 간격 자동 전환과 좌우 스와이프를 지원한다.
- `marketplace_banners` 테이블을 추가하는 `20260722_18_marketplace_banners.sql`을 추가했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.
## [2026-07-22] 상품 마켓 배너 및 링크 미리보기 변경사항 반영

- 개발자 상품 화면에 프로모션 배너 등록·조회·삭제 기능과 관련 API 및 `marketplace_banners` 마이그레이션을 추가했다.
- 관리자 상품 마켓 응답에 활성 배너 목록을 포함했다.
- 상품 링크 미리보기에서 JSON-LD 가격과 묶음 수량을 읽어 개당 가격 정보를 제공하도록 보강했다.
- 신규 파일에 깨져 있던 한글 기본값과 API 오류 메시지를 정상 문자열로 수정했다.
- 검증: `npm.cmd run build`, `npm.cmd run typecheck`, `git diff --check` 통과 후 전체 변경사항을 `main` 브랜치 푸시 대상으로 정리했다.
- 상태: 구현 및 로컬 검증 완료.
- 다음 할 일: 배포 환경에서 마이그레이션 적용 후 배너 등록과 외부 상품 링크별 가격 파싱 결과를 확인한다.
## [2026-07-22] 학생 이벤트 보상 카드 슬라이드 UI 개선

- 학생 홈의 이벤트 보상 이미지를 카드 폭에 맞는 정방형으로 변경했다.
- 보상 목록에 가로 스크롤과 스냅 동작을 적용해 모바일에서 좌우 슬라이드로 탐색할 수 있도록 했다.
- 보상 카드의 `잔여 n/n` 정보를 삭제하고 상품명과 선택 상태에 집중하도록 높이를 정리했다.
- 상단에 저장된 이벤트 제목을 우선 표시하고, 대상 반과 랭킹 보상 선택 방식을 설명하는 한 줄 안내를 추가했다.
- 전체 이벤트 바텀시트에도 동일한 제목·설명·정방형 슬라이드 카드를 적용했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.
- 상태: 구현 및 로컬 검증 완료.

## [2026-07-22] 개발자 프로모션 탭 및 배너 미리보기 개선

- 개발자 상품관리 상단을 `새 추천상품`, `소싱상품`, `프로모션` 3개 탭으로 분리하고 배너 등록 화면은 프로모션 탭에서만 노출되도록 변경했다.
- 등록된 배너를 텍스트 목록 대신 관리자 상품 카탈로그와 같은 이미지 카드로 미리 볼 수 있게 했으며 이미지, 제목, 이동 링크와 삭제 기능을 함께 표시했다.
- 개발자 미리보기와 관리자 카탈로그 프로모션 배너 이미지를 모두 1:1 정방형으로 통일했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.
## [2026-07-22] 과제 내역 접힘·특강반 즉시 등록·관리자 표 모바일 개선

- 스티커 탭의 `내 과제 체크 내역`을 아코디언으로 변경하고 기본값을 접힘 상태로 지정했다.
- 반 관리의 `특강반 추가` 버튼을 특강반 목록 오른쪽 상단으로 이동했다.
- 반별 승인 대기 신청자 영역을 제거하고 학생의 특강반 신청을 즉시 승인 상태로 반영하도록 클라이언트 상태 로직을 변경했다.
- 기존 `pending` 반 등록을 승인으로 전환하고 이후 pending 저장도 자동 승인하는 `20260722_19_auto_approve_class_enrollments.sql` 마이그레이션을 추가했다.
- 대시보드의 불필요해진 반 승인 대기 KPI를 등록 학생 수로 교체했다.
- 관리자 모바일 화면의 모든 표에서 강제 최소 폭을 제거하고 고정 레이아웃, 좁은 셀 간격, 텍스트·버튼 줄바꿈을 적용했다. 공지사항의 말줄임 셀도 모바일에서는 전체 내용이 보이도록 했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 개발자 상품관리 로그아웃 추가

- 개발자 상품관리 화면 상단 오른쪽에 로그아웃 버튼을 추가했다.
- 로그아웃 시 Supabase 인증 세션을 종료하고 개발자 전용 로그인 화면으로 이동하도록 연결했다.
- 처리 중 중복 실행을 막고 로그아웃 실패 시 사용자 안내를 표시하도록 했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 반 관리 모바일 겹침·이벤트 경품 데이터 유지 개선

- 반 관리의 특강반 표에 열별 최소 폭과 가로 스크롤을 적용해 정규 출석 시간과 운영 기간이 서로 겹치지 않도록 했다.
- 특강 기간 편집 입력은 셀 내부에서 줄바꿈되도록 하고 새 특강반 폼은 모바일에서 한 열로 표시하도록 변경했다.
- 최초 앱 상태 동기화에 `productCatalog`를 포함해 경품 관리 페이지를 먼저 방문하지 않아도 이벤트 생성에서 상품을 선택할 수 있도록 했다.
- 마지막으로 성공한 경품 목록을 사용자별 로컬 캐시에 저장하고 다음 접속 시 네트워크 응답 전에 복원하도록 했다.
- 이벤트 화면은 기존 목록을 유지한 채 60초 주기와 화면 재활성화 시 백그라운드 갱신하며, 수동 새로고침과 로딩·오류 상태도 표시한다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 학생 프로필 사진 홈·랭킹 아바타 연동

- 학생 홈 상단 아바타에 마이페이지에서 저장한 `profile_image_url`을 전달하도록 연결했다.
- TOP 5와 전체 랭킹에서 각 학생의 프로필 사진을 찾아 공용 아바타에 표시하도록 변경했다.
- 프로필 사진이 없는 학생은 기존처럼 이름 첫 글자 아바타를 사용한다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 학생 스티커 입력 카드·이벤트 경품 선택 상태 개선

- 출석 체크, 과제 체크, 칭찬 스티커 요청의 안내 문구를 각 제목 오른쪽에 한 줄로 배치해 카드 상단 공간을 줄였다.
- 마이페이지 소속 반 현황을 `반명 · 정규 출석 시:분` 한 줄로 합치고 초 단위 표시를 제거했다.
- 진행 중이거나 시작 전인 이벤트 경품 카드에서 의미 없는 비활성 상태 버튼과 고정 빈 여백을 제거했다.
- 이벤트 종료 후 순위와 순차 선택 상태에 따라 `경품 고르기`, `선택 순서 대기`, `다음 기회`, `경품 선택 완료`를 표시하도록 정리했다.
- 기존 서버의 1위부터 순차 선택 검증과 화면 상태가 동일하게 동작하는지 확인했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 학생 경품 선호도 로딩·관리자 경품 목록 UI 개선

- 학생 홈 진입 시 이벤트 경품 목록을 미리 불러오고, 로딩 중 빈 목록 안내 대신 스켈레톤 카드를 표시하도록 했다.
- 좋아요 테이블이 아직 없는 환경에서도 기존 `product_catalog` 경품은 학생에게 우선 표시되도록 조회 API를 보완했다.
- 관리자 이벤트 생성과 경품 리스트 관리 카드의 간격을 줄이고, 경품 리스트 관리 카드 전체를 누르면 바로 관리 페이지로 이동하도록 변경했다.
- 관리자 경품 카드의 순위 배지와 같은 상단 줄 오른쪽에 `♥ 좋아요 수` 배지를 표시하고 본문 아래의 중복 좋아요 문구를 제거했다.
- 목록형 보기에서는 더보기 설명을 제거하고 `카테고리 / 제휴사`를 한 줄로 표시하도록 정리했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 개발자 상품 카드·가격 자동입력 개선

- 개발자 상품 리스트의 카드형 보기를 모바일 2열에서 대형 화면 최대 6열까지 확장되는 소형 그리드로 변경했다.
- 카드 썸네일을 카드 폭에 맞춘 1:1 정방형으로 통일하고 상품 정보와 작업 버튼의 여백·글자 크기를 압축했다.
- 상품 링크 입력을 마치면 링크 분석을 자동 실행하고 새 링크에서 확인한 가격으로 가격란을 갱신하도록 했다.
- 상품명·설명에서 묶음 수량을 찾아 `총가격 (개당 가격)` 형식으로 표시하며 `12개×2` 같은 곱셈 수량도 계산하도록 보완했다.
- 외부 사이트가 가격 메타데이터를 제공하지 않거나 접근을 차단하는 경우 기존 수동 가격 입력을 유지한다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 이벤트 경품 관리 블록·다중 제휴사 표시 개선

- 이벤트/상품관리에서 `이벤트 생성`과 `경품 리스트 관리`를 동일한 카드형 접이식 블록으로 분리하고 두 블록 모두 기본값을 접힘으로 유지했다.
- 경품 관리 페이지의 제목을 `상품 카탈로그`에서 `경품 리스트`로 변경했다.
- 쿠팡 배너와 제휴 상품 검색 영역을 추천상품 탭 내부로 옮기고, 입력한 검색어로 쿠팡과 테무를 각각 검색할 수 있는 버튼을 추가했다.
- 상품 카드의 카테고리와 같은 줄 오른쪽에 구매 링크 도메인으로 판별한 `쿠팡`, `테무`, `기타 제휴`, `직접 등록` 정보를 표시했다.
- 이벤트 상세 경품 표에서 수량·카테고리·구매 바로가기를 제거하고 순위와 상품명만 남겨 모바일 너비를 효율적으로 사용하도록 했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 학생 스티커·프로필·반 신청 취소 개선

- 스티커 탭의 반별 정규 출석 시각을 초 없이 `시:분`까지만 표시하도록 변경했다.
- 오늘 받은 스티커는 왼쪽, 전체 스티커는 오른쪽 정렬로 구분했다.
- 학생 프로필 편집에서 앨범 이미지 선택과 카메라 촬영을 지원하고, 이미지를 정방형 512px로 축소해 학생 프로필에 저장하도록 연결했다.
- 프로필 사진 표시를 공용 아바타에 연결하고 이름 옆 연필 아이콘을 좌우 반전했다.
- 소속 반 현황의 승인 대기 특강반에 `신청 취소` 버튼을 추가하고, 학생 본인의 신청만 삭제하며 기본반은 취소할 수 없도록 보호했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 경품 리스트 카드·이벤트 생성 모바일 레이아웃 개선

- 관리자 경품 리스트의 카드 보기에서 `구매하기`, `수정`, `삭제` 작업을 한 줄에 배치하고 좁은 카드에서도 줄바꿈 없이 균등하게 표시되도록 했다.
- 이벤트 생성 제목 바로 아래에 `경품 리스트 관리` 진입 버튼을 배치하고 기존 `상품 카탈로그 관리` 명칭을 교체했다.
- 모바일 이벤트 생성의 순위별 상품 영역을 가변 열 구조로 바꿔 1·2·3등 행이 화면 밖으로 잘리지 않도록 했다.
- 모바일 상품 선택창과 수량 입력창의 너비, 글자 크기, 내부 여백을 줄여 작은 화면에서 더 알맞게 표시되도록 했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.
- 상태: 구현 및 로컬 검증 완료.
## [2026-07-22] 상품 카탈로그 보기·검색·카테고리 필터 개선

- 관리자 상품 카탈로그의 장바구니와 추천상품 양쪽에 카드형·목록형 보기 전환 아이콘을 추가했다.
- 각 탭의 보기 방식을 독립적으로 유지해 탭을 이동해도 사용자가 선택한 레이아웃이 보존되도록 했다.
- 상품 검색창을 기본 아이콘 상태로 축소하고 돋보기를 누르면 옆으로 확장되는 검색 입력 UI로 변경했다.
- 왼쪽 카테고리 필터 버튼을 누르면 현재 탭의 상품 카테고리 칩이 펼쳐지고 선택한 카테고리와 검색어를 함께 적용하도록 했다.
- 장바구니에도 검색과 카테고리 필터를 동일하게 적용하고 목록형에서는 이미지·상품정보·작업 버튼을 한 줄 중심으로 압축했다.
- 기존 파일에 깨져 있던 상품 카탈로그 한글 문구도 정상 문자열로 정리했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.
- 상태: 구현 및 로컬 검증 완료.
## [2026-07-22] 스티커 정책 저장 상태 문구 정리

- 스티커 정책 설정의 출석 정책과 숙제 정책 하단에 표시되던 `현재 저장된 ... 정책과 동일해요.` 문구를 삭제했다.
- `TierEditor`에서 더 이상 사용하지 않는 저장 상태 라벨 속성을 제거했다.
- 상태: 구현 완료, 전체 미푸시 변경사항과 함께 검증 후 `main` 브랜치에 반영.

## [2026-07-22] 학생 기본반·인증 유지·이벤트 상세 UX 개선

- 과거 `pending`으로 남은 과제 기록은 앱 상태 동기화 시 즉시 승인 처리하고 누락된 스티커 원장을 보정하도록 했다. 신규 과제는 기존 즉시 승인 흐름을 유지한다.
- 학생별 선호 반을 브라우저에 저장하고 특강반을 기본 우선값으로 사용해 출석·숙제·칭찬의 반 선택을 공유하도록 했다. 특강반 등록 직후 해당 반을 기본값으로 저장한다.
- 특강반이 열려 있지만 학생이 아직 등록하지 않은 경우 첫 홈 진입에 반 선택 안내 중앙 팝업을 띄우고 마이페이지 소속 반 신청 영역으로 연결했다.
- Supabase 브라우저 클라이언트를 싱글턴으로 유지해 세션 자동 갱신과 로컬 자동 로그인을 안정화했다. 세션이 실제 종료되면 학생·관리자 화면을 남기지 않고 사유 안내가 있는 로그인 화면으로 이동한다.
- 로그인 기술 오류를 사용자용 비밀번호/사용자 정보 안내로 변환하고 기존 Supabase 진입 안내 문구를 제거했다.
- 설정 알림 토글의 도트 위치를 스위치 내부로 보정하고 학생·관리자 알림을 중앙 팝업으로 변경했다. 빈 알림은 `새 알림이 없습니다.`로 표시한다.
- 학생의 전체 이벤트를 전체화면 목록과 아코디언 상세로 변경하고 제목·반명·남은 기간을 표시했다. 이벤트 설명은 경품 아래에 노출하며 관리자 생성/수정 화면에서 편집 가능하게 했다.
- 관리자 이벤트 수정은 기존 상세 대신 같은 위치에서 편집 폼으로 전환되도록 했고 이벤트 리스트의 선택 완료·남은 수량 정보를 숨겼다.
- `reward_campaigns.description`을 추가하는 `20260722_20_reward_campaign_description.sql` 마이그레이션을 추가했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.

## [2026-07-22] 개발자 상품관리 명칭 정리

- 개발자 화면의 `새 추천상품`을 `상품 등록`, `소싱상품`을 `상품 리스트`로 통일했다.
- 등록 완료 메시지와 수정 화면 제목, 개발자 로그인 설명에서도 추천·소싱 표현을 제거했다.
- `프로모션` 탭 명칭은 기존대로 유지했다.

## [2026-07-22] 학생 경품 선호도·관리자 인기 경품 리스트

- 학생 홈의 `다른 이벤트` 전체화면을 `전체 이벤트`와 `이벤트 경품` 탭으로 나눴다.
- 이벤트 경품 탭은 관리자가 상품 카탈로그에 저장한 경품 후보를 보여주며, 학생별 좋아요 등록/취소와 전체 좋아요 수를 지원한다.
- 동일 학생이 같은 경품에 중복 좋아요를 줄 수 없도록 `(product_id, student_id)` 복합 기본키를 사용하는 `prize_product_likes` 테이블을 추가했다.
- 관리자 상품 카탈로그의 `장바구니` 명칭을 `경품 리스트`로 변경하고 추천상품 저장 버튼과 안내 문구도 같은 의미로 통일했다.
- 관리자 경품 리스트와 학생 이벤트 경품 목록을 좋아요가 많은 순으로 정렬하고 1위부터 순위 번호와 좋아요 수를 표시했다.
- 학생 선호도 조회·토글 API `/api/student/prize-preferences`와 `20260722_21_prize_product_likes.sql` 마이그레이션을 추가했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check` 통과. 기존 이미지 최적화 경고만 남아 있다.
## [2026-07-22] 개발자 상품정보 자동입력 신뢰성 개선

- 링크 분석 결과가 있어도 기존 상품명·설명이 입력되어 있으면 바뀌지 않던 조건을 제거하고, 새로 분석한 상품명·가격·설명·이미지로 폼을 갱신하도록 수정했다.
- 외부 쇼핑몰 요청 헤더를 일반 브라우저 형태로 보완하고 Open Graph, Product JSON-LD, 페이지 내 상품 JSON에서 상품명·가격·이미지를 찾도록 분석 범위를 넓혔다.
- 자동입력된 항목과 가격을 입력란 아래에 계속 표시하고, 쇼핑몰이 정보를 차단해 아무 값도 찾지 못하면 직접 입력이 필요하다는 안내를 표시하도록 했다.
- 검증: `npm.cmd run typecheck`, `npm.cmd run build` 통과. 기존 이미지 최적화 경고만 남아 있다.
