# Flazly — Meta App Review Root-Cause Audit

**App ID:** 955338716906984
**Audit date:** 2026-10-24
**Repo state audited:** `main` @ `916b6d9` (= `origin/main`), plus uncommitted working tree

---

## 0. Executive summary — the single most important finding

**The comment-management feature and the Human Agent tag did not exist in the deployed
application on any of the three submission dates.** They exist only as *uncommitted*
changes in the local working tree.

Evidence chain, each link verified:

| Fact | Evidence |
|---|---|
| Production deploys only committed code on `origin/main` | `.github/workflows/deploy.yml` runs `git fetch --all` then `git reset --hard origin/main` |
| `main` and `origin/main` are identical | `git rev-parse HEAD origin/main` → both `916b6d9…`; `git log origin/main..HEAD` → empty |
| `replyToComment` / `getComments` / `getMedia` / `hideComment` / `deleteComment` were never committed | `git log -S "replyToComment" -- backend/src/` → **no commits** |
| The Comments Manager UI was never committed | `frontend/src/pages/CommentsManager.tsx` is untracked (`??` in `git status`) |
| The `comments` webhook field was never subscribed | `git diff` shows `subscribed_fields: ['messages','messaging_postbacks']` → `[…,'comments']` as an *uncommitted* change |
| The `HUMAN_AGENT` tag never shipped | `git diff` shows the entire `isHumanAgent` branch of `sendInstagramMessage` as *uncommitted* |
| Last commit predates nothing relevant | Last commit `916b6d9` "ui changes" is 2026-10-12 — after all three submissions |

Submission timeline vs. what was actually live:

| Date | Permission outcome | What was deployed |
|---|---|---|
| 2026-07-01 | `instagram_business_basic`, `…manage_messages`, `…manage_comments`, Human Agent — all rejected | No comment UI, no comment API calls, no `comments` webhook, no Human Agent tag |
| 2026-08-30 | basic + messages **approved**; `…manage_comments` + Human Agent rejected | Same — commit `0cdbe02` that day only made FB login visible and exposed settings |
| 2026-09-13 | `…manage_comments` + Human Agent rejected again | Same. Only commits since were `6c78f79`/`add3f76` (meta page) |

So a reviewer following the instructions had **no screen on which to view an Instagram
comment, no button to reply to one, and no code path that ever called the comments
endpoints**. Nothing could have been approved. The same is true of Human Agent: no request
the app made ever carried `messaging_type=MESSAGE_TAG` / `tag=HUMAN_AGENT`.

**Second, independent root cause:** even with the code deployed, the requested permission
family is wrong for the implemented login flow (§3.1). That must be fixed too, or the next
submission fails for a different reason.

### 0.1 Reviewer feedback received — what it confirms and what it corrects

The Sept 13 rejection notes are now available. They **confirm the root cause** and
**narrow the fix list**. Two citations:

**Human Agent — "Unable to Locate Facebook Login", Platform Term 7.a**
> "although we could access the app, we weren't able to find the Facebook Login button for
> testing during our review."

