-- ============================================================
-- TaskFlow — Supabase Schema
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Task Lists ──────────────────────────────────────────────
create table if not exists task_lists (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  color       text not null default '#6366f1',
  icon        text not null default 'LayoutList',
  created_at  timestamptz not null default now()
);

-- ─── Categories ──────────────────────────────────────────────
create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  color      text not null default '#6366f1',
  list_id    uuid not null references task_lists(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── Tasks ───────────────────────────────────────────────────
create table if not exists tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  due_date    timestamptz,
  priority    text not null default 'medium'
                check (priority in ('urgent','high','medium','low')),
  status      text not null default 'todo'
                check (status in ('todo','in_progress','done')),
  category_id uuid references categories(id) on delete set null,
  list_id     uuid not null references task_lists(id) on delete cascade,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Auto-update updated_at ──────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists tasks_list_id_idx      on tasks(list_id);
create index if not exists tasks_due_date_idx     on tasks(due_date);
create index if not exists tasks_status_idx       on tasks(status);
create index if not exists tasks_priority_idx     on tasks(priority);
create index if not exists categories_list_id_idx on categories(list_id);

-- ─── RLS (Row Level Security) — enable for production auth ───
-- For now using public access. When you add Supabase Auth, uncomment:
-- alter table task_lists enable row level security;
-- alter table tasks enable row level security;
-- alter table categories enable row level security;

-- ─── Seed: Default list ───────────────────────────────────────
insert into task_lists (name, description, color, icon)
values ('My Tasks', 'Your default task list', '#6366f1', 'CheckSquare')
on conflict do nothing;
