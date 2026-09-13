# Support and map review

Scope: `origin/main` to the working tree for map-first discovery, fictional IRAAC history, and opt-in human support.

## Coverage

Review performed sequentially in the main agent under the user's tool-mapping instruction. No independent agents or cross-model review ran. Correctness, security, persistence, migration, retry behaviour, frontend lifecycle, accessibility and maintainability were examined. Local Next.js client guidance was read; existing untracked AGENTS.md and CLAUDE.md are excluded from the changes.

The simplification pass reused service images/distances and the existing referral store, kept one canonical YouthScape story, bounded message queries, and retained explicit customer/staff boundaries. New components were formatted for readability. No extra abstraction was introduced for the distinct staff and customer flows.

## Findings addressed

- Map basemap required an API key at runtime. Replaced it with OpenStreetMap image tiles, visually checked, with attribution outside the sheet so it remains visible.
- Map auto-fitting previously moved the initial view away from Nowra. Initial location is now fixed; explicit searches fit matching results.
- Overlapping service coordinates and inaccessible div markers were replaced by selectable groups and labelled keyboard-accessible markers.
- Old demo fixtures could erase appended messages. Upgrade now replaces only known seed IDs and preserves added messages, with idempotence coverage.
- Untrusted assistant-history JSON could break the staff renderer. It now accepts only bounded role/text strings, tested with malformed values.
- A message uniqueness conflict could be treated as delivery without checking the stored record. Retry handling now verifies the matching conversation, body and sender kind.
- Poll success could erase a failed-send notice. Connection errors and send errors are separate.
- Requests could wait indefinitely. Browser Supabase requests now use a 15-second timeout, and polling slows after errors.

## Remaining coverage limits

Live human support is NOT activated. Production has no configured Supabase connection and no approved staff membership. Real Supabase Auth/PostgREST customer-to-staff delivery cannot be verified until those prerequisites exist. The opt-in flag remains off and the UI does not claim a person received a message. The SQL policies were tested on disposable PostgreSQL, not a production project.

The staff inbox and conversation views show bounded recent records (100 conversations/messages). Guest access is tied to the browser's authenticated session. A deployment for real ongoing casework should add permanent account recovery and historical pagination before those limits are reached.

## Actionable Findings

No unresolved defect blocks the map/demo release with human support disabled. Activating live support remains blocked on the identified database, approved staff accounts and two-browser end-to-end validation.

## Verdict

Map and fictional conversation changes are ready for release after the recorded tests/build/browser checks. Human support implementation is ready for integration testing, not for a claim of live human availability.
