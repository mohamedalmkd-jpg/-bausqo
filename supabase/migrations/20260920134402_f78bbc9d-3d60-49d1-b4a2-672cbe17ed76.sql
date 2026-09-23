CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  account_type TEXT NOT NULL DEFAULT 'worker',
  company_name TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Sonstiges',
  contract_type TEXT NOT NULL DEFAULT 'Direktauftrag',
  postal_code TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km INTEGER NOT NULL DEFAULT 50,
  start_date DATE,
  duration TEXT,
  workers_needed INTEGER NOT NULL DEFAULT 1,
  budget_min NUMERIC,
  budget_max NUMERIC,
  requirements TEXT,
  media_paths TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX jobs_status_idx ON public.jobs (status, published_at DESC);
CREATE INDEX jobs_creator_idx ON public.jobs (creator_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT ON public.jobs TO anon;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_public_read" ON public.jobs FOR SELECT USING (status = 'published' AND visibility = 'public');
CREATE POLICY "jobs_owner_read" ON public.jobs FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "jobs_owner_insert" ON public.jobs FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "jobs_owner_update" ON public.jobs FOR UPDATE TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "jobs_owner_delete" ON public.jobs FOR DELETE TO authenticated USING (creator_id = auth.uid());

CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  available_from DATE,
  status TEXT NOT NULL DEFAULT 'Neu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_applicant_read" ON public.job_applications FOR SELECT TO authenticated USING (applicant_id = auth.uid());
CREATE POLICY "applications_owner_read" ON public.job_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.creator_id = auth.uid()));
CREATE POLICY "applications_insert_own" ON public.job_applications FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid() AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.creator_id <> auth.uid()));
CREATE POLICY "applications_owner_update" ON public.job_applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.creator_id = auth.uid()));
CREATE POLICY "applications_applicant_delete" ON public.job_applications FOR DELETE TO authenticated USING (applicant_id = auth.uid());

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs ON DELETE SET NULL,
  subject TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_participant_read" ON public.conversations FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND recipient_id <> auth.uid());
CREATE POLICY "conversations_participant_update" ON public.conversations FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (created_by = auth.uid() OR recipient_id = auth.uid());

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_participant_read" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.created_by = auth.uid() OR c.recipient_id = auth.uid())));
CREATE POLICY "messages_participant_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.created_by = auth.uid() OR c.recipient_id = auth.uid())));

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_own_delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_own_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_jobs_own_all" ON public.saved_jobs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, account_type, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'worker'),
    NEW.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.notify_on_application() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id UUID; job_title TEXT;
BEGIN
  SELECT creator_id, title INTO owner_id, job_title FROM public.jobs WHERE id = NEW.job_id;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (owner_id, 'Bewerbung', 'Neue Bewerbung', 'Neue Bewerbung auf: ' || job_title, '/auftrag/' || NEW.job_id);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NEW.applicant_id, 'Bewerbung', 'Status Ihrer Bewerbung', job_title || ': ' || NEW.status, '/auftrag/' || NEW.job_id);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER job_applications_notify AFTER INSERT OR UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.notify_on_application();

CREATE OR REPLACE FUNCTION public.notify_on_message() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target UUID; subj TEXT;
BEGIN
  SELECT CASE WHEN c.created_by = NEW.sender_id THEN c.recipient_id ELSE c.created_by END, c.subject
    INTO target, subj FROM public.conversations c WHERE c.id = NEW.conversation_id;
  UPDATE public.conversations SET last_message_at = now() WHERE id = NEW.conversation_id;
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (target, 'Nachricht', 'Neue Nachricht', COALESCE(NULLIF(subj, ''), 'Neue Nachricht'), '/nachrichten?c=' || NEW.conversation_id);
  RETURN NEW;
END; $$;
CREATE TRIGGER messages_notify AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

CREATE POLICY "job_media_read_authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'job-media');
CREATE POLICY "job_media_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "job_media_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'job-media' AND (storage.foldername(name))[1] = auth.uid()::text);