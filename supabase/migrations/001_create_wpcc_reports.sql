-- WPCC Smart Report Builder: anonymous report storage.
-- Run this migration in Supabase SQL Editor before using the hosted database.
-- The app has no login by design, so the anon role needs CRUD access to this table.

create table if not exists public.wpcc_reports (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  department text,
  status text not null default 'Draft',
  report_type text,
  branch text,
  prepared_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists wpcc_reports_updated_at_idx
  on public.wpcc_reports (updated_at desc);

create index if not exists wpcc_reports_department_idx
  on public.wpcc_reports (department);

alter table public.wpcc_reports enable row level security;

drop policy if exists "WPCC reports are readable without login" on public.wpcc_reports;
create policy "WPCC reports are readable without login"
  on public.wpcc_reports for select
  to anon, authenticated
  using (true);

drop policy if exists "WPCC reports can be created without login" on public.wpcc_reports;
create policy "WPCC reports can be created without login"
  on public.wpcc_reports for insert
  to anon, authenticated
  with check (true);

drop policy if exists "WPCC reports can be edited without login" on public.wpcc_reports;
create policy "WPCC reports can be edited without login"
  on public.wpcc_reports for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "WPCC reports can be deleted without login" on public.wpcc_reports;
create policy "WPCC reports can be deleted without login"
  on public.wpcc_reports for delete
  to anon, authenticated
  using (true);

create or replace function public.set_wpcc_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists wpcc_reports_updated_at on public.wpcc_reports;
create trigger wpcc_reports_updated_at
before update on public.wpcc_reports
for each row execute function public.set_wpcc_reports_updated_at();
