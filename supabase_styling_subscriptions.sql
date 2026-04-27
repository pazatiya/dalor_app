-- ============================================================
-- DALOR Weekly Styling Plan Registrations
-- Table: styling_subscriptions
-- Description: Stores customer sign-ups for DALOR styling plans,
--              including one-time and recurring weekly subscriptions.
-- ============================================================

create table if not exists styling_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  phone       text        not null,
  plan_type   text        not null check (plan_type in ('onetime', 'weekly')),
  status      text        not null default 'pending',
  created_at  timestamptz not null default now()
);
