
CREATE TABLE public.orders (
  order_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  amount integer NOT NULL DEFAULT 100,
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.verified_sessions (
  payment_id text PRIMARY KEY,
  order_id text NOT NULL,
  display_name text,
  verified boolean NOT NULL DEFAULT true,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.verified_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verified sessions"
  ON public.verified_sessions FOR SELECT
  USING (true);
