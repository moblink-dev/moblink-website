begin;
create extension if not exists pgtap;
select plan(7);

select is(
  (select public from storage.buckets where id = 'profile-images'),
  false,
  'profile image bucket is private'
);
select is(
  (select file_size_limit from storage.buckets where id = 'profile-images'),
  5242880::bigint,
  'profile image bucket enforces a five megabyte limit'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'profile-images'),
  array['image/jpeg', 'image/png', 'image/webp']::text[],
  'profile image bucket allows only reviewed image formats'
);
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Profile image owners read'), 1::bigint,
  'owners have an image read policy');
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Profile image owners upload'), 1::bigint,
  'owners have an image upload policy');
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Profile image owners replace'), 1::bigint,
  'owners have an image replacement policy');
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Profile image owners delete'), 1::bigint,
  'owners have an image deletion policy');

select * from finish();
rollback;
