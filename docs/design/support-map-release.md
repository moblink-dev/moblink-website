# Map search and human-support handover

## Product behaviour

Search opens a real OpenStreetMap street map at Nowra (NSW). Leaflet uses raster image tiles so WebGL is unnecessary. Pins open details; nearby directory coordinates cluster into a list. Coordinates are service areas, not verified door addresses. Searching fits matching locations (including IRAAC in Wollongong); the Nowra button resets the view. National telephone services remain in the full directory at `/app/list/`.

The fictional YouthScape history is shared by the customer conversation and Jayden's staff record. Assistant and human adviser messages are named explicitly. Added demo messages survive fixture upgrades. A staff demo reply through the MobLink app channel updates the same browser's referral conversation. No demo message is sent externally.

MobLink human mode no longer produces bot replies or shows a service-directory detour. The separate human channel preserves the assistant conversation. Until configured, it accurately says the support inbox is unavailable.

## Live support implementation and activation blocker

Customer handover and `/staff/support/` are implemented against Supabase. Handover requests explicit sharing consent, a name, optional suburb/postcode, and a bounded snapshot of assistant history. Location is customer-entered, never inferred as GPS. An anonymous authenticated session owns the chat; clearing browser session data loses access unless later linked to a permanent account. Staff sign in with existing credentials and must have an administrator-provisioned `support_staff` membership for `moblink` or `iraac`.

The new support tables are separate from the fictional public CRM. RLS isolates customers and teams and prevents customer impersonation, staff self-enrolment, ownership changes and timestamp forgery. Messages poll every three seconds; this is near-real-time, not presence/read receipts. The UI shows waiting until an actual staff message exists. Retries use the same message UUID. The latest 100 messages are shown, and the staff inbox lists the latest 100 conversations.

Current production has only `MOBLINK_DEMO_MODE`; no Supabase environment variables exist. The two visible cloud projects are inactive. No production database migration or staff-account provisioning was performed. Live support is deliberately disabled; do not claim messages reach people yet.

Activation requires:
1. An active, identified MobLink Supabase project (do not silently reuse IRAAC's database).
2. Apply `supabase/migrations/20260913155455_support_conversations.sql` after checking the target. This migration adds only new tables/policies/indexes.
3. Enable anonymous Auth sign-ins, including appropriate Auth abuse protection for public use.
4. Provision approved named staff accounts and `support_staff` rows. Membership must not come from user-editable metadata.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SUPPORT_ENABLED=true` for the intended deployment; rebuild.
6. Verify customer-to-staff and staff-to-customer delivery in separate browser profiles, reconnect, retries, consent snapshot, and revocation before enabling public use. Cloud Auth/PostgREST end-to-end verification remains blocked until activation.

Rollback: disable `NEXT_PUBLIC_SUPPORT_ENABLED` and rebuild. Retain support records; do not drop tables with real conversations.

## Verification

46 Node tests pass. Production build passes. Disposable PostgreSQL 17 executed the migration and `supabase/tests/support-chat.sql`: customer/staff delivery, cross-customer denial, cross-team denial, staff impersonation denial, self-enrolment denial, anonymous denial and ownership/team mutation denial all passed. Test fixtures were rolled back. The test database uses a minimal Auth shim, so it proves PostgreSQL policies, not live Supabase Auth.

Mobile browser checks cover real map tiles, pin interaction, search filtering, navigation, IRAAC mode changes, unavailable human support, and a staff demo reply verified in Jayden’s customer conversation. Production activation requires the separate end-to-end check above.

## References

- [Leaflet API](https://leafletjs.com/reference.html)
- [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/): normal browser requests, visible attribution, cache defaults, no bulk prefetch or offline downloads.
- [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous)
