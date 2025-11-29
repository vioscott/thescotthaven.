-- Analytics Schema Migration
-- Run this in your Supabase SQL Editor to add analytics tracking
-- This script is safe to run multiple times (idempotent)

-- Property Views table for tracking individual property views
create table if not exists public.property_views (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid not null,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  viewer_city text,
  viewer_state text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key constraint (references properties table)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'property_views_property_id_fkey'
  ) then
    alter table public.property_views
      add constraint property_views_property_id_fkey
      foreign key (property_id)
      references public.properties(id)
      on delete cascade;
  end if;
end $$;

-- Indexes for efficient querying
create index if not exists property_views_property_id_idx on public.property_views (property_id);
create index if not exists property_views_viewed_at_idx on public.property_views (viewed_at);
create index if not exists property_views_property_date_idx on public.property_views (property_id, viewed_at);

-- Enable RLS
alter table public.property_views enable row level security;

-- RLS Policies
-- Anyone can insert views (for tracking)
drop policy if exists "Anyone can track property views" on public.property_views;
create policy "Anyone can track property views" on public.property_views
  for insert with check (true);

-- Property owners can view analytics for their properties
drop policy if exists "Owners can view their property analytics" on public.property_views;
create policy "Owners can view their property analytics" on public.property_views
  for select using (
    exists (
      select 1 from public.properties
      where properties.id = property_views.property_id
      and properties.user_id = auth.uid()
    )
  );

-- Admins can view all analytics
drop policy if exists "Admins can view all analytics" on public.property_views;
create policy "Admins can view all analytics" on public.property_views
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Optional: Create a materialized view for faster analytics queries
-- This pre-computes daily view counts per property
create materialized view if not exists public.property_analytics_daily as
select
  property_id,
  date_trunc('day', viewed_at) as view_date,
  count(*) as view_count
from public.property_views
group by property_id, date_trunc('day', viewed_at);

-- Index on materialized view
create index if not exists property_analytics_daily_property_id_idx on public.property_analytics_daily (property_id);
create index if not exists property_analytics_daily_date_idx on public.property_analytics_daily (view_date);

-- Function to refresh the materialized view (call this periodically or via cron)
create or replace function refresh_property_analytics()
returns void as $$
begin
  refresh materialized view public.property_analytics_daily;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function refresh_property_analytics() to authenticated;
