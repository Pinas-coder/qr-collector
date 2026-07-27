begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  explorer_level integer not null default 1,
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_explorer_level check (explorer_level >= 1),
  constraint valid_streak_days check (streak_days >= 0)
);

create table if not exists public.points_of_interest (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 100,
  curiosity text not null,
  preview_photo_path text,
  exclusive_photo_path text,
  qr_token text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_poi_category check (category in ('Storia', 'Natura', 'Cultura', 'Bonus')),
  constraint valid_poi_latitude check (latitude between -90 and 90),
  constraint valid_poi_longitude check (longitude between -180 and 180),
  constraint valid_poi_radius check (radius_meters > 0)
);

create table if not exists public.scans (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  poi_id uuid not null references public.points_of_interest(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  latitude double precision not null,
  longitude double precision not null,
  distance_meters double precision not null,
  created_at timestamptz not null default now(),
  constraint unique_user_poi_scan unique (user_id, poi_id),
  constraint valid_scan_latitude check (latitude between -90 and 90),
  constraint valid_scan_longitude check (longitude between -180 and 180),
  constraint valid_scan_distance check (distance_meters >= 0)
);

create index if not exists scans_user_id_idx on public.scans(user_id);
create index if not exists scans_poi_id_idx on public.scans(poi_id);
create index if not exists scans_scanned_at_idx on public.scans(scanned_at desc);
create index if not exists points_of_interest_active_idx on public.points_of_interest(is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists points_of_interest_set_updated_at on public.points_of_interest;
create trigger points_of_interest_set_updated_at before update on public.points_of_interest
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

commit;
