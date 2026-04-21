-- ============================================================
-- Morsel — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_color text not null default '#FF8FA3',
  created_at timestamptz not null default now()
);

-- Groups
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default upper(substr(md5(random()::text), 1, 8)),
  admin_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Group membership
create table if not exists group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  drawing_url text not null,
  meal_name text not null,
  caption text,
  mystery_mode boolean not null default false,
  created_at timestamptz not null default now()
);

-- Reactions (unique per user per emoji per post)
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id, emoji)
);

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table posts enable row level security;
alter table reactions enable row level security;
alter table comments enable row level security;

-- Helper: is user a member of a group?
create or replace function is_group_member(gid uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- Helper: is user admin of a group?
create or replace function is_group_admin(gid uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from groups
    where id = gid and admin_id = auth.uid()
  );
$$;

-- Profiles
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());

-- Groups
create policy "groups_select_member" on groups for select
  using (is_group_member(id) or admin_id = auth.uid());
create policy "groups_insert_auth" on groups for insert
  with check (auth.uid() is not null);
create policy "groups_update_admin" on groups for update
  using (is_group_admin(id));
create policy "groups_delete_admin" on groups for delete
  using (is_group_admin(id));

-- Group members
create policy "gm_select_member" on group_members for select
  using (is_group_member(group_id));
create policy "gm_insert_auth" on group_members for insert
  with check (auth.uid() is not null);
create policy "gm_delete_admin_or_self" on group_members for delete
  using (user_id = auth.uid() or is_group_admin(group_id));

-- Posts
create policy "posts_select_member" on posts for select
  using (is_group_member(group_id));
create policy "posts_insert_member" on posts for insert
  with check (user_id = auth.uid() and is_group_member(group_id));
create policy "posts_delete_own" on posts for delete
  using (user_id = auth.uid());

-- Reactions
create policy "reactions_select_member" on reactions for select
  using (
    exists (
      select 1 from posts p
      where p.id = reactions.post_id and is_group_member(p.group_id)
    )
  );
create policy "reactions_insert_member" on reactions for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from posts p
      where p.id = post_id and is_group_member(p.group_id)
    )
  );
create policy "reactions_delete_own" on reactions for delete
  using (user_id = auth.uid());

-- Comments
create policy "comments_select_member" on comments for select
  using (
    exists (
      select 1 from posts p
      where p.id = comments.post_id and is_group_member(p.group_id)
    )
  );
create policy "comments_insert_member" on comments for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from posts p
      where p.id = post_id and is_group_member(p.group_id)
    )
  );
create policy "comments_delete_own" on comments for delete
  using (user_id = auth.uid());

-- ============================================================
-- Storage bucket (run separately in Storage tab or via this SQL)
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('drawings', 'drawings', true)
-- on conflict do nothing;

-- create policy "drawings_select_public" on storage.objects for select
--   using (bucket_id = 'drawings');

-- create policy "drawings_insert_auth" on storage.objects for insert
--   with check (bucket_id = 'drawings' and auth.uid() is not null);
