create table "public"."llm_usage_log" (
    "id" uuid not null default gen_random_uuid(),
    "model_id" text not null default ''::text,
    "used_at" timestamp without time zone default now()
);


alter table "public"."llm_usage_log" enable row level security;

CREATE UNIQUE INDEX llm_usage_log_pkey ON public.llm_usage_log USING btree (id);

alter table "public"."llm_usage_log" add constraint "llm_usage_log_pkey" PRIMARY KEY using index "llm_usage_log_pkey";

grant delete on table "public"."llm_usage_log" to "anon";

grant insert on table "public"."llm_usage_log" to "anon";

grant references on table "public"."llm_usage_log" to "anon";

grant select on table "public"."llm_usage_log" to "anon";

grant trigger on table "public"."llm_usage_log" to "anon";

grant truncate on table "public"."llm_usage_log" to "anon";

grant update on table "public"."llm_usage_log" to "anon";

grant delete on table "public"."llm_usage_log" to "authenticated";

grant insert on table "public"."llm_usage_log" to "authenticated";

grant references on table "public"."llm_usage_log" to "authenticated";

grant select on table "public"."llm_usage_log" to "authenticated";

grant trigger on table "public"."llm_usage_log" to "authenticated";

grant truncate on table "public"."llm_usage_log" to "authenticated";

grant update on table "public"."llm_usage_log" to "authenticated";

grant delete on table "public"."llm_usage_log" to "service_role";

grant insert on table "public"."llm_usage_log" to "service_role";

grant references on table "public"."llm_usage_log" to "service_role";

grant select on table "public"."llm_usage_log" to "service_role";

grant trigger on table "public"."llm_usage_log" to "service_role";

grant truncate on table "public"."llm_usage_log" to "service_role";

grant update on table "public"."llm_usage_log" to "service_role";


