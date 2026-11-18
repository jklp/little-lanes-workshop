CREATE TABLE public.account_plans (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','basic','premium')),
 card_count integer NOT NULL DEFAULT 0 CHECK (card_count >= 0)
);
GRANT SELECT ON public.account_plans TO authenticated;
GRANT ALL ON public.account_plans TO service_role;
ALTER TABLE public.account_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own plan" ON public.account_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
INSERT INTO public.account_plans(user_id, card_count) SELECT p.id, count(c.id)::integer FROM public.profiles p LEFT JOIN public.cards c ON c.user_id=p.id GROUP BY p.id;
CREATE OR REPLACE FUNCTION public.initialize_account_plan() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$ BEGIN INSERT INTO public.account_plans(user_id) VALUES (NEW.id); RETURN NEW; END; $$;
CREATE TRIGGER initialize_account_plan AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.initialize_account_plan();
CREATE OR REPLACE FUNCTION public.enforce_card_allowance() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Card ownership cannot be changed'; END IF;
  RETURN NEW;
 ELSIF TG_OP='DELETE' THEN
  UPDATE public.account_plans SET card_count=greatest(0,card_count-1) WHERE user_id=OLD.user_id;
  RETURN OLD;
 END IF;
 UPDATE public.account_plans SET card_count=card_count+1 WHERE user_id=NEW.user_id AND (plan IN ('basic','premium') OR card_count < 10);
 IF NOT FOUND THEN RAISE EXCEPTION 'Free accounts are limited to 10 cards across all boards. Upgrade for unlimited cards.'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER enforce_card_allowance BEFORE INSERT OR UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.enforce_card_allowance();
CREATE TRIGGER decrement_card_allowance AFTER DELETE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.enforce_card_allowance();
CREATE OR REPLACE FUNCTION public.sync_account_name() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 UPDATE public.profiles SET first_name=COALESCE(NEW.raw_user_meta_data->>'first_name',''), last_name=COALESCE(NEW.raw_user_meta_data->>'last_name','') WHERE id=NEW.id;
 RETURN NEW;
END; $$;
CREATE TRIGGER sync_account_name AFTER UPDATE OF email,raw_user_meta_data ON auth.users FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data) EXECUTE FUNCTION public.sync_account_name();
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE ALL ON FUNCTION public.initialize_account_plan() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_card_allowance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_account_name() FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON public.cards(user_id);