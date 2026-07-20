# DEBUG NOTES

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
