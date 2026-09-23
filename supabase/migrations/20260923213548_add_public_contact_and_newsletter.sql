create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_length check (char_length(email) between 5 and 320),
  constraint newsletter_subscribers_status_check check (status in ('active', 'unsubscribed'))
);

create unique index newsletter_subscribers_email_lower_key
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;
grant insert on table public.newsletter_subscribers to anon, authenticated;

create policy "website_can_subscribe_newsletter"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (
    source = 'website'
    and status = 'active'
    and char_length(email) between 5 and 320
  );

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint contact_requests_name_length check (char_length(name) between 2 and 120),
  constraint contact_requests_email_length check (char_length(email) between 5 and 320),
  constraint contact_requests_subject_length check (char_length(subject) between 2 and 160),
  constraint contact_requests_message_length check (char_length(message) between 10 and 5000),
  constraint contact_requests_status_check check (status in ('new', 'in_progress', 'closed'))
);

alter table public.contact_requests enable row level security;
revoke all on table public.contact_requests from anon, authenticated;
grant insert on table public.contact_requests to anon, authenticated;

create policy "website_can_create_contact_requests"
  on public.contact_requests
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and char_length(name) between 2 and 120
    and char_length(email) between 5 and 320
    and char_length(subject) between 2 and 160
    and char_length(message) between 10 and 5000
  );
