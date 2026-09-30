-- Migration 004: Add pronouns column to people table
alter table people add column if not exists pronouns text default 'they' check (pronouns in ('she','he','they'));
