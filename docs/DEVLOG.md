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
