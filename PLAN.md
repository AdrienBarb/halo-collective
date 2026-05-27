# Halo Collective — MVP Build Plan

## Guiding principle

Build a **walking skeleton first, content variety second**. Validate the riskiest end-to-end path with the thinnest possible newsletter, then duplicate the pattern for sections. Throw work away on purpose; that is cheaper than building everything against assumptions that might be wrong.

## Riskiest unproven things (de-risk early, in this order)

1. **Brevo send pipeline** — email HTML is a minefield, third-party APIs have quirks.
2. **Supabase media uploads** from admin forms (audio especially).
3. **Subscribe flow merged with Better Auth signup** — one form, two side effects.
4. **Newsletter section data shape** — we have one example athlete; the model will bend.

Everything else (more section types, SEO polish, sponsor logos, slider animation) is *content variety*, not architecture.

## Locked architectural choices

- **Fully relational schema, no JSON payloads** for section data — typed, migratable, queryable.
- **Snapshot rendered HTML at publish time** on the `Newsletter` row. Historical editions never re-render. Lets us change the renderer freely later.
- **Hardcoded section order** in the renderer (debrief → recap → next → gear). No `displayOrder` on sections — every newsletter has the same shape. Add ordering only when a real need appears.
- **Two render paths, one data source**: web (RSC) and email (MJML via `@faire/mjml-react`) consume the same section rows.
- **Publish = send immediately** in v1. No scheduling, no draft autosave.
- **Admin is plain forms**. No WYSIWYG, no live preview. A "Preview email" button opens the rendered HTML in a new tab.
- **Tennis-only in v1**. `Sport` enum exists so the second sport doesn't need an awkward migration, but `Match` / scoring fields stay tennis-shaped.
- **Cobolli's Monte Carlo edition (from the real email source) is the gold-standard fixture** — every section we build, we recreate his content against it.

## Data model (long-term shape)

```
User                ← Better Auth managed (fans)
  id, email, name, emailVerified, ...

Athlete
  id, slug (unique), firstName, lastName, sport (enum), countryCode,
  bio, avatarUrl, heroImageUrl,
  worldRank, countryRank, titlesCount,
  social (1:1)

NewsletterSubscription   ← join: User ↔ Athlete + Brevo state
  id, userId, athleteId,
  source (ig-bio | tiktok-bio | qr | manual | ...),
  brevoContactId,
  subscribedAt, unsubscribedAt
  unique(userId, athleteId)

Sponsor               ← reusable
  id, name, logoUrl, websiteUrl

AthleteSponsor (athleteId, sponsorId, order)        ← profile sponsors
NewsletterSponsor (newsletterId, sponsorId, order)  ← override per edition

Newsletter
  id, athleteId, editionNumber, slug, title, subtitle,
  heroImageUrl, location, eventName, eventBadgeUrl,
  status (DRAFT | PUBLISHED), publishedAt,
  brevoCampaignId, brevoSentAt,
  renderedHtml,         ← snapshot at publish
  seoOgImageUrl
  unique(athleteId, editionNumber)
  unique(athleteId, slug)

DebriefSection (1:1)
  voiceNoteUrl, voiceNoteDurationSec, voiceNoteLabel, voiceNoteLocation,
  body, pullQuote, pullQuoteContext

RecapSection (1:1)
  roundReached, seed, recordWL
  matches: Match[]
  press:   PressArticle[]

Match
  recapSectionId, order, result (WIN | LOSS), opponentName,
  opponentRank, opponentCountryCode, scoreSets, commentary,
  highlightsUrl, dateLabel

PressArticle
  recapSectionId, order, publisher, title, url

NextEventSection (1:1)
  eventName, startsOn, endsOn, category, surface,
  voiceNoteUrl, voiceNoteDurationSec, voiceNoteLabel, voiceNoteLocation,
  body
  schedule: ScheduleItem[]

ScheduleItem
  nextEventSectionId, order, dateLabel, title, description

GearSection (1:1)
  heroImageUrl, intro, ctaLabel, ctaUrl
  items: GearItem[]

GearItem
  gearSectionId, order, brandName, productName, description,
  imageUrl, buyUrl
```

`User` is the long-term identity layer — fans will eventually have profiles, saved editions, comments, possibly purchases. `NewsletterSubscription` is the per-athlete relationship row, where Brevo state lives. A single fan can subscribe to multiple athletes.

## Phased plan

### Phase 0 — Foundation (no UI)

- Prisma schema for `Athlete`, `Newsletter` (minimal: `title`, `slug`, `heroImageUrl`, `body` text placeholder, `status`, `publishedAt`, `renderedHtml`).
- `User` (Better Auth tables) and `NewsletterSubscription` defined now (used in Phase 4).
- **Skip section tables** — the dumb `body` field on Newsletter is a temporary scaffold.
- Supabase storage bucket + `uploadMedia()` util in `src/lib/storage/`.
- Seed: 1 athlete (Cobolli), 0 newsletters.

