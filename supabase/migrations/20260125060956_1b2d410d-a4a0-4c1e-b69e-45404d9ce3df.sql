-- Create donors table
CREATE TABLE public.donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  razorpay_order_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 100,
  country TEXT DEFAULT 'IN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Everyone can read donors (public wall)
CREATE POLICY "Anyone can view donors"
  ON public.donors
  FOR SELECT
  USING (true);

-- Only authenticated operations via edge function (using service role)
-- No direct insert from clients

-- Create paid_sessions table to track who has paid
CREATE TABLE public.paid_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.paid_sessions ENABLE ROW LEVEL SECURITY;

-- No direct client access - managed by edge function
CREATE POLICY "No direct access to paid_sessions"
  ON public.paid_sessions
  FOR SELECT
  USING (false);

-- Enable realtime for donors
ALTER PUBLICATION supabase_realtime ADD TABLE public.donors;