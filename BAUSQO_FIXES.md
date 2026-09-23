# BauSqo fixes

- OAuth now returns to `/auth` so Supabase can finish the callback reliably.
- Supabase auth explicitly persists sessions, refreshes tokens, detects OAuth sessions in the URL, and uses PKCE.
- Removed the unused Lovable auth import from the app auth provider.
- Direct customer-to-customer chat added to Nachrichten via “Neuer Chat”.
- Existing project-linked chat remains available.
- Message and conversation inserts refresh the inbox in real time when Supabase Realtime is enabled for those tables.
