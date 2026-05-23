
ALTER TABLE public.users_ledger
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS tier_payment_id text;

CREATE UNIQUE INDEX IF NOT EXISTS users_ledger_referral_code_key ON public.users_ledger(referral_code) WHERE referral_code IS NOT NULL;

ALTER TABLE public.site_stats
  ADD COLUMN IF NOT EXISTS leaderboard_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS payment_enabled boolean NOT NULL DEFAULT true;

INSERT INTO public.site_stats (id, total_payers, leaderboard_enabled, payment_enabled)
VALUES (1, 0, true, true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins update stats" ON public.site_stats;
CREATE POLICY "Admins update stats" ON public.site_stats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  razorpay_payment_id text,
  display_name text,
  amount integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'success',
  tier text NOT NULL DEFAULT 'standard',
  user_id uuid REFERENCES public.users_ledger(id) ON DELETE SET NULL
);
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage payment logs" ON public.payment_logs;
CREATE POLICY "Admins manage payment logs" ON public.payment_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  target text,
  performed_by text
);
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage activity log" ON public.admin_activity_log;
CREATE POLICY "Admins manage activity log" ON public.admin_activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.referral_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users_ledger(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referral_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view referral stats" ON public.referral_stats;
CREATE POLICY "Anyone view referral stats" ON public.referral_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage referral stats" ON public.referral_stats;
CREATE POLICY "Admins manage referral stats" ON public.referral_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  step text NOT NULL,
  session_id text NOT NULL,
  referral_code text,
  tier text
);
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone insert funnel events" ON public.funnel_events;
CREATE POLICY "Anyone insert funnel events" ON public.funnel_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins read funnel events" ON public.funnel_events;
CREATE POLICY "Admins read funnel events" ON public.funnel_events FOR SELECT TO authenticated USING (true);

DROP TRIGGER IF EXISTS trg_increment_total_payers ON public.users_ledger;
CREATE TRIGGER trg_increment_total_payers
  AFTER INSERT ON public.users_ledger
  FOR EACH ROW EXECUTE FUNCTION public.increment_total_payers();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_stats'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_stats';
  END IF;
END $$;
