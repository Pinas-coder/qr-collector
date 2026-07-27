-- Prerequisiti: le tabelle public.profiles, public.points_of_interest e
-- public.scans devono essere state create da una migration precedente.

begin;

-- La view documenta il contratto pubblico dei POI. Con security_invoker non
-- aggira RLS né i privilegi della tabella sottostante.
create or replace view public.public_points_of_interest
with (security_invoker = true)
as
select
  id,
  slug,
  name,
  category,
  latitude,
  longitude,
  radius_meters,
  preview_photo_path
from public.points_of_interest
where is_active = true;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.points_of_interest from anon, authenticated;
revoke all on table public.scans from anon, authenticated;
revoke all on table public.public_points_of_interest from anon, authenticated;

-- Non viene concesso SELECT sulla view: con security_invoker richiederebbe
-- privilegi sulla tabella sottostante, che contiene colonne sensibili.
-- L'interfaccia pubblica principale è la RPC limitata qui sotto.

-- La funzione esegue una query a colonne esplicitamente consentite. Il tipo di
-- ritorno della view evita di duplicare i tipi SQL delle colonne.
create or replace function public.get_public_points_of_interest()
returns setof public.public_points_of_interest
language sql
security definer
set search_path = ''
as $$
  select
    id,
    slug,
    name,
    category,
    latitude,
    longitude,
    radius_meters,
    preview_photo_path
  from public.points_of_interest
  where is_active = true;
$$;

revoke all on function public.get_public_points_of_interest() from public, anon, authenticated;
grant execute on function public.get_public_points_of_interest() to authenticated;

alter table public.profiles enable row level security;
alter table public.points_of_interest enable row level security;
alter table public.scans enable row level security;

grant select on table public.profiles to authenticated;
grant select on table public.scans to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can read own scans" on public.scans;
create policy "Users can read own scans"
on public.scans
for select
to authenticated
using (auth.uid() = user_id);

commit;
