-- ============================================================
-- Morsel — Demo Seed Data
-- Run AFTER schema.sql. Replace UUIDs with real auth user IDs
-- from Supabase Auth → Users after creating 3 demo accounts.
-- ============================================================

-- Step 1: Create 3 users via Supabase Auth UI or magic link
-- Then replace these placeholder UUIDs:
-- USER_1_UUID = carmen's account
-- USER_2_UUID = friend 1
-- USER_3_UUID = friend 2

-- Step 2: Insert profiles (or let onboarding do it)
insert into profiles (id, username, avatar_color) values
  ('USER_1_UUID', 'carmen', '#FF8FA3'),
  ('USER_2_UUID', 'yuki', '#A8D8EA'),
  ('USER_3_UUID', 'mira', '#FFD166')
on conflict do nothing;

-- Step 3: Create demo group
insert into groups (id, name, invite_code, admin_id) values
  ('00000000-0000-0000-0000-000000000001', 'Lunch Club 🥗', 'MORSEL01', 'USER_1_UUID')
on conflict do nothing;

-- Step 4: Add members
insert into group_members (group_id, user_id) values
  ('00000000-0000-0000-0000-000000000001', 'USER_1_UUID'),
  ('00000000-0000-0000-0000-000000000001', 'USER_2_UUID'),
  ('00000000-0000-0000-0000-000000000001', 'USER_3_UUID')
on conflict do nothing;

-- Step 5: Posts (drawing_url will be placeholder; replace with real Supabase Storage URLs)
-- For demo, use a solid-color SVG data URL or upload placeholder images first
insert into posts (id, group_id, user_id, drawing_url, meal_name, caption, created_at) values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'USER_1_UUID',
    'https://placehold.co/400x400/FF8FA3/FFFFFF?text=🍜',
    'Spicy ramen',
    'desk lunch hits different when you drew it yourself',
    now() - interval '3 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'USER_2_UUID',
    'https://placehold.co/400x400/A8D8EA/FFFFFF?text=🥑',
    'Avocado toast',
    'basic and proud',
    now() - interval '5 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'USER_3_UUID',
    'https://placehold.co/400x400/FFD166/FFFFFF?text=🍕',
    'Leftover pizza',
    null,
    now() - interval '1 day'
  )
on conflict do nothing;

-- Step 6: Reactions
insert into reactions (post_id, user_id, emoji) values
  ('10000000-0000-0000-0000-000000000001', 'USER_2_UUID', '🤤'),
  ('10000000-0000-0000-0000-000000000001', 'USER_3_UUID', '🔥'),
  ('10000000-0000-0000-0000-000000000002', 'USER_1_UUID', '💅'),
  ('10000000-0000-0000-0000-000000000003', 'USER_1_UUID', '😭'),
  ('10000000-0000-0000-0000-000000000003', 'USER_2_UUID', '😭')
on conflict do nothing;

-- Step 7: Comments
insert into comments (post_id, user_id, content) values
  ('10000000-0000-0000-0000-000000000001', 'USER_2_UUID', 'ok this actually looks amazing'),
  ('10000000-0000-0000-0000-000000000001', 'USER_3_UUID', 'I need that broth recipe'),
  ('10000000-0000-0000-0000-000000000002', 'USER_3_UUID', 'the egg 😭 so good')
on conflict do nothing;
