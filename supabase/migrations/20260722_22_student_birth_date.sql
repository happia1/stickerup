alter table public.students
  add column if not exists birth_date date;

comment on column public.students.birth_date is '학생 생년월일. 생일 안내 및 선물 선호 확인에 사용';
