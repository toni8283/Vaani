-- Migration 002: Add is_demo to calls
-- Enables demo self-calls initiated from the hero landing page

alter table if exists public.calls 
add column if not exists is_demo boolean default false;