**Done when:** schema migrated, `uploadMedia(file)` returns a public URL from a script.

### Phase 1 — Public profile shell (read-only, no admin yet)

- `/[athleteSlug]/layout.tsx` — persistent header (avatar, name, country, stats, sponsors).
- `/[athleteSlug]/page.tsx` — "EDITIONS" slider (empty state if no newsletters).
- `/[athleteSlug]/[editionSlug]/page.tsx` — newsletter detail (renders title + hero + body).
- Manually insert 1 newsletter via Prisma Studio.

**Done when:** browsing live site shows Cobolli's profile and one stub newsletter; navigation between editions keeps the layout (no full-page reload of header).

### Phase 2 — Admin CRUD (no auth gate, no sections)

- `/admin/athletes` (list / create / edit): name, slug, country, stats, avatar + hero upload to Supabase.
- `/admin/newsletters` (scoped to athlete, list / create / edit): title, slug, hero, body, status.
- Protect later with env-flag middleware. No real auth yet.

**Done when:** end-to-end newsletter creation through admin is visible on the public site.

### Phase 3 — Email pipeline + Brevo (the riskiest part)

This goes **before** sections — with the dumb body-text newsletter. If Brevo has surprises, we want them with the simplest possible payload.

- MJML template `<NewsletterEmail title hero body />` at `src/lib/emails/mjml/NewsletterEmail.tsx` (originally shipped as React Email; migrated to MJML for cross-client parity).
- Server-side `renderMjmlEmail()` at publish time → snapshot on `Newsletter.renderedHtml`.
- Brevo client wrapper in `src/lib/brevo/`:
  - upsert contact (hardcode your own email as the test "subscriber")
  - create campaign with snapshot HTML
  - send campaign
- "Publish" button in admin triggers the full chain.

**Done when:** clicking Publish sends the snapshot HTML to your inbox via Brevo, even if visually rough.

### Phase 4 — Better Auth + real subscribe flow

Replace the hardcoded test email with a real signup → subscriber loop.

- Better Auth setup (email/password + magic link).
- "Subscribe to my newsletter" form on athlete profile = signup form.
- One submit creates: `User` + `NewsletterSubscription` (athleteId-scoped) + Brevo contact sync.
- Brevo webhook → on unsubscribe event, set `unsubscribedAt` on the subscription row.
- Per-athlete Brevo list: contacts mirrored from our DB; our DB is source of truth.

**Done when:** anonymous user signs up on Cobolli's profile and receives the next published newsletter from Brevo.

### Phase 5 — First real section: Debrief

Sets the pattern for all section types. Debrief is the right first one — it exercises audio upload, long-form text, optional quote, and both render paths.

- Add `DebriefSection` table (1:1 with Newsletter); drop the temporary `body` field.
- Admin form: text fields + audio upload to Supabase.
- Web component: `src/components/newsletter/blocks/Debrief.tsx`.
- Email component: `src/lib/emails/blocks/Debrief.tsx`.
- Hardcoded section order in both renderers.

**Done when:** publishing a Cobolli newsletter with a real Debrief renders correctly on web and in email.

### Phase 6 — Remaining sections, one at a time

In risk/value order:

1. **Recap** (matches + press) — most complex shape, nested lists.
2. **Next event** + schedule — straightforward after Recap.
3. **Gear** — depends on Sponsor model (keep simple: name + logo + link).

After each section, re-test the email render in Gmail + Outlook. Do not batch.

### Phase 7 — SEO

- `generateMetadata` per athlete and per edition.
- OG image = newsletter hero.
- JSON-LD `Article` schema on edition pages, `Person` schema on athlete pages.

### Phase 8 — Parking lot (explicitly not v1)

Sponsor click tracking, scheduled publishing, multi-sport, polls, Kit Room commerce (Stripe), multi-language, sitemap automation, fan profile pages, comments, saved editions.

## Pre-flight checklist (start in parallel with Phase 0)

- [ ] Brevo: API key generated, **dedicated sender domain set up with DKIM/SPF** — propagation takes 24–48h, start now.
- [ ] Supabase: storage bucket created, public read policy set, service-role key in `.env`.
- [ ] Confirm a single test athlete fixture (Cobolli) is enough for v1.

## What we will throw away on purpose

- The temporary `body` text field on `Newsletter` (replaced by `DebriefSection` in Phase 5).
- The hardcoded test subscriber in Phase 3 (replaced by real signup in Phase 4).
- The dumb stub newsletter created via Prisma Studio in Phase 1 (replaced by admin-created newsletters in Phase 2).

These are intentional waste, not mistakes. They exist to validate one risk at a time.
