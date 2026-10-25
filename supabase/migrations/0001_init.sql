-- IPO Simplified: initial schema
--
-- Storage model: one row per IPO holding a full, versioned `Ipo` document
-- (see src/lib/types.ts). Every factual field inside `payload` is a
-- SourcedValue: { value, unit, period, citation{sourceId, locator}, status,
-- updatedAt }. The app validates each payload with src/lib/schema.ts before
-- use and refuses invalid records.
--
-- Access: the app reads with the service-role key on the server only.
-- Row level security is enabled with no public policies, so the anon key
-- cannot read or write anything.

create table if not exists public.ipos (
  id            text primary key,
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  data_mode     text not null default 'live' check (data_mode in ('live', 'sample')),
  published     boolean not null default false,
  payload       jsonb not null,
  reviewed_by   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Guardrails mirrored from the app schema.
  constraint payload_slug_matches check (payload->>'slug' = slug),
  constraint payload_mode_matches check (payload->>'dataMode' = data_mode)
);

create index if not exists ipos_published_idx on public.ipos (published);

-- Audit trail of every change to an IPO record (who changed what, when).
create table if not exists public.ipo_revisions (
  id          bigint generated always as identity primary key,
  ipo_id      text not null references public.ipos(id) on delete cascade,
  payload     jsonb not null,
  changed_by  text,
  note        text,
  created_at  timestamptz not null default now()
);

create or replace function public.ipos_touch_and_audit() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  insert into public.ipo_revisions (ipo_id, payload, changed_by)
  values (new.id, new.payload, new.reviewed_by);
  return new;
end $$;

drop trigger if exists ipos_touch_and_audit on public.ipos;
create trigger ipos_touch_and_audit
  before insert or update on public.ipos
  for each row execute function public.ipos_touch_and_audit();

-- Corrections submitted through "Report an error".
create table if not exists public.error_reports (
  id           bigint generated always as identity primary key,
  page         text not null,
  context      text,
  field        text not null,
  description  text not null,
  source_url   text,
  email        text,
  status       text not null default 'new' check (status in ('new', 'confirmed', 'rejected', 'fixed')),
  created_at   timestamptz not null default now()
);

alter table public.ipos enable row level security;
alter table public.ipo_revisions enable row level security;
alter table public.error_reports enable row level security;
-- No policies are created: only the server-side service role can access these tables.
