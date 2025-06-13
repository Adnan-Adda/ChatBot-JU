create table public.llm_usage_log (
  id uuid default gen_random_uuid() primary key,
  model_id text not null,
  used_at timestamp not null default now()
);