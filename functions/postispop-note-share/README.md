# Complete note snapshots

Apply `supabase/migrations/20261011034211_note_share_snapshots.sql`, then deploy
`postispop-note-share` with `verify_jwt=false`. Anonymous recipients and guest senders
must work; the gateway must not demand a user JWT. Only the function uses the
service-role key (Supabase's built-in server environment); never put it in the client.
Publish the web reader and include its modules in the next signed APK.

PUT /<random-256-bit-token> accepts AES-GCM bytes up to 50 MiB + 28 bytes.
GET /<token> streams a ready, unexpired object. The key is in the URL fragment;
it is never sent to the server. Snapshot access ends after seven days. Password
protected notes preserve their inner envelope and still require the password.
The share is a point-in-time copy, not a collaborative/live note. External URLs
remain links; actual file attachments and saved captures are included in the copy.
No attachment is silently removed when the complete copy exceeds 50 MiB.

Tables and bucket deny direct anon/authenticated access. Creation is limited to
10 requests / 200 MiB per gateway IP per hour and 1 GiB globally per day, including
failed reserved uploads. These are initial bounded quotas, not a billing promise.
The IP is stored only as a server-keyed HMAC. Confirm the trusted gateway's
x-forwarded-for ordering in the deployment environment; absent IP uses one common
quota. Origin filtering is defense in depth, not authentication. Readers obtain
only ciphertext, and every read rechecks server expiry.

Set the private `postispop_share_settings` row `service_url` to the deployment URL,
then apply `20261011041626_note_share_cleanup.sql`. It creates a dedicated random
cleanup credential inside Vault, stores only its SHA-256 digest in private settings,
and schedules POST /cleanup every 15 minutes. The service-role key is never used
in a scheduled HTTP request. Each call removes at most 20 expired objects and
metadata rows; creation also runs this bounded sweep.
Expired copies cannot be downloaded even before the sweep. Do not manipulate
storage.objects with SQL: deletion must use the Storage API.

Validate the migration locally, deploy against a staging project first, and test
real upload/download, quotas and cleanup before production. Run the project security
advisors after applying it. The local regression uses synthetic media and mocked
transport; it does not prove a deployed function or installed APK works.

On 2026-10-11 the owner authorized production activation. No separate staging
branch was available; the additive private schema was tested locally first.
Both migrations and the function were then deployed to the existing project.
Synthetic live upload/download, password, byte integrity and private bucket checks
passed; the Vault-authorized cleanup invocation returned HTTP 200. Security advisors
show no new WARN/ERROR for this feature. INFO for RLS without policies is intentional:
clients have no privileges and only the server accesses these tables.
