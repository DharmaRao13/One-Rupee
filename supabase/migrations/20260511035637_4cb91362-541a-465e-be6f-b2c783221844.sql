
-- Drop old
DROP TABLE IF EXISTS public.paid_sessions CASCADE;
DROP TABLE IF EXISTS public.donors CASCADE;

-- users_ledger
CREATE TABLE public.users_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 30),
  amount_paid integer NOT NULL DEFAULT 1,
  razorpay_payment_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ledger"
  ON public.users_ledger FOR SELECT
  USING (true);

-- site_stats (single row, id=1)
CREATE TABLE public.site_stats (
  id integer PRIMARY KEY,
  total_payers integer NOT NULL DEFAULT 0
);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stats"
  ON public.site_stats FOR SELECT
  USING (true);

INSERT INTO public.site_stats (id, total_payers) VALUES (1, 0);

-- Trigger to increment count
CREATE OR REPLACE FUNCTION public.increment_total_payers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_stats SET total_payers = total_payers + 1 WHERE id = 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_users_ledger_insert
  AFTER INSERT ON public.users_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_total_payers();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users_ledger;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_stats;