Verified in the repo: the **deployed** `Login.tsx` and `Signup.tsx` contain **no Facebook
Login button at all** —
```
git show HEAD:frontend/src/pages/Login.tsx | grep -i facebook   →  (no output)
git show HEAD:frontend/src/pages/Signup.tsx | grep -i facebook  →  (no output)
```
The only Facebook Login button in production was **inside the authenticated dashboard** at
`/meta-integration`. A reviewer who signed in with the supplied credentials had to guess
their way to a sidebar item to find it. Commit `0cdbe02` (2026-08-30, *"make FB login
visible…"*) tried to address this and was still rejected on Sept 13.

The uncommitted working tree adds exactly the missing button to both pages — **still not
deployed.** This is a one-deploy fix.

**`instagram_business_manage_comments` — "Screencast Not Aligned with Use Case Details", Developer Policy 1.6**
> "We have determined that your apps' use case **is allowed**, however, the submitted
> screencast fails to demonstrate the end-to-end experience of the use case described in
> the submission notes."

This is the single most useful sentence in the whole audit, and it **corrects two of my
earlier conclusions**:

1. **Your use case is approved on its merits.** Do not change, narrow or drop the comment
   permission request. Nothing about the justification needs rewriting.
2. **Meta rejected the video, not the code.** They did not test your API calls or your
   permission wiring. That is entirely consistent with §0: the screencast *could not* show
   end-to-end comment management because the feature did not exist to film.

**Correction to §3.1.** I previously assessed the permission-family mismatch as a decisive
blocker, on the grounds that the reviewer would fail the "demonstrate the complete
Instagram login process" criterion immediately. The feedback shows otherwise: Meta accepted
the use case, and the Human Agent note explicitly asks for **Facebook** Login. Meta is
reviewing this as a Facebook Login app. The mismatch is therefore **a latent correctness
problem, not the cause of these rejections** — demoted from Critical to High. Keep the
scope alignment I shipped (it is right either way, and `pages_manage_metadata` is
independently required), but do **not** reorganise your submission around it, and do not
migrate to Instagram Login.

**Revised priority order:**

| Priority | Action | Rejection it answers |
|---|---|---|
| **1** | Deploy — the FB login buttons and the comments feature are both uncommitted | both |
| **2** | Record a screencast showing the complete Meta login flow → permission grant → end-to-end comment management, in English, with captions | comments |
| **3** | Write Reviewer Instructions naming the button's location, plus working credentials | Human Agent |
| **4** | Dashboard config: `pages_manage_metadata` + Advanced Access | latent blocker |

Everything else in this report remains valid, but is now **hardening rather than
blocking** — with the exception of §6 (live authentication vulnerabilities) and §7.1–7.2
(data-deletion claims), which are independently urgent regardless of App Review.

> **Remaining limitation:** I still cannot read your Meta Developer Dashboard, so §11 R2,
> R13 and R14 are open. I also cannot see the screencast you submitted, so I cannot say
> which specific step the reviewer found missing — only that the feature it needed to show
> was not deployed.

---

## 1. Repository architecture — how it actually works

**Stack.** NestJS 10 + TypeORM + PostgreSQL + Redis (ioredis) backend; React 19 + Vite +
React Router + Tailwind frontend. Deployed to a VPS over SSH by GitHub Actions; frontend
also has `vercel.json`. API is served under `/api/v1/…` (`setGlobalPrefix('api')` +
URI versioning in `main.ts`).

**Tenancy model.** `company` is the tenant. Every CRM row (`instagram_lead`,
`instagram_message`, `comment_trigger`, `knowledge_base`, `story_context`) carries
`company_id`. The JWT payload embeds `company_id`, and controllers read
`req.user.company_id` — they never accept a tenant id from the client. That part of the
design is sound.

**Meta connection storage.** All Instagram state lives on the `company` row:
`instagram_business_id`, `instagram_page_id`, `instagram_access_token` (a **Page** access
token), `instagram_username`, and now `meta_user_id`.

**The real end-to-end flow:**

1. `MetaIntegration.tsx` → `FB.login({ config_id })` (Facebook Login for Business, JS SDK v21.0)
2. → `POST /api/v1/Instagram/Connect { token }` → `InstagramService.linkInstagramAccount()`
3. → `GET /oauth/access_token?grant_type=fb_exchange_token` (long-lived user token)
4. → `GET /me/accounts?fields=name,access_token,instagram_business_account`
5. → picks the **first** page with a linked IG account; stores its Page token
6. → `POST /{page-id}/subscribed_apps` to enable webhooks
7. Inbound: Meta → `POST /api/v1/Instagram/Webhook` → signature check → `entry.messaging`
   routes to `processIncomingMessage`, `entry.changes[field=comments]` routes to
   `processIncomingComment`
8. `processIncomingMessage` → plan/usage gates → lead upsert → story-reply OCR → playbook
   keyword triggers → `AIService.generateAiReply` (RAG over `knowledge_base`) →
   `POST /me/messages`
9. UI realtime via `InstagramGateway` (socket.io)

**Background jobs** (`TokenMonitor.service.ts`, plain `setInterval`): `debug_token`
validation sweep, monthly AI-usage reset, and auto follow-up DMs.

**This is the "Instagram API with Facebook Login" configuration**, unambiguously:
`graph.facebook.com`, `/me/accounts`, Page access tokens, FB Page required.

---

## 2. Meta integration audit

| # | Check | Result |
|---|---|---|
| 1 | OAuth requests only needed permissions | ❌ Requests the wrong *family*; also missing `pages_manage_metadata` (§3.1, §3.2) |
| 2 | Permission names match the API setup | ❌ `instagram_business_*` are Instagram-Login scopes (§3.1) |
| 3 | Callback validates response / handles failure | ⚠️ `FB.login` cancel is handled; Graph errors surface as strings. Now improved |
| 4 | Code exchanged securely, tokens stored safely | ⚠️ Exchange is server-side with the app secret ✅; tokens were **plaintext at rest** ❌ (fixed) |
| 5 | Identifies the correct IG professional account | ⚠️ Takes the **first** page with a linked IG account — wrong account if the user manages several (§7, open) |
| 6 | Correct IDs used for messages/comments/webhooks | ✅ `/me/messages` with the Page token; `{ig-user-id}/media`; `{page-id}/subscribed_apps` |
| 7 | Handles expired/revoked/under-permissioned tokens | ⚠️ `debug_token` sweep **only logs**; no user-facing alert, no reconnect prompt (open) |
| 8 | Permission checks / reauthorization implemented | ❌ None existed. Added granted-scope reporting at connect time (fixed) |
| 9 | Supported API version, correct endpoints | ⚠️ `v21.0` (Oct 2024) is at/near end of its ~2-year support life. Now env-configurable; **you must roll it forward** (§11) |
| 10 | Mixes incompatible login/permission models | ❌ **Yes** — this is the core defect (§3.1) |

### 2.1 Note on the `v25.0` → `v21.0` regression

Commit `d0259eb` was titled *"upgrade Instagram Graph API to v25.0"*. The current working
tree had reverted `sendInstagramMessage` back to `v21.0` while the rest of the file was
already `v21.0`. The version is now a single constant, `GRAPH_VERSION`
(`META_GRAPH_VERSION` env), defaulting to `v21.0` so nothing changes behaviour today.

---

## 3. Comment-management rejection analysis (`instagram_business_manage_comments`)

### 3.1 CRITICAL — Wrong permission family for the implemented login flow

**Confirmed** against [Meta's Instagram Platform overview](https://developers.facebook.com/docs/instagram-platform/overview/):

| | Instagram API with **Instagram** Login | Instagram API with **Facebook** Login |
|---|---|---|
| Permissions | `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages` | `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement` |
| Login | Business Login for Instagram | Facebook Login for Business |
| Host | `graph.instagram.com` | `graph.facebook.com` |
| Token | Instagram User token | Facebook User / Page token |
| FB Page | Not required | **Required** |

You implement the right-hand column and request the left-hand column.

Worse, Meta's own review criteria for `instagram_business_manage_comments` are, verbatim
from the [Permissions Reference](https://developers.facebook.com/docs/permissions):

> - "Demonstrate the complete **Instagram login** process on your app platform"
> - "Demonstrate creating a new comment, updating an existing comment and deleting a comment"
> - "Show how this appears both in your app and the native Instagram app"

Your app has no Instagram login process — it has a Facebook login process. A reviewer
checking criterion 1 fails immediately, before even reaching the feature.

**`frontend/src/pages/MetaIntegration.tsx:105` (before):**
```js
scope: 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,public_profile,pages_show_list,pages_read_engagement'
```

Two problems compounded: the scopes are from the wrong family, **and** `config_id` is also
passed. Meta's [Facebook Login for Business docs](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business)
state that for system-user configurations "config_id has replaced scope (which should not
be used)" and for user-token configurations "although scope can still be included, we
recommend that you do not use it" — permissions come from the dashboard configuration. So
this string was very likely never the thing granting anything; **the real permission set
is whatever is selected in login configuration `1765463831255418`,** which I cannot read.

**Decision you must make:** pick one configuration and be consistent.

- **Recommended: stay on Facebook Login** and request `instagram_manage_comments` (+
  `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`).
  Your approved messaging keeps working, no auth rewrite, no schema change.
- Alternative: migrate to Business Login for Instagram to keep the already-approved
  `instagram_business_*` grants. This is a **full rewrite** of connect + every Graph call
  (different host, token type, no Page) and risks the working messaging flow. Not advised.

### 3.2 CRITICAL — Missing `pages_manage_metadata` ⇒ webhooks never subscribe

Per [Instagram webhook fields](https://developers.facebook.com/documentation/instagram-platform/webhooks/fields),
the `comments` field under Facebook Login requires:

> `instagram_basic`, `instagram_manage_comments`, **`pages_manage_metadata`**, `pages_read_engagement`, `pages_show_list`
> … and **Advanced Access is required for `comments`**.

`pages_manage_metadata` is what authorises `POST /{page-id}/subscribed_apps`. It was not in
the requested scope list. The code's own comment admits the call fails:

```js
console.warn('[WEBHOOK SUBSCRIBE WARNING] Could not auto-subscribe page to webhooks
  (often requires pages_messaging). This is usually fine if configured in the Meta Dashboard:', err.message);
```

It is **not** fine. Dashboard configuration sets the callback URL and fields for the app;
it does not subscribe an individual app user's Page. Every tenant — including the
reviewer's fresh test account — connected with **zero webhook subscriptions**.

### 3.3 HIGH — `subscribed_fields` sent in the wrong format

Meta's [webhook setup guide](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup)
specifies `subscribed_fields` as a **comma-separated string**. The code sent a JSON array
in a JSON body, and never checked the documented `{"success": true}` response.

### 3.4 CRITICAL — Infinite self-reply loop in `processIncomingComment`

The keyword handler falls back to posting a **public** reply:

```js
message: `@${changeValue.from?.username || 'there'} ${matchedTrigger.reply_message}`
```

That reply is itself a comment on the same media, so Meta delivers a new `comments` event
for it. There was no check that the comment's author is the connected account. If a
trigger's reply text contains its own keyword, the app replies to itself indefinitely.
An app that spams its own posts during review is a policy failure in its own right.

### 3.5 HIGH — No idempotency for comment events

`processIncomingMessage` de-duplicates on `mid` (`processedMids`), but
`processIncomingComment` had no equivalent. Meta retries until it receives a 200 and may
redeliver afterwards, so every retry produced another DM/reply to the same commenter.

### 3.6 Feature completeness verdict

| Capability | Before | Now |
|---|---|---|
| List media | Working-tree only | ✅ committed, ownership-checked |
| Read comments + replies | Working-tree only | ✅ |
| Reply to a comment | Working-tree only | ✅ |
| Hide / unhide ("update") | Working-tree only | ✅ |
| Delete a comment | Working-tree only | ✅ with accurate error reporting |
| Comment → DM automation | Deployed but **unreachable** (no webhook subscription) | ✅ subscription fixed, loop + dedupe guarded |
| UI | None | ✅ `/comments-manager`, in sidebar |

**The permission is genuinely justified** by the Comments Manager — reviewers will see
read, reply, hide/unhide and delete on the business's own media. It should be re-requested,
not dropped. But only after §3.1 and §3.2 are resolved.

---

## 4. Human Agent rejection analysis

### 4.1 Nothing was ever demonstrable

No deployed code path set `messaging_type`/`tag`. Whatever the submission described,
the app could not do it.

### 4.2 The uncommitted implementation would also have been rejected

`sendManualMessage` tagged **every** agent reply as `HUMAN_AGENT`:

```js
// Send with Human Agent tag enabled for live support takeover
await this.sendInstagramMessage(lead.instagram_handle, text, company?.instagram_access_token, true);
```

Per [Messenger Platform policy](https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy),
the tag exists to answer a user outside the standard window (up to 7 days) when the issue
"requires more than 24 hours to resolve" or the business is closed. Tagging ordinary
in-window replies is message-tag misuse, and "use of Message Tags outside the approved use
cases may result in restrictions on the Page or Instagram account's ability to send
messages."

### 4.3 HIGH — The auto follow-up is an automated message outside the window

`TokenMonitor.processAutoFollowUps` sends a re-engagement DM once
`auto_follow_up_delay_hours` (default **24**) has elapsed. By construction the last inbound
message is then ≥24h old, so this send is always outside the standard window. Untagged it
simply fails; tagged `HUMAN_AGENT` it would be a clear violation — an automated marketing
nudge is not human support. **If this feature was shown as the Human Agent justification,
that alone explains the rejection.**

### 4.4 Do you actually need the Human Agent feature?

You plausibly do: `Inbox.tsx` has a real "Manual Mode" where a person types a reply, and
`lead_status = 'Handoff'` escalation exists. That matches Meta's
[Human Agent Escalation](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/human-agent-escalation)
"custom inbox" path — the app must "receive end-user messages and render them correctly in
the custom inbox" and "reply through the custom inbox", under the same app ID. You do both.

**Recommendation: keep the request, but postpone it to a submission *after*
`instagram_business_manage_comments`/`instagram_manage_comments` is approved.** Reasons:

- It is a *feature*, not a blocker for comment management — bundling them means one weak
  justification sinks both, which is what has happened three times.
- Its value only shows once the inbox demonstrably works end-to-end on the reviewer's account.
- Note from Meta's [changelog](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/changelog):
  private replies on Instagram **no longer require** the Human Agent tag. If your only
  real need was comment→DM, you may not need the feature at all.

Also fixed: AI replies are now recorded as `AI_*` and human replies as
`HUMAN_AGENT_REPLY` / `HUMAN_AGENT_TAGGED_REPLY` in `instagram_message.action_taken`, with
`created_by_id` set to the actual agent — the audit trail Meta expects for this feature.

---

## 5. Webhook audit

| Check | Before | Now |
|---|---|---|
| Verification challenge | ⚠️ accepted **any** non-empty `hub.mode`; returned HTTP 200 `'Verification Failed'` on mismatch; fell back to a hardcoded default token | ✅ requires `mode === 'subscribe'`, timing-safe token compare, 403 on failure, refuses to run unconfigured |
| Signature validation | ⚠️ present but non-constant-time `!==`; `'fallback_secret'` default; `BYPASS_SIGNATURE` honoured in production | ✅ `crypto.timingSafeEqual`, refuses without `FB_APP_SECRET`, bypass ignored when `NODE_ENV=production` |
| `rawBody` available | ✅ `rawBody: true` in `main.ts` | ✅ |
| Fast acknowledgement | ✅ fire-and-forget + immediate 200 | ✅ |
| **Unhandled rejections** | ❌ **no `.catch()` on the fire-and-forget promises** | ✅ fixed |
| Idempotency — messages | ✅ in-memory `mid` set (lost on restart, single-instance only) | ✅ unchanged (see §11) |
| Idempotency — comments | ❌ none | ✅ Redis `SET NX`, 7-day TTL |
| Self-event filtering | ✅ messages (`is_echo`) ❌ comments | ✅ both |
| Missing account mapping | ✅ logs and returns | ✅ |
| Payload logging | ❌ logged full payload incl. message text | ✅ shape only |

### 5.1 CRITICAL — Unhandled promise rejection crashed the process

`HandleWebhook` launched `this.processMessagingEvent(...)` and
`this.processChangeEvent(...)` without `await` **and without `.catch()`**. Under Node's
default `--unhandled-rejections=throw` (Node 20/24 here), any throw inside message or
comment processing terminates the whole backend.

This was not theoretical — writing the test case reproduced it:

```
Error: transient Meta API failure
    at …/Instagram.webhook.spec.ts:185
Node.js v24.14.0   ← process died, suite aborted
```

Any transient Graph error, DB blip, or malformed payload during the reviewer's session
would take the API down mid-test. A plausible contributor to "could not test the feature."

### 5.2 Test coverage added

`backend/src/Controller/Instagram.webhook.spec.ts` — 22 cases: valid events, wrong secret,
missing signature, tampered body, production bypass refusal, unconfigured secret, routing
for messages/comments, echo suppression, unsupported object, unsupported field, handler
failure still acknowledges, no content in logs, and signed-request callbacks (valid,
forged, absent).

`backend/src/Service/Instagram.comments.spec.ts` — 15 cases: keyword match, self-comment
(IG id and Page id), duplicate delivery, unmapped account, no match, whole-word matching,
private→public fallback, missing text, Redis outage. Plus the 24-hour window boundary at
0/2/23/25 hours and that it reads the last **inbound** message.

`backend/src/Helper/SecretColumn.transformer.spec.ts` — 11 cases incl. legacy-plaintext
compatibility and wrong-key behaviour.

**48 tests, all passing.**

---

## 6. Multi-tenant security and data handling

### 6.1 CRITICAL — Google sign-in was a complete authentication bypass *(in production)*

`POST /api/v1/Auth/GoogleLogin` accepted `{ email }` and returned a signed JWT if a user
with that email existed. **No token, no signature, no verification of any kind.**

```js
// Login.controller.ts (before)
async GoogleLogin(@Body() data: { email: string }) {
  const result = await this._AuthService.GoogleLogin(data.email);
```

```js
// Auth.service.ts (before)
async GoogleLogin(email: string) {
  const UserData = await user.findOne({ where: { email }, … });
  if (!UserData) throw new Error('User not found');
  … return { api_token: this._JwtService.sign(payload) };
```

Anyone could authenticate as **any user, including `SUPER_ADMIN`**, with a single
unauthenticated POST, and thereby read every tenant's Instagram tokens, DMs and leads.
The frontend verified Google client-side and then sent only the email.

**Fixed:** `GoogleLogin` now takes the Google **access token**, calls
`oauth2/v3/tokeninfo`, requires `aud === GOOGLE_CLIENT_ID` and `email_verified`, and
derives the email server-side. `Login.tsx`/`Signup.tsx` now send `accessToken`.
**`GOOGLE_CLIENT_ID` must be set in the backend environment or Google sign-in will refuse.**

### 6.2 CRITICAL — Shared sentinel password ⇒ takeover of every Google account *(in production)*

`frontend/src/pages/Login.tsx` and `Signup.tsx` register Google users with a literal
constant, annotated with a false reassurance:

```js
password: 'GoogleUser123!!' // This remains secure as GoogleLogin bypasses password check
```

It is not secure. That string ships in the public JS bundle, and it is the account's real
stored password hash — so `POST /Auth/Login { email, password: 'GoogleUser123!!' }`
succeeded against **any Google-registered account**. `Auth.service.ts:576` also made it a
verification bypass: `newUser.is_verified = (data.password === 'GoogleUser123!!')`.

**Fixed:** `ValidateUser` now rejects that password on the interactive path (an
`internalProvisioning` flag lets `Register` still mint the post-signup session, so Google
signup is unaffected). **Proper fix still owed:** an `auth_provider` column (§11).

### 6.3 CRITICAL — Cross-tenant workspace fallback *(in production)*

Three places in `Auth.service.ts` (`ValidateUser`, `GoogleLogin`, 2FA verify) did:

```js
let companyData = UserData.company;
if (!companyData) {
  const companies = await company.find({ relations: ["currency"] });
  companyData = companies[0] || null;   // ← arbitrary other tenant
}
```

A user without a linked company silently received **the first company in the table** as
their workspace — its Instagram connection, leads and conversations. The comment called
this "backwards compatibility."

**Fixed:** confined to `SUPER_ADMIN` (already cross-tenant by role). The new
`FacebookLogin` path never falls back at all.

### 6.4 CRITICAL — Meta access tokens stored in plaintext

`company.instagram_access_token` held live Page tokens as plaintext. A read-only DB
compromise or a dump would hand over full messaging/comment control of every connected
Instagram business account. `EncryptionService` already existed but was used only for LLM
keys and SMTP passwords.

**Fixed** via a TypeORM column transformer (`SecretColumn.transformer.ts`): AES-encrypted
with an `enc:v1:` envelope, transparent to all 38 existing read sites. Values without the
prefix are read back as-is, so **existing rows keep working** and are re-encrypted on their
next write. No migration, no downtime, no schema change.

### 6.5 HIGH — Access tokens written to logs

```js
console.log('[DEBUG IG CONNECT] Pages returned by Meta:', JSON.stringify(pages, null, 2));
```

Each element of `pages` contains a live `access_token`. Fixed to log counts only. Full
webhook payloads (customer DM text) were also being logged; now shape only.

### 6.6 HIGH — Production credentials committed to the repo

`backend/.env.example` was tracked and contained what appear to be **real** values:

```
DB_HOST=151.243.146.154
DB_PASS=Login@123!!
SECERT_KEY=e8c35c0a-94d3-4d8e-a9bb-c9d088aa4dd1
TOKEN_SECRET=e8c35c0a-94d3-4d8e-a9bb-c9d088aa4dd1
```

Scrubbed to placeholders. **These are in git history and must be treated as compromised —
rotate all four** (§11). Note the JWT secret and encryption key were the *same value*.
`backend/.env` itself is correctly gitignored.

### 6.7 MEDIUM — Comment/media IDOR hardening

`getComments`/`replyToComment`/`hideComment`/`deleteComment` accepted arbitrary
`mediaId`/`commentId`. Meta's per-token scoping limited real impact, but ids were never
checked against the tenant. Added `assertOwnsMedia` / `assertOwnsComment` verifying
`owner.id === company.instagram_business_id`.

### 6.8 Other observations

- ✅ No tenant id is ever accepted from the client; all queries filter on
  `req.user.company_id`.
- ⚠️ Swagger UI is public at `/swagger`, titled "Jewel Stock" with
  `Demo@Demo` contact — leaks the full API surface and looks unfinished to a reviewer.
- ⚠️ `instagram_app_secret` / `instagram_app_id` columns on `company` are dead code; drop them.
- ⚠️ No distinct dev/staging/prod config separation; a single `.env`.

---

## 7. App Review UX audit — walking through as the reviewer

| Step | Before | Now |
|---|---|---|
| 1. Sign in | ✅ `/login`; also an FB button (uncommitted) | ✅ |
| 2. Connect an IG professional account | ⚠️ Works, but silently half-configured: no webhooks | ✅ Subscribes correctly; **shows a warning panel** naming missing permissions |
| 3. Grant requested permissions | ❌ Wrong family requested | ✅ Aligned (dashboard config must be updated too) |
| 4. Navigate to the feature unaided | ❌ **No comments screen existed** | ✅ "Comments Manager" in the sidebar |
| 5. View and reply to comments | ❌ Impossible | ✅ Media list → comments → reply / hide / delete |
| 6. View conversations, send/receive | ✅ Inbox + Manual Mode | ✅ now reports real send failures |
| 7. Understand the benefit | ⚠️ | ⚠️ Script this in the recording (§9) |
| 8. Complete flow without breakage | ❌ Dead "Delete Account" button; process could crash | ✅ Both fixed |

### 7.1 CRITICAL — Published data-deletion instructions contradicted the app

`/data-deletion` (public, and what you give Meta) tells the user:

> Navigate to **Settings** > **Account Management**. Under the "Danger Zone" section, click
> **Delete Account & Purge Data**. … permanently and irreversibly deleted … within 10 minutes.

The button did this:

```js
onClick={() => toast.error('Account deletion has been temporarily paused for Meta App Review verification.')}
```

A reviewer verifying your data-deletion claim clicked it and was told, in your own words,
that deletion is paused *for Meta App Review*. That is a self-documenting policy failure.

**Fixed:** real `POST /Instagram/PurgeData` + confirmation modal + sign-out. It disconnects
Meta, unsubscribes webhooks, and deletes messages, story contexts, comment triggers,
knowledge base and leads for the workspace.

### 7.2 CRITICAL — The data-deletion callback deleted nothing

```js
// In a production app, you would decode the signed_request here
// and queue the user's data for deletion.
return { url: …, confirmation_code: `DEL-${Math.random().toString(36)…}` };
```

It returned a random code without verifying the `signed_request` or deleting anything —
i.e. it asserted compliance it did not perform, and accepted unauthenticated requests.
`Deauthorize` likewise did nothing.

**Fixed:** `parseSignedRequest` does HMAC-SHA256 base64url verification with
`timingSafeEqual`; `handleMetaDataDeletion` performs the deletion and records the
confirmation code in Redis for 90 days; `handleMetaDeauthorization` clears credentials.
This required the new `meta_user_id` column (§8.1) — Meta's callback identifies the user
only by app-scoped id, which was not being stored.

### 7.3 HIGH — Two conflicting sets of legal pages

- `frontend/src/pages/Legal.tsx` → `/privacy`, `/terms`, `/data-deletion`: detailed, Flazly-branded, GDPR/CCPA sections. **Use these.**
- `backend/src/Controller/Legal.controller.ts` → `/api/v1/Legal/Privacy` and `/Terms`: stubs titled "Instagram CRM", dated April 16 2026, contact **`support@example.com`**.

If the dashboard points at the backend URLs, the reviewer read a placeholder policy with a
fake contact address. **Verify which URLs are configured** (§11). I did not delete the
backend stubs — that is your call once you confirm they are unreferenced.

### 7.4 MEDIUM — Reviewer instructions embedded in the production login page

`Login.tsx:490` shows all visitors:

> **Meta App Reviewers:** Click **Facebook** above for instant OAuth test, or log in using reviewer credentials to test Meta Integration.

Harmless functionally, but it signals an app built for the reviewer rather than for users.
Consider gating it behind a query parameter.

### 7.5 MEDIUM — Connect picks the first linked page

`pages.find(p => p.instagram_business_account)` takes whichever page Graph returns first.
A reviewer whose test user administers several pages may connect the wrong account and
conclude the feature is broken. Recommended: return the candidate list and let the user
choose. **Not implemented** — it is a UI change beyond this audit's remit; flagged in §11.

---

## 8. Prioritized findings

Severity × confidence. "Review impact" = could this alone cause rejection?

### Critical

| # | Finding | Confidence | Permission | Location | Review impact | Status |
|---|---|---|---|---|---|---|
| C1 | Comment feature never deployed (uncommitted/untracked) | **Confirmed** | `…manage_comments` | `git log -S`, untracked `CommentsManager.tsx` | **Yes — decisive** | Fixed (must commit+deploy) |
| C2 | Human Agent tag never deployed | **Confirmed** | Human Agent | `git diff` on `sendInstagramMessage` | **Yes — decisive** | Fixed |
| C3b | **No Facebook Login button on the deployed login/signup pages** — the literal cited reason | **Confirmed** (reviewer feedback + `git show HEAD:…`) | Human Agent | `Login.tsx`, `Signup.tsx` | **Yes — cited** | Fixed: full-width "Continue with Facebook", must deploy |
| C3c | **Screencast could not show end-to-end comment management** because the feature was undeployed — the literal cited reason | **Confirmed** (reviewer feedback + §0) | `…manage_comments` | n/a | **Yes — cited** | Fixed by deploying + re-recording (§10.A) |
| C4 | `pages_manage_metadata` missing ⇒ no webhooks subscribe | **Confirmed** (docs+code) | both | `Instagram.service.ts` connect | **Yes** | Fixed |
| C5 | Unhandled rejection crashes the API process | **Confirmed** (test reproduced) | all | `Instagram.controller.ts` `HandleWebhook` | **Yes** | Fixed |
| C6 | Comment self-reply loop | **Confirmed** | `…manage_comments` | `processIncomingComment` | **Yes** (spam) | Fixed |
| C7 | Data-deletion button was a dead toast | **Confirmed** | policy | `Settings.tsx:631` | **Yes** | Fixed |
| C8 | Deletion callback deleted nothing, unverified | **Confirmed** | policy | `DataDeletion` | **Yes** | Fixed |
| C9 | Google login = full auth bypass | **Confirmed** | Platform Terms | `Auth.service.GoogleLogin` | Indirect | Fixed |
| C10 | Sentinel password ⇒ Google account takeover | **Confirmed** | Platform Terms | `Login.tsx:113`, `Auth.service.ts:576` | Indirect | Mitigated; see R4 |
| C11 | `companies[0]` cross-tenant fallback | **Confirmed** | Platform Terms | `Auth.service.ts` ×3 | Indirect | Fixed |
| C12 | Meta tokens plaintext at rest | **Confirmed** | Platform Terms | `company.instagram_access_token` | Indirect | Fixed |

### High

| # | Finding | Confidence | Status |
|---|---|---|---|
| H1 | `subscribed_fields` as JSON array, not comma-separated; response unchecked | **Confirmed** (docs) | Fixed |
| H2 | No idempotency on comment webhooks ⇒ duplicate replies on retry | **Confirmed** | Fixed |
| H3 | Human Agent tag applied unconditionally (message-tag misuse) | **Confirmed** | Fixed — window-gated |
| H4 | Auto follow-up = automated message outside the 24h window | **Confirmed** | Fixed — skips and marks |
| H5 | Page access tokens logged to console | **Confirmed** | Fixed |
| H6 | Real credentials in committed `.env.example` | **Confirmed** | Scrubbed; **rotate** (R1) |
| H7 | Two conflicting legal page sets; backend stub has `support@example.com` | **Confirmed** | **Needs your confirmation** (R2) |
| H8 | `sendInstagramMessage` swallowed failures ⇒ UI showed undelivered messages as sent | **Confirmed** | Fixed — `sendManualMessage` throws |
| H9 | Webhook verify ignored `hub.mode`, returned 200 on failure, hardcoded fallback token | **Confirmed** | Fixed |
| H10 | Non-constant-time signature compare; `BYPASS_SIGNATURE` live in production | **Confirmed** | Fixed |
| H11 | Full webhook payloads (customer DM text) logged | **Confirmed** | Fixed |
| H12 | Wrong permission family vs. implemented login flow (**demoted from Critical** — see §0.1; latent, not the cited cause) | **Confirmed** (docs) | Code fixed; **dashboard config still required** |

### Medium / Low

| # | Finding | Confidence | Status |
|---|---|---|---|
| M1 | Graph `v21.0` near end of support | Strongly suspected | Now configurable; **roll forward** (R6) |
| M2 | Comment/media IDOR not checked against tenant | **Confirmed** | Fixed |
| M3 | `debug_token` sweep only logs; no user alert or reconnect prompt | **Confirmed** | Open (R7) |
| M4 | Connect silently picks the first linked page | **Confirmed** | Open (R8) |
| M5 | `processedMids` in-memory ⇒ duplicates after restart / multi-instance | **Confirmed** | Open (R9) |
| M6 | Public Swagger titled "Jewel Stock", `Demo@Demo` contact | **Confirmed** | Open (R10) |
| M7 | Reviewer instructions on the public login page | **Confirmed** | Open (R11) |
| L1 | Dead `instagram_app_id` / `instagram_app_secret` columns | **Confirmed** | Noted |
| L2 | `extracted_plan.txt` (149 KB), `debug_token.ts`, `test_gemini.js`, `scratch/` committed | **Confirmed** | Noted |

**Defects vs. policy risk.** C1–C6, C9–C12, H1–H2, H5, H8–H11, M2, M5 are code defects.
C7, C8, H3, H4, H6, H7, M6, M7 are policy/compliance exposure. C3 and C4 are both.

---

## 9. Implementation report

### 9.1 Files changed

**New**
| File | Purpose |
|---|---|
| `backend/src/Helper/SecretColumn.transformer.ts` | Transparent AES encryption-at-rest with legacy-plaintext fallback |
| `backend/src/Controller/Instagram.webhook.spec.ts` | 22 webhook tests |
| `backend/src/Service/Instagram.comments.spec.ts` | 15 comment + messaging-window tests |
| `backend/src/Helper/SecretColumn.transformer.spec.ts` | 11 encryption tests |

**Modified**
| File | Change |
|---|---|
| `backend/src/Service/Instagram.service.ts` | `GRAPH_VERSION`/`WEBHOOK_FIELDS`/`REQUIRED_SCOPES` constants; comma-separated `subscribed_fields` + response check + surfaced warnings; `findMissingScopes` via `debug_token`; capture `meta_user_id`; stop logging tokens; comment self-loop guard + Redis dedupe; window-gated `HUMAN_AGENT`; `sendInstagramMessage` returns an outcome; `sendManualMessage` throws on failure and records agent identity; AI replies labelled; `requireConnectedCompany`/`assertOwnsMedia`/`assertOwnsComment`; `describeCommentError`; `handleMetaDataDeletion`/`handleMetaDeauthorization`/`purgeCompanyData` |
| `backend/src/Controller/Instagram.controller.ts` | Hardened verification + signature; `.catch()` on fire-and-forget; reduced logging; real `DataDeletion`/`Deauthorize` with `parseSignedRequest`; `POST PurgeData`; `SendMessage` validates and passes the agent id |
| `backend/src/Service/Auth/Auth.service.ts` | `GoogleLogin` verifies the token audience; `FacebookLogin` verifies `app_id` via `debug_token`, keys on the Meta id, random password; sentinel blocked in `ValidateUser`; `companies[0]` confined to `SUPER_ADMIN` (×3) |
| `backend/src/Controller/Auth/Login.controller.ts` | `GoogleLogin` takes `accessToken` |
| `backend/src/Database/Table/Admin/company.ts` | `meta_user_id` (indexed); encrypting transformer on `instagram_access_token` |
| `backend/src/Service/TokenMonitor.service.ts` | Follow-up skipped outside the 24h window; `messaging_type: RESPONSE`; `GRAPH_VERSION` |
| `backend/src/Service/Broadcast.service.ts` | `GRAPH_VERSION` |
| `backend/package.json` | Jest `moduleNameMapper` for the `@…` path aliases (tests could not resolve them) |
| `backend/.env.example` | Credentials scrubbed; `META_GRAPH_VERSION`, `GOOGLE_CLIENT_ID`, `BYPASS_SIGNATURE` documented |
| `frontend/src/pages/MetaIntegration.tsx` | Facebook-Login scope family + `pages_manage_metadata`; warning panel |
| `frontend/src/pages/Settings.tsx` | Danger Zone wired to `PurgeData` with confirmation + sign-out |
| `frontend/src/pages/Login.tsx`, `Signup.tsx` | Send the Google `accessToken`; corrected the misleading comment |

Pre-existing uncommitted work (Comments Manager UI, API client, models, routing, sidebar,
FB login buttons) was **kept and hardened**, not rewritten.

### 9.2 Verification performed

| Check | Result |
|---|---|
| `tsc --noEmit -p tsconfig.build.json` | ✅ 0 errors |
| `nest build` | ✅ "Found 0 issues", 105 files compiled |
| `tsc --noEmit -p tsconfig.app.json` (frontend) | ✅ 0 errors |
| `vite build` | ✅ built in 10.81s |
| `jest` | ✅ **48/48 passing**, 3 suites |

### 9.3 Not verified — and why

- **No live Meta API call was made.** I have no app secret, Page token, or test Instagram
  account. Every Graph interaction is mocked. The endpoint shapes are checked against
  current docs, not against the live API.
- `tsc -p tsconfig.json` reports one **pre-existing** error in `test/app.e2e-spec.ts`
  (`supertest` has no call signatures). Untouched by this work; excluded from the build config.
- No DB migration was executed. `meta_user_id` needs the SQL in R3.
- Encryption round-trip is unit-tested but not tested against your live Postgres.
- The `v21.0` → current-version bump was deliberately **not** made (see M1/R6).

### 9.4 Deliberately not changed

- The Facebook Login flow itself — it underpins your approved messaging.
- Any DB column except adding nullable `meta_user_id`.
- The AI/RAG pipeline, plan limits, billing, broadcasts.
- The backend `Legal.controller.ts` stubs — pending your answer on R2.

---

## 10. Resubmission plan

### 10.0 Do this first — the work is not live until you deploy

```bash
git add -A && git commit && git push origin main   # triggers deploy.yml
```

Nothing in §9 affects production until `origin/main` moves. **This is the step whose
absence caused three rejections.** After deploying, confirm on the live site that
`/comments-manager` loads and the sidebar shows "Comments Manager".

### A. `instagram_manage_comments` (Facebook Login family)

**Prerequisites**
1. In the App Dashboard, confirm **Instagram API with Facebook Login** (or Instagram
   Messaging) is the configured product — not Instagram API with Instagram Login.
2. Edit login configuration `1765463831255418` to include exactly:
   `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`,
   `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`.
3. Request **Advanced Access** for `instagram_manage_comments` — required for the
   `comments` webhook field.
4. Webhooks → Instagram: callback `https://<domain>/api/v1/Instagram/Webhook`, verify token
   = `IG_CRM_VERIFY_TOKEN`, subscribe `comments` and `messages`.
5. Reviewer test account: an Instagram **professional** account linked to a Facebook Page,
   with **at least 3 published posts** that already carry **several comments from a second
   account**. An empty media list is indistinguishable from a broken feature.

**Pre-flight checks** (run before recording)
- Reconnect from scratch in Meta Integration; confirm **no warning panel** appears.
- `GET /{page-id}/subscribed_apps` returns your app with `comments` and `messages`.
- Post a test comment; confirm a `comments` webhook arrives and the app does **not** reply
  to its own reply.
- Exercise reply, hide, unhide and delete from the UI and confirm each change in the
  native Instagram app.

**Screen recording — follow Meta's three stated criteria exactly**
1. Sign up/sign in as a brand-new user (no pre-seeded session).
2. Settings → Meta Integration → **Connect with Facebook**; show the full permission
   dialog with every permission visible, and accept all.
3. Open **Comments Manager**; show the media list loading from the connected account.
4. Select a post; show its real comments with usernames and timestamps.
5. **Create** a reply → show it appear in the app → **cut to the native Instagram app and
   show the same reply on the post.** (Criterion 3 — this side-by-side is mandatory.)
6. **Update**: hide a comment, show it marked hidden, then unhide it — again shown in both.
7. **Delete** a comment, show it gone from both.
8. Show Automation → Comment-to-DM: add a keyword trigger, post a matching comment from
   the second account, show the automated DM arriving in Instagram and in the Flazly Inbox.
9. Narrate the user benefit: one place for a business to answer every comment, with
   keyword automation turning commenters into DM conversations and CRM leads.

**Written justification (template)**
> Flazly is a customer-communication platform for Instagram businesses. We need
> `instagram_manage_comments` to let a business read the comments on its own posts, publish
> replies, and hide or delete comments that violate its moderation policy — all from one
> dashboard, including the comment→DM automation shown at 3:20. The permission is used only
> on media owned by the connected professional account, and only after that account's owner
> grants access. We do not read comments on media we do not own.

**Evidence to attach:** the recording, a screenshot of a successful
`GET /{ig-user-id}/media` and `GET /{comment-id}` response (**access tokens redacted**),
the public `/privacy`, `/terms`, `/data-deletion` URLs, and reviewer credentials.

### A.1 Meeting Developer Policy 1.6 — the four things the reviewer explicitly asked for

The rejection listed its own acceptance criteria. Map the recording to them one-for-one:

| Meta's requirement | Where it appears in the recording |
|---|---|
| "The complete Meta login flow" | Step 2 — start signed out, press **Continue with Facebook** on the login page, show the Facebook dialog |
| "A user granting app access to the permission/feature" | Step 3 — the Meta Integration permission dialog, **every permission visible and accepted** |
| "The end-to-end experience of the use case" | Steps 4–8 — read → reply → hide/unhide → delete, each confirmed in the native Instagram app |
| Best practices: "use English as the app UI language, provide captions and tool-tips, and explain the meaning of buttons" | Burn in English captions throughout; narrate every button before pressing it |

Hard requirements, each of which has sunk a submission before:

- **Start signed out.** Do not resume an existing session. The reviewer must see the login
  page, and the Facebook button on it.
- **Do not cut away during the OAuth dialog.** One continuous take from button press to
  redirect back into the app.
- **Captions on every step.** The rejection cites the Screen Recording Guide explicitly.
- **English UI only.**
- **Show the native Instagram app** for each of create / update / delete. This is a stated
  criterion for this permission and the most commonly missed one.
- You are **not** a server-to-server or system-user app, so do **not** claim the exemption
  in the final bullet of the rejection — your Facebook Login flow is visible and must be shown.

### A.2 Reviewer Instructions — paste this into the submission

> **Test credentials**
> URL: https://app.flazly.in/login
> Email: `<reviewer email>` · Password: `<reviewer password>`
>
> **Where the Facebook Login button is**
> The blue **"Continue with Facebook"** button is on the login page at
> https://app.flazly.in/login, directly below the email/password form and above the Google
> button. It is full width and uses official Facebook branding. The same button is on the
> signup page at https://app.flazly.in/signup.
>
> **Steps to test Instagram comment management**
> 1. Go to https://app.flazly.in/login and press **Continue with Facebook** (or sign in
>    with the credentials above).
> 2. In the left sidebar, open **Meta Integration**.
> 3. Press **Connect with Facebook** and approve all requested permissions. Select the
>    Facebook Page linked to the Instagram professional account.
> 4. In the left sidebar, open **Comments Manager**.
> 5. Your Instagram posts load on the left. Select any post to load its comments.
> 6. Press **Reply** on a comment, type a reply, and send it — the reply is published to
>    Instagram via `POST /{ig-comment-id}/replies`.
> 7. Press the **eye icon** to hide or unhide a comment (`POST /{ig-comment-id}?hide=`).
> 8. Press the **trash icon** to delete a comment (`DELETE /{ig-comment-id}`).
> 9. Open **Automation → Comment-to-DM** to add a keyword rule; commenting that keyword on
>    a post triggers an automated DM to the commenter.
>
> **Why we need `instagram_manage_comments`**
> Flazly is a customer-communication tool for Instagram businesses. The business connects
> its own Instagram professional account and uses Comments Manager to read, reply to, hide
> and delete comments on **its own posts**, and to convert commenters into DM conversations
> and CRM leads. We never access comments on media we do not own.

### B. Human Agent — postpone

The rejection reason was **not** about the Human Agent use case at all — it was
"Unable to Locate Facebook Login" (Platform Term 7.a). Meta never got far enough to assess
the feature. So the fix for *this* citation is purely the login button and the reviewer
instructions in A.1/A.2.

That said, still postpone the request to a submission after A is approved. Before then:

1. Decide whether you need it at all: private replies no longer require the tag, so if
   comment→DM was the driver, drop the request.
2. Keep it only if you genuinely answer customers >24h later from the Inbox.
3. Demonstrate: customer DMs → AI replies → agent switches to **Manual Mode** → a human
   types a reply. Use a conversation whose last inbound message is **more than 24 hours
   old**, so the tag is actually exercised, and show the `HUMAN_AGENT_TAGGED_REPLY` audit
   entry distinguishing it from the AI's `AI_*` messages.
4. **Never** present the auto follow-up as a Human Agent use case.

### C. Protecting the approved permissions

`instagram_business_basic` and `instagram_business_manage_messages` are approved but belong
to the *other* configuration, so they are probably not what your code exercises.

- **Do not remove any existing grant.** Add `instagram_manage_comments` alongside.
- Messaging is unchanged: same endpoint, same token, same flow. The only behavioural
  changes are that human replies inside 24h now send `messaging_type: RESPONSE` instead of
  a `HUMAN_AGENT` tag (more compliant), and failed sends now surface instead of being
  logged as sent.
- Regression-test after deploying: receive a DM → AI replies; send a manual reply; add a
  knowledge-base item and confirm it is used; confirm a story reply still works.
- **Still to verify:** whether your dashboard has *both* API setups added. If
  `instagram_business_*` was approved against an Instagram-Login setup you never built,
  those grants do nothing for you and the honest path is to request the Facebook-Login
  equivalents.

---

## 11. Remaining blockers and required actions

### Needs your input

| # | Item |
|---|---|
| **R2** | Which **Privacy Policy / Terms / Data Deletion URLs** are in the App Dashboard — the frontend routes (`/privacy`, `/terms`, `/data-deletion`) or the backend stubs (`/api/v1/Legal/Privacy`)? If the latter, that is a live policy failure. |
| ~~R12~~ | ~~Paste the reviewer feedback~~ — **received and incorporated (§0.1)** |
| **R13** | Confirm which **API setups** are added in the dashboard, and the exact permission list in login configuration `1765463831255418`. I cannot read these. |
| **R14** | Confirm whether the reviewer's test Instagram account was a **professional** account linked to a Facebook Page with existing posts and comments. |

### You must do (cannot be done from code)

| # | Action | Why |
|---|---|---|
| **R1** | **Rotate** `DB_PASS`, `SECERT_KEY`, `TOKEN_SECRET`, and the Meta app secret | They are in git history (H6). ⚠️ Rotating `SECERT_KEY` makes already-encrypted tokens unreadable — see R3 ordering |
| **R3** | Run the migration **before** deploying: `ALTER TABLE company ADD COLUMN IF NOT EXISTS meta_user_id varchar;` and `CREATE INDEX IF NOT EXISTS idx_company_meta_user_id ON company (meta_user_id);` | `DB_SYNC=false`, so the new column is not auto-created. Non-destructive, additive only |
| **R5** | Update the dashboard login configuration and request Advanced Access (§10.A.2–3) | Code alone cannot change your dashboard |
| **R6** | Set `META_GRAPH_VERSION` to a currently supported version and retest messaging + comments | `v21.0` (Oct 2024) is at/near end of support. I left the default unchanged deliberately — I cannot test a version bump against the live API |

**Ordering note for R1 + R3:** deploy the code with the *existing* `SECERT_KEY` first, so
stored plaintext tokens are read successfully and re-encrypted on write. Only rotate
`SECERT_KEY` afterwards, and expect every connected tenant to have to reconnect.

### Recommended follow-ups (not done — out of this audit's scope)

| # | Item |
|---|---|
| **R4** | Add an `auth_provider` column and remove the `GoogleUser123!!` scheme entirely (C10 is mitigated, not eliminated) |
| **R7** | Make the `debug_token` sweep notify the user and prompt reconnection instead of only logging (M3) |
| **R8** | Let the user choose which Page/Instagram account to connect (M4) |
| **R9** | Move message `mid` de-duplication from the in-memory `Set` to Redis, as comments now use (M5) |
| **R10** | Restrict Swagger in production and fix the "Jewel Stock" metadata (M6) |
| **R11** | Gate the reviewer notice on the login page behind a query parameter (M7) |
| **R15** | Remove `extracted_plan.txt`, `debug_token.ts`, `test_gemini.js`, `backend/scratch/`, and the dead `instagram_app_*` columns (L1, L2) |

---

## Sources

- [Instagram Platform — Overview](https://developers.facebook.com/docs/instagram-platform/overview/)
- [Permissions Reference](https://developers.facebook.com/docs/permissions)
- [Instagram webhooks — Setup](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup)
- [Instagram webhooks — Fields and permissions](https://developers.facebook.com/documentation/instagram-platform/webhooks/fields)
- [Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business)
- [Messenger Platform and IG Messaging API policy](https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy)
- [Human Agent Escalation](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/human-agent-escalation)
- [Business Messaging Changelog](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/changelog)
- [Send API reference](https://developers.facebook.com/docs/messenger-platform/reference/send-api/)
- [IG Comment Replies](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-comment/replies)
