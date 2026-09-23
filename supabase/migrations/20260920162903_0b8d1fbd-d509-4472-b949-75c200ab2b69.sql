ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_provider text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_provider text := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  v_is_oauth boolean := v_provider NOT IN ('email', 'phone');
BEGIN
  INSERT INTO public.profiles (id, display_name, account_type, company_name, avatar_url, auth_provider, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'worker'),
    NEW.raw_user_meta_data->>'company_name',
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    v_provider,
    NOT v_is_oauth
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $function$;