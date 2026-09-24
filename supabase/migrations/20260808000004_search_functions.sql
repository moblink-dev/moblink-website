-- Location-based search functions for the 1800 Mob Link service directory
-- Uses PostGIS geography for accurate distance calculations

-- Search services within a radius of a point
-- Returns services ordered by distance, with distance in km
create or replace function public.nearby_services(
  p_lat double precision,
  p_lng double precision,
  p_radius_m double precision default 50000,
  p_filter_cat text default null,
  p_search_q text default null
)
returns table (
  id uuid,
  name text,
  category service_category,
  subcategory text,
  tags text[],
  description text,
  address text,
  suburb text,
  state text,
  postcode text,
  lat double precision,
  lng double precision,
  distance_m double precision,
  distance_km text,
  phone text,
  website text,
  hours text,
  eligibility text,
  is_aboriginal_led boolean,
  is_crisis boolean,
  is_national boolean,
  is_free boolean
)
language plpgsql
stable
as $$
declare
  search_point geography;
begin
  search_point := st_makepoint(p_lng, p_lat)::geography;

  return query
  select
    s.id,
    s.name,
    s.category,
    s.subcategory,
    s.tags,
    s.description,
    s.address,
    s.suburb,
    s.state,
    s.postcode,
    st_y(s.location::geometry) as lat,
    st_x(s.location::geometry) as lng,
    st_distance(s.location, search_point) as distance_m,
    round((st_distance(s.location, search_point) / 1000)::numeric, 1)::text || ' km' as distance_km,
    s.phone,
    s.website,
    s.hours,
    s.eligibility,
    s.is_aboriginal_led,
    s.is_crisis,
    s.is_national,
    s.is_free
  from public.services s
  where s.status = 'published'
    and st_dwithin(s.location, search_point, p_radius_m)
    and (p_filter_cat is null or s.category::text = p_filter_cat)
    and (
      p_search_q is null
      or s.name ilike '%' || p_search_q || '%'
      or s.description ilike '%' || p_search_q || '%'
      or s.suburb ilike '%' || p_search_q || '%'
      or s.tags::text ilike '%' || p_search_q || '%'
    )
  order by st_distance(s.location, search_point) asc;
end;
$$;

-- Search services by suburb or postcode text match
create or replace function public.search_services_by_location(
  location_q text,
  filter_cat text default null
)
returns table (
  id uuid,
  name text,
  category service_category,
  subcategory text,
  tags text[],
  description text,
  address text,
  suburb text,
  state text,
  postcode text,
  phone text,
  website text,
  hours text,
  eligibility text,
  is_aboriginal_led boolean,
  is_crisis boolean,
  is_national boolean,
  is_free boolean
)
language plpgsql
stable
as $$
begin
  return query
  select
    s.id,
    s.name,
    s.category,
    s.subcategory,
    s.tags,
    s.description,
    s.address,
    s.suburb,
    s.state,
    s.postcode,
    s.phone,
    s.website,
    s.hours,
    s.eligibility,
    s.is_aboriginal_led,
    s.is_crisis,
    s.is_national,
    s.is_free
  from public.services s
  where s.status = 'published'
    and (
      s.suburb ilike '%' || location_q || '%'
      or s.postcode ilike location_q || '%'
      or s.state ilike location_q || '%'
    )
    and (filter_cat is null or s.category::text = filter_cat)
  order by s.name asc;
end;
$$;

-- Get all service categories with counts
create or replace function public.service_categories_with_counts()
returns table (
  category service_category,
  count bigint
)
language plpgsql
stable
as $$
begin
  return query
  select s.category, count(*)::bigint
  from public.services s
  where s.status = 'published'
  group by s.category
  order by s.category;
end;
$$;

-- Get service by ID with full details
create or replace function public.get_service_detail(service_id uuid)
returns table (
  id uuid,
  name text,
  category service_category,
  subcategory text,
  tags text[],
  description text,
  address text,
  suburb text,
  state text,
  postcode text,
  lat double precision,
  lng double precision,
  phone text,
  website text,
  hours text,
  eligibility text,
  is_aboriginal_led boolean,
  is_crisis boolean,
  is_national boolean,
  is_free boolean,
  source text,
  reviewed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
as $$
begin
  return query
  select
    s.id, s.name, s.category, s.subcategory, s.tags,
    s.description, s.address, s.suburb, s.state, s.postcode,
    st_y(s.location::geometry) as lat,
    st_x(s.location::geometry) as lng,
    s.phone, s.website, s.hours, s.eligibility,
    s.is_aboriginal_led, s.is_crisis, s.is_national, s.is_free,
    s.source, s.reviewed_at, s.created_at, s.updated_at
  from public.services s
  where s.id = service_id and (s.status = 'published' or exists (
    select 1 from public.staff_profiles where user_id = auth.uid() and is_active = true
  ));
end;
$$;

-- Seed the 20 services from the Next.js app data
-- This is a one-time seed for the Nowra / Illawarra region
create or replace function public.seed_services()
returns void
language plpgsql
as $$
begin
  insert into public.services (name, category, subcategory, tags, description, address, suburb, state, postcode, location, phone, website, hours, eligibility, is_aboriginal_led, is_crisis, is_national, is_free, status, source)
  values
    ('South Coast Medical Service', 'Health', 'Aboriginal community-controlled health', ARRAY['Health', 'Family', 'Wellbeing', 'Aboriginal-led'], 'Aboriginal community-controlled health, wellbeing and family support in Nowra. GP services, chronic care, dental, mental health, and family support programs.', '63 Berry Street', 'Nowra', 'NSW', '2541', st_makepoint(150.599, -34.882)::geography, '(02) 4421 9000', 'https://www.scms.com.au', 'Mon-Fri 8:30am-5pm', 'Aboriginal and Torres Strait Islander people and their families', true, false, false, false, 'published', 'Synthetic seed data'),
    ('Waminda', 'Health', 'Women, family and culture', ARRAY['Women', 'Health', 'Family', 'Culture', 'Aboriginal-led'], 'Culturally safe health and wellbeing support for Aboriginal women and families. Birthing, maternal health, child health, and counselling.', '59 Kinghorne Street', 'Nowra', 'NSW', '2541', st_makepoint(150.599, -34.881)::geography, '(02) 4421 7400', 'https://www.waminda.org.au', 'Mon-Fri 9am-5pm', 'Aboriginal and Torres Strait Islander women and their families', true, false, false, false, 'published', 'Synthetic seed data'),
    ('Aboriginal Legal Service Nowra', 'Legal', 'Criminal and family law', ARRAY['Legal', 'Bail', 'Family', 'Aboriginal-led'], 'Criminal law, care and protection, family law, and referral pathways for Aboriginal and Torres Strait Islander people.', '62 Plunkett Street', 'Nowra', 'NSW', '2541', st_makepoint(150.599, -34.883)::geography, '1800 733 233', 'https://www.alsnswact.org.au', 'Mon-Fri 9am-5pm', 'Aboriginal and Torres Strait Islander people', true, false, false, true, 'published', 'Synthetic seed data'),
    ('13YARN', 'Crisis', 'Aboriginal crisis support', ARRAY['Crisis', '24/7', 'Yarn', 'Aboriginal-led'], 'Aboriginal and Torres Strait Islander crisis support line. Talk with a trained Aboriginal or Torres Strait Islander crisis supporter.', 'National phone service', 'National', 'Australia', '', st_makepoint(151.209, -33.868)::geography, '13 92 76', 'https://www.13yarn.org.au', '24 hours, 7 days a week', 'Aboriginal and Torres Strait Islander people', true, true, true, true, 'published', 'Synthetic seed data'),
    ('Mission Australia Nowra', 'Housing', 'Homelessness and housing support', ARRAY['Housing', 'Homelessness', 'Support'], 'Homelessness support, housing assistance, financial counselling, and family support for people in the Shoalhaven region.', '49 Kinghorne Street', 'Nowra', 'NSW', '2541', st_makepoint(150.601, -34.881)::geography, '1800 176 888', '', 'Mon-Fri 9am-5pm', 'People experiencing homelessness or at risk', false, false, true, true, 'published', 'Synthetic seed data'),
    ('Housing NSW Nowra', 'Housing', 'Public housing', ARRAY['Housing', 'Government', 'Rental'], 'NSW public housing applications, tenancy management, and housing assistance for eligible residents.', '42 Berry Street', 'Nowra', 'NSW', '2541', st_makepoint(150.600, -34.882)::geography, '1800 422 322', '', 'Mon-Fri 9am-4:30pm', 'NSW residents eligible for public housing', false, false, false, true, 'published', 'Synthetic seed data'),
    ('headspace Nowra', 'Mental Health', 'Youth mental health', ARRAY['Youth', 'Mental Health', 'Counselling', 'Health'], 'Free and confidential youth mental health support for 12-25 year olds. Counselling, GP, and group programs.', '62-64 Kinghorne Street', 'Nowra', 'NSW', '2541', st_makepoint(150.600, -34.880)::geography, '(02) 4423 1400', 'https://headspace.org.au', 'Mon-Fri 9am-5pm, Wed until 7pm', 'Young people aged 12-25', false, false, true, true, 'published', 'Synthetic seed data'),
    ('Services Australia Nowra', 'Centrelink', 'Government payments and services', ARRAY['Centrelink', 'Payments', 'Government', 'Support'], 'Centrelink payments, Medicare, and Child Support services. Aboriginal and Torres Strait Islander staff available.', '40-42 Junction Street', 'Nowra', 'NSW', '2541', st_makepoint(150.597, -34.877)::geography, '136 240', 'https://www.servicesaustralia.gov.au', 'Mon-Fri 8:30am-4:30pm', 'Australian residents and citizens', false, false, true, true, 'published', 'Synthetic seed data'),
    ('Aboriginal Legal Service Wollongong', 'Legal', 'Criminal and family law', ARRAY['Legal', 'Youth', 'Family', 'Aboriginal-led'], 'Criminal law, care and protection, family law, and youth justice for Aboriginal and Torres Strait Islander people.', '87-89 Church Street', 'Wollongong', 'NSW', '2500', st_makepoint(150.891, -34.424)::geography, '1800 733 233', '', 'Mon-Fri 9am-5pm', 'Aboriginal and Torres Strait Islander people', true, false, false, true, 'published', 'Synthetic seed data'),
    ('Illawarra Aboriginal Youth Hub', 'Youth', 'Youth programs and support', ARRAY['Youth', 'Culture', 'Education', 'Aboriginal-led'], 'Cultural connection, mentoring, education support, and recreational programs for young people.', '12-14 Market Street', 'Wollongong', 'NSW', '2500', st_makepoint(150.892, -34.423)::geography, '(02) 4229 9477', '', 'Mon-Fri 10am-6pm', 'Aboriginal and Torres Strait Islander young people', true, false, false, true, 'published', 'Synthetic seed data'),
    ('Lifeline', 'Crisis', 'Crisis support and suicide prevention', ARRAY['Crisis', '24/7', 'Phone', 'Counselling'], 'Crisis support and suicide prevention services. Phone, text and online chat available.', 'National phone service', 'National', 'Australia', '', st_makepoint(151.209, -33.868)::geography, '13 11 14', 'https://www.lifeline.org.au', '24 hours, 7 days a week', 'All people in Australia', false, true, true, true, 'published', 'Synthetic seed data'),
    ('Nowra Community Centre', 'Family', 'Community hub', ARRAY['Family', 'Community', 'Support', 'Activities'], 'Community hub offering activities, support groups, information, and referral pathways for local families.', '12 Berry Street', 'Nowra', 'NSW', '2541', st_makepoint(150.601, -34.883)::geography, '(02) 4421 6300', '', 'Mon-Fri 9am-4pm', 'Shoalhaven residents', false, false, false, true, 'published', 'Synthetic seed data'),
    ('TAFE NSW Nowra', 'Education', 'Vocational training', ARRAY['Education', 'Training', 'Skills', 'Employment'], 'Vocational training, certificate courses, and pathway programs. Aboriginal student support available.', 'Cnr Plunkett & Berry Streets', 'Nowra', 'NSW', '2541', st_makepoint(150.598, -34.882)::geography, '131 601', 'https://www.tafensw.edu.au', 'Mon-Fri 8:30am-5pm', 'All residents', false, false, false, false, 'published', 'Synthetic seed data'),
    ('South Coast Outreach Service', 'Addiction', 'Alcohol and drug support', ARRAY['Addiction', 'Health', 'Counselling', 'Support'], 'Free and confidential alcohol and drug counselling, withdrawal support, and referral pathways.', '76 Kinghorne Street', 'Nowra', 'NSW', '2541', st_makepoint(150.601, -34.879)::geography, '1800 808 964', '', 'Mon-Fri 9am-5pm', 'Shoalhaven residents', false, false, false, true, 'published', 'Synthetic seed data'),
    ('Salvation Army Nowra', 'Financial', 'Emergency relief', ARRAY['Financial', 'Emergency', 'Food', 'Support'], 'Emergency relief, food vouchers, financial counselling, and material assistance for people in need.', '2-4 Berry Street', 'Nowra', 'NSW', '2541', st_makepoint(150.602, -34.883)::geography, '(02) 4421 1515', '', 'Mon-Fri 9am-12:30pm', 'People in need', false, false, true, true, 'published', 'Synthetic seed data'),
    ('Gudjagang Ngara Li-Dhi', 'Culture', 'Aboriginal community organisation', ARRAY['Culture', 'Community', 'Elderly', 'Youth', 'Aboriginal-led'], 'Aboriginal community organisation providing cultural programs, aged care, youth services, and community development.', '1/101 Kinghorne Street', 'Nowra', 'NSW', '2541', st_makepoint(150.601, -34.878)::geography, '(02) 4423 0400', '', 'Mon-Fri 9am-5pm', 'Aboriginal and Torres Strait Islander people', true, false, false, false, 'published', 'Synthetic seed data'),
    ('1800RESPECT', 'Crisis', 'Family violence support', ARRAY['Crisis', 'Women', 'Family', '24/7', 'Phone'], 'National sexual assault, domestic and family violence counselling service. Phone and online chat.', 'National phone service', 'National', 'Australia', '', st_makepoint(151.209, -33.868)::geography, '1800 737 732', 'https://www.1800respect.org.au', '24 hours, 7 days a week', 'All people in Australia', false, true, true, true, 'published', 'Synthetic seed data'),
    ('Uniting Nowra', 'Family', 'Family support and counselling', ARRAY['Family', 'Counselling', 'Support', 'Community'], 'Family support, relationship counselling, parenting programs, and community connection services.', '19 Berry Street', 'Nowra', 'NSW', '2541', st_makepoint(150.600, -34.883)::geography, '(02) 4421 7400', '', 'Mon-Fri 9am-5pm', 'Shoalhaven residents', false, false, true, false, 'published', 'Synthetic seed data'),
    ('NDIS Nowra', 'Disability', 'Disability support', ARRAY['Disability', 'NDIS', 'Support', 'Government'], 'NDIS access, planning, and support coordination. Aboriginal and Torres Strait Islander community engagement officers.', '50 Berry Street', 'Nowra', 'NSW', '2541', st_makepoint(150.600, -34.882)::geography, '1800 800 110', 'https://www.ndis.gov.au', 'Mon-Fri 9am-5pm', 'People with disability', false, false, true, true, 'published', 'Synthetic seed data'),
    ('NURSE-ON-CALL', 'Health', 'Free health advice', ARRAY['Health', '24/7', 'Phone', 'Crisis'], 'Free phone service for immediate health advice from a registered nurse. Available 24 hours a day.', 'Phone service', 'National', 'Australia', '', st_makepoint(151.209, -33.868)::geography, '1300 60 60 24', '', '24 hours, 7 days a week', 'All residents', false, false, true, true, 'published', 'Synthetic seed data')
  on conflict do nothing;
end;
$$;
