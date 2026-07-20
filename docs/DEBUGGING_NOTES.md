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
