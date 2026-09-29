-- VAANI Database Initial Migration
-- Tables: profiles, people, calls, call_events, memories
-- Triggers: handle_new_user on auth.users
-- RLS: Enabled on all tables
-- Realtime: Enabled on calls, call_events

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  phone text,
  is_guest boolean default false,
  timezone text default 'Asia/Kolkata',
  memory_enabled boolean default true,
  notify_sms boolean default true,
  notify_email boolean default true,
  onboarded boolean default false,
  created_at timestamptz default now()
);

-- 2. PEOPLE TABLE
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  nickname text,
  relationship text not null,
  phone_e164 text not null,
  language text default 'en',
  voice text default 'claire',
  tone text default 'warm',
  memory_enabled boolean default true,
  tint text default '#F2A65A',
  consent_confirmed boolean default false,
  created_at timestamptz default now()
);

-- 3. CALLS TABLE
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  person_id uuid not null references public.people on delete cascade,
  status text not null default 'scheduled' check (
    status in ('scheduled','connecting','ringing','live','ending','completed','failed','no_answer','declined')
  ),
  notes text,
  personal_message text,
  scheduled_for timestamptz,
  recurrence text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int,
  twilio_call_sid text,
  summary jsonb,
  mood_note text,
  needs_attention boolean default false,
  created_at timestamptz default now()
);

-- 4. CALL_EVENTS TABLE
create table if not exists public.call_events (
  id bigserial primary key,
  call_id uuid not null references public.calls on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  speaker text not null check (speaker in ('vaani','person','system')),
  kind text default 'turn' check (kind in ('turn','memory_used','flag')),
  text text not null,
  at_ms int,
  created_at timestamptz default now()
);

-- 5. MEMORIES TABLE
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  person_id uuid not null references public.people on delete cascade,
  call_id uuid references public.calls on delete set null,
  content text not null,
  kind text default 'other' check (
    kind in ('health','plan','preference','people','moment','other')
  ),
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. PROFILE CREATION TRIGGER ON AUTH.USERS
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    is_guest,
    onboarded
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(new.email, '@', 1), ''),
      case when coalesce(new.is_anonymous, false) then 'Guest' else 'Friend' end
    ),
    coalesce(new.is_anonymous, false),
    false
  )
  on conflict (id) do update
  set
    is_guest = coalesce(new.is_anonymous, public.profiles.is_guest),
    display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.calls enable row level security;
alter table public.call_events enable row level security;
alter table public.memories enable row level security;

-- 8. RLS POLICIES

-- profiles
create policy "Users can select own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- people
create policy "Users can manage own people"
  on public.people for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- calls
create policy "Users can manage own calls"
  on public.calls for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- call_events
create policy "Users can manage own call_events"
  on public.call_events for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- memories
create policy "Users can manage own memories"
  on public.memories for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 9. ENABLE REALTIME SUBSCRIPTIONS
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'calls'
  ) then
    alter publication supabase_realtime add table public.calls;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_events'
  ) then
    alter publication supabase_realtime add table public.call_events;
  end if;
end;
$$;
