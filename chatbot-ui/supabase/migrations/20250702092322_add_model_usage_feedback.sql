create table public.model_usage_feedback (
  model_id text not null primary key,
  thumbup int not null default 0,
  thumbdown int not null default 0
);

