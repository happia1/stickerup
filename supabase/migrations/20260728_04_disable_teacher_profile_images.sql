update public.teachers
set profile_image_url = null
where profile_image_url is not null;
