# DEBUGGING NOTES

이 파일은 발생한 이슈의 증상/원인/조치를 기록한다.

---

## [2026-07-20] npm install ENOTEMPTY 에러

- 증상: `node_modules\axobject-query\...` 등에서 `rmdir ENOTEMPTY`로 npm install 실패
- 원인 추정: 이전 install이 타임아웃으로 중간에 끊겨 node_modules가 불완전한 상태로 남음
- 조치: node_modules, package-lock.json 삭제 → `npm cache clean --force` → npm install 재실행
