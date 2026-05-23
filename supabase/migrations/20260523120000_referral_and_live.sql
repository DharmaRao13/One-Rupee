-- Increment referrer counts when a new user registers with referred_by
CREATE OR REPLACE FUNCTION public.apply_referral_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_row public.users_ledger%ROWTYPE;
  new_count integer;
  ref_rank integer;
  total_n integer;
  badge_list text[];
BEGIN
  IF NEW.referred_by IS NULL OR NEW.referred_by = '' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO ref_row FROM public.users_ledger
  WHERE referral_code = NEW.referred_by
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  new_count := COALESCE(ref_row.referral_count, 0) + 1;

  SELECT COUNT(*)::integer INTO total_n FROM public.users_ledger;
  SELECT (total_n - sub.idx + 1)::integer INTO ref_rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS idx
    FROM public.users_ledger
  ) sub
  WHERE sub.id = ref_row.id;

  badge_list := ARRAY[]::text[];
  IF ref_rank <= 10 THEN badge_list := badge_list || 'og_10'; END IF;
  IF ref_rank <= 100 THEN badge_list := badge_list || 'top_100'; END IF;
  IF ref_rank <= 500 THEN badge_list := badge_list || 'top_500'; END IF;
  IF new_count >= 3 THEN badge_list := badge_list || 'referrer_3'; END IF;
  IF new_count >= 10 THEN badge_list := badge_list || 'referrer_10'; END IF;
  IF ref_row.tier = 'premium' THEN badge_list := badge_list || 'premium'; END IF;

  UPDATE public.users_ledger
  SET referral_count = new_count, badges = badge_list
  WHERE id = ref_row.id;

  UPDATE public.referral_stats
  SET referral_count = new_count
  WHERE referral_code = NEW.referred_by;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_referral ON public.users_ledger;
CREATE TRIGGER trg_apply_referral
  AFTER INSERT ON public.users_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_referral_on_insert();
