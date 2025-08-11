CREATE OR REPLACE FUNCTION public.get_public_daily_stats(_start_date date)
RETURNS TABLE (
  agentid uuid,
  "Agent" text,
  "Email" text,
  "Date" date,
  "Calls" bigint,
  "Live Chat" bigint,
  "Billing Tickets" bigint,
  "Sales Tickets" bigint,
  "Support/DNS Emails" bigint,
  "Social Tickets" bigint,
  "Walk-Ins" bigint,
  avatar text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    ds.agentid,
    ds."Agent" as "Agent",
    NULL::text as "Email",
    ds."Date" as "Date",
    COALESCE(ds."Calls", 0)::bigint as "Calls",
    COALESCE(NULLIF(ds."Live Chat", ''), '0')::bigint as "Live Chat",
    COALESCE(NULLIF(ds."Billing Tickets", ''), '0')::bigint as "Billing Tickets",
    COALESCE(ds."Sales Tickets", 0)::bigint as "Sales Tickets",
    COALESCE(NULLIF(ds."Support/DNS Emails", ''), '0')::bigint as "Support/DNS Emails",
    COALESCE(NULLIF(ds."Social Tickets", ''), '0')::bigint as "Social Tickets",
    COALESCE(NULLIF(ds."Walk-Ins", ''), '0')::bigint as "Walk-Ins",
    COALESCE(cap."Profile", p.avatar) as avatar
  FROM public.daily_stats ds
  LEFT JOIN public.csr_agent_proflie cap 
    ON lower(btrim(cap."Agent")) = lower(btrim(ds."Agent"))
  LEFT JOIN public.profile p 
    ON p.agentid = ds.agentid
  WHERE ds."Date" >= _start_date
$$;

GRANT EXECUTE ON FUNCTION public.get_public_daily_stats(date) TO anon, authenticated;