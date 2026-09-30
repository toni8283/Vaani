-- Migration 003: Make people.phone_e164 nullable for browser-only calls
-- In Phase 8, browser call is the primary/only way calls happen unless NEXT_PUBLIC_PHONE_CALLS=true

alter table if exists public.people 
alter column phone_e164 drop not null;

-- Ensure calls table has channel and fallback_available columns
alter table if exists public.calls 
add column if not exists channel text default 'browser';

alter table if exists public.calls 
add column if not exists fallback_available boolean default false;
