create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "users read own roles" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create table public.search_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  query text not null,
  location text,
  result_count integer not null default 0,
  duration_ms integer,
  ok boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);

create index search_logs_provider_created_idx on public.search_logs (provider, created_at desc);

grant all on public.search_logs to service_role;
grant select on public.search_logs to authenticated;

alter table public.search_logs enable row level security;

create policy "admins read search logs" on public.search_logs
for select to authenticated using (public.has_role(auth.uid(), 'admin'));