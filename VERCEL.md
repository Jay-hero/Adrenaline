# Vercel deployment

This checkout now runs Next.js on Vercel with Supabase Auth, Postgres and Storage.
The original Sites deployment remains a separate deployment.

- Framework: Next.js; root: repository root; output: `.next`.
- Build: `npm run build`; start: `npm start`.
- Run smoke checks against a running server using `npm test`. Set `TEST_BASE_URL` to the deployment URL, or start locally on port 3107.
- Public Supabase project configuration is in `lib/supabase/config.ts`. Environment overrides: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- No service-role key is required. Database and storage writes use the signed-in user's session and row-level policies.
- Applied database setup is recorded in `db/vercel-schema.sql`; do not reapply it to the existing project.

## Administrator setup

In Supabase Authentication > Users, create the user `javkhlanbaataru@gmail.com` with a private password and confirm the email. Sign in at `/login`. Only an authenticated user whose email is in `site_admins` can edit content or upload images. Manage that allowlist through the Supabase dashboard, not the public API.

## Payments

QPay still requires the merchant's server-side `QPAY_USERNAME`, `QPAY_PASSWORD`, `QPAY_INVOICE_CODE`, and production `QPAY_BASE_URL`. Optional: `QPAY_CALLBACK_URL`. Payment credentials and a paid transaction were not part of the hosting migration verification.

## Migrated data

Existing site content was copied into Supabase and four existing images were downloaded into `public/migrated`. New uploads use the `site-media` bucket. The habit tracker retains its existing device-local storage behavior; browser data on the old domain is not automatically transferred to the new domain.
