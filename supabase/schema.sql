-- ============================================================================
-- Stormproof — fake-door MVP schema
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query.
-- It is idempotent, so it is safe to re-run.
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive email

-- ---------------------------------------------------------------------------
-- Shared enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type product_category as enum ('umbrella', 'rainwear');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_tier as enum ('premium', 'standard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type waitlist_reason as enum ('design', 'wind_stability', 'brand_vibe', 'transit_comfort');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1. page_views — top of funnel
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id          uuid primary key default gen_random_uuid(),
  session_id  text        not null,
  path        text        not null default '/',
  referrer    text,
  user_agent  text,
  device      text,                       -- 'mobile' | 'desktop'
  country     text,
  created_at  timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_session_idx    on public.page_views (session_id);
create index if not exists page_views_path_idx       on public.page_views (path);

-- ---------------------------------------------------------------------------
-- 2. card_clicks — premium vs standard intent signal
-- ---------------------------------------------------------------------------
create table if not exists public.card_clicks (
  id          uuid primary key default gen_random_uuid(),
  session_id  text             not null,
  product_id  text             not null,          -- e.g. 'umbrella-premium'
  category    product_category not null,
  tier        product_tier     not null,
  price_inr   integer          not null check (price_inr >= 0),
  created_at  timestamptz      not null default now()
);

create index if not exists card_clicks_created_at_idx on public.card_clicks (created_at desc);
create index if not exists card_clicks_session_idx    on public.card_clicks (session_id);
create index if not exists card_clicks_tier_idx       on public.card_clicks (tier, category);

-- ---------------------------------------------------------------------------
-- 3. standard_survey_responses — MCQ from people who picked the cheap option
--    "Why did you choose this option?"
-- ---------------------------------------------------------------------------
create table if not exists public.standard_survey_responses (
  id           uuid primary key default gen_random_uuid(),
  session_id   text             not null,
  product_id   text             not null,
  category     product_category not null,
  answer_code  char(1)          not null check (answer_code in ('A', 'B', 'C', 'D')),
  answer_label text             not null,
  other_text   text,                                  -- free text when answer_code = 'D'
  created_at   timestamptz      not null default now()
);

create index if not exists survey_created_at_idx on public.standard_survey_responses (created_at desc);
create index if not exists survey_answer_idx     on public.standard_survey_responses (answer_code);
create index if not exists survey_session_idx    on public.standard_survey_responses (session_id);

-- ---------------------------------------------------------------------------
-- 4. waitlist_signups — email capture from people who picked premium
--    "What is the #1 reason you were ready to buy this today?"
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist_signups (
  id          uuid primary key default gen_random_uuid(),
  session_id  text            not null,
  email       citext          not null,
  reason      waitlist_reason not null,
  product_id  text,                                   -- which premium card sent them here
  category    product_category,
  created_at  timestamptz     not null default now(),
  constraint waitlist_signups_email_key unique (email)
);

create index if not exists waitlist_created_at_idx on public.waitlist_signups (created_at desc);
create index if not exists waitlist_reason_idx     on public.waitlist_signups (reason);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The browser only ever holds the anon key, so the anon role is allowed to
-- INSERT and nothing else. Nobody can read the waitlist or the survey with a
-- public key. You read the data from the Supabase dashboard (service role).
-- ---------------------------------------------------------------------------
alter table public.page_views                enable row level security;
alter table public.card_clicks               enable row level security;
alter table public.standard_survey_responses enable row level security;
alter table public.waitlist_signups          enable row level security;

drop policy if exists "anon can insert page_views" on public.page_views;
create policy "anon can insert page_views"
  on public.page_views for insert to anon, authenticated with check (true);

drop policy if exists "anon can insert card_clicks" on public.card_clicks;
create policy "anon can insert card_clicks"
  on public.card_clicks for insert to anon, authenticated with check (true);

drop policy if exists "anon can insert survey" on public.standard_survey_responses;
create policy "anon can insert survey"
  on public.standard_survey_responses for insert to anon, authenticated with check (true);

drop policy if exists "anon can insert waitlist" on public.waitlist_signups;
create policy "anon can insert waitlist"
  on public.waitlist_signups for insert to anon, authenticated with check (true);

-- Deliberately NO select / update / delete policies for anon.

-- ---------------------------------------------------------------------------
-- Reporting views — open these in the SQL editor to read the experiment.
-- ---------------------------------------------------------------------------

-- Headline funnel: views -> clicks -> premium clicks -> waitlist signups.
create or replace view public.v_funnel_summary as
select
  (select count(*) from public.page_views where path = '/')            as landing_page_views,
  (select count(distinct session_id) from public.page_views)           as unique_sessions,
  (select count(*) from public.card_clicks)                            as total_card_clicks,
  (select count(*) from public.card_clicks where tier = 'premium')     as premium_clicks,
  (select count(*) from public.card_clicks where tier = 'standard')    as standard_clicks,
  (select count(*) from public.waitlist_signups)                       as waitlist_signups,
  (select count(*) from public.standard_survey_responses)              as survey_responses,
  round(
    100.0 * (select count(*) from public.card_clicks where tier = 'premium')
    / nullif((select count(*) from public.card_clicks), 0), 2
  )                                                                    as premium_share_pct,
  round(
    100.0 * (select count(*) from public.waitlist_signups)
    / nullif((select count(*) from public.card_clicks where tier = 'premium'), 0), 2
  )                                                                    as premium_click_to_email_pct;

-- Clicks broken out by product.
create or replace view public.v_clicks_by_product as
select product_id, category, tier, price_inr,
       count(*) as clicks,
       count(distinct session_id) as unique_sessions
from public.card_clicks
group by product_id, category, tier, price_inr
order by clicks desc;

-- Why people went cheap.
create or replace view public.v_survey_breakdown as
select answer_code, answer_label,
       count(*) as responses,
       round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 2) as pct
from public.standard_survey_responses
group by answer_code, answer_label
order by responses desc;

-- Why people were ready to pay.
create or replace view public.v_waitlist_breakdown as
select reason,
       count(*) as signups,
       round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 2) as pct
from public.waitlist_signups
group by reason
order by signups desc;
