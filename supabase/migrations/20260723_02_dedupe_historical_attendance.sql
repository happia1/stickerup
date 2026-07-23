-- 과거에는 반별 출석이 가능했으므로 같은 학생의 같은 날 활성 출석 원장이 여러 개일 수 있다.
-- 가장 먼저 지급된 한 건만 유지하고 나머지는 취소 처리해 모든 합계와 랭킹을 새 기준에 맞춘다.
with ranked_attendance_ledger as (
  select id,
         row_number() over (
           partition by student_id, (created_at at time zone 'Asia/Seoul')::date
           order by created_at, id
         ) as row_number
  from public.sticker_ledger
  where source_type = 'attendance' and status = 'active'
)
update public.sticker_ledger ledger
set status = 'rolled_back',
    rollback_reason = '출석 정책 변경에 따른 반별 중복 출석 보정',
    rollback_at = now()
from ranked_attendance_ledger ranked
where ledger.id = ranked.id and ranked.row_number > 1;
