# Halo Collective — Design System

> *The inside story, direct from the athlete.*

Halo Collective is a **done-for-you fan relationship service** for elite athletes. The product turns an athlete's social-media reach (millions of followers on Instagram / TikTok / X) into an **owned, monetizable email audience** — a private, members-only newsletter where the athlete shares match debriefs, voice notes, gear, schedule and the inside story between matches.

The brand voice is **the athlete's own**. Halo is a thin, editorial-feeling layer beneath; the wrapper around the locker-room intimacy.

---

## Sources

This system was distilled from the following codebase (read-only mount, owner imports from local FS):

- **`Athlete's Locker/`** — the consumer-facing webapp + admin newsletter editor (Vite + React + Tailwind + shadcn + Supabase). Theme name: **"Court Cream"**.
  - Theme tokens: `Athlete's Locker/src/index.css`
  - Tailwind config: `Athlete's Locker/tailwind.config.ts`
  - Mock content / schema: `Athlete's Locker/src/lib/mockData.ts`
  - Athletes directory (landing): `Athlete's Locker/src/pages/Landing.tsx`
  - Story view + sidebar shell: `Athlete's Locker/src/components/courtcream/AthleteShell.tsx` (~2,256 lines — the real source of truth for components)
  - Story building blocks: `Athlete's Locker/src/components/story/{IdentityBlock,MatchList,SectionHeader,Poll,VoiceNotePlayer,VideoPlayer,SponsorStrip,NewsletterContent}.tsx`

No Figma was provided; **all UI fidelity here is reverse-engineered from production code**, not screenshots.

---

## Products represented

The codebase contains **one product** with two surfaces:

1. **Member-facing reading app** (`/`, `/:athleteSlug`, `/:athleteSlug/:storySlug`) — the public Halo Collective experience: a roster of athletes, each with a hub of newsletter "stories" (issues). This is the primary surface the design system supports.
2. **Admin newsletter editor** (`/admin`, `/admin/newsletters/...`) — internal-only tool where ops staff parse `.eml` newsletter exports into structured stories. Lower fidelity; not a primary brand surface.

Athletes currently in the roster: **Flavio Cobolli (ITA)**, **Iga Świątek (POL)**, **Arthur Rinderknech (FRA)**, **Alexander Bublik (KAZ)**, **Elise Mertens (BEL)**.

---

## Index

```
README.md                     ← you are here
SKILL.md                      ← skill manifest (also works as Claude Code agent skill)
colors_and_type.css           ← all design tokens — colors, type, radii, shadows, spacing
fonts/                        ← (loaded from Google Fonts CDN — see Type section)
assets/
  portraits/                  ← athlete circular portraits
  heroes/                     ← athlete + tournament hero photography
  sponsors/                   ← sponsor logos (4–8 per athlete)
  imagery/                    ← editorial / kit imagery
preview/                      ← Design System tab cards
ui_kits/
  reading-app/                ← interactive recreation of the member-facing app
```

> No slide deck template was attached, so `slides/` is intentionally absent.

---

## Content fundamentals

**Voice — first-person, athlete-as-author.** Every piece of running copy is written from the athlete's POV: *"My debrief"*, *"My kit"*, *"My take"*, *"Ask me a question →"*. Halo never speaks in its own voice inside the newsletter — only the athlete does. Halo only speaks in the **chrome** (top bar, footer, "★ MEMBER" badge, "POWERED BY HALO COLLECTIVE").

**Tone — intimate and unfiltered, but composed.** The hero subtitle says it best: *"Honest match debriefs. The gear, the schedule, the wins and the losses — unfiltered, member-only, delivered between matches."* The italic serif is doing the heavy lifting — it reads like a journal. There is no marketing hype, no growth-hacky urgency, no exclamation marks.

**Pronouns.** Athlete → reader is **I / you**. ("I'll pick 3 fan questions and answer them in the next newsletter." "Tell me what worked, what didn't, and what you'd love to see next time…") Halo never uses "we".

**Casing.** Big editorial moments are **all-caps display serif** — landing hero (`THE INSIDE STORY, DIRECT FROM THE ATHLETE.`), athlete name on the story page, "MY DEBRIEF / TOURNAMENT RECAP / WHAT'S NEXT / MY KIT / YOUR TURN" module headers. Body copy is **Sentence case**. Mono labels (eyebrows, meta) are **UPPERCASE WITH WIDE TRACKING (0.15–0.22em)**.

**Bilingual.** Every CTA exists in EN and FR (e.g. `MY KIT` / `MON KIT`, `Ask me a question →` / `Pose moi une question →`). The `language` field on each athlete drives the locale; Świątek is EN, Rinderknech is FR, etc.

**Emoji — minimally, only as data.** Country flag emoji (🇮🇹 🇫🇷 🇵🇱 🇰🇿 🇧🇪) under athlete names; emoji per poll option as a quick visual key. **Never** as decoration or punctuation.

**Tropes / specific examples to copy.**
- Eyebrow + module title pattern: *"01 · MY DEBRIEF"* / *"My Monte-Carlo week, raw"*
- Member badge: *"★ MEMBER"* (or *"★ MEMBRE"*)
- Issue meta: *"#03 · 22 APR 2026"*
- CTA verbs that mean it: *Discover On's tennis collection →*, *Watch the highlights →*, *Submit my vote*, *Ask me a question →*
- Microcopy on form helpers is empathetic, not cute: *"I'll pick 3 fan questions and answer them in the next newsletter."*
- Highlights buttons say what they do: *Watch highlights →* / *Voir les highlights*

**Numbers and dates.** Tabular nums, day-month-year, locale-aware. Issue numbers are zero-padded (`#03`, `#12`). Match scores are mono and oversized. Rankings always carry the federation prefix (`ATP #13`, `WTA #4`).

---

## Visual foundations

### Color
Court Cream is **warm-paper editorial** — a single restrained palette, athlete-agnostic. The brand intentionally **does not** retheme per athlete; the only per-athlete chrome is the **flag-color stripe** under each roster portrait and the **flag emoji + country name** under the H1. Earlier theme experiments did per-athlete primaries — those were unified into a single palette (`UNIFIED_PALETTE` in `AthleteShell.tsx`, comment: *"Unified palette across ALL athletes/newsletters per brand spec"*).

- **Background** is `#f1ebde` (cream). Not white. Never pure white anywhere — even surface cards are `#fbf6e9`.
- **Ink** is `#1a1612` — warm near-black, not pure black.
- **Accent gold** `#c8932e` is reserved for eyebrows, the 3px gold stripe on top of every navy module banner, and category eyebrow text. It almost never fills a button.
- **Action blue** `#5ba9d8` is the *only* CTA color: voice-note play buttons, "Watch highlights", poll submit, kit CTA, "Ask me a question". One product = one action color.
- **Navy banner** `#1e2d4a` is module-header only. Never elsewhere.
- **Match results** use `#2e7d32` (W) / `#7a1f1f` (L) / muted gray (BYE) — saturation kept low, no neon.

### Type
Three families, sharply differentiated.

- **Fraunces (variable serif)** — display, H1, H2, athlete names, italic pull-quotes, the wordmark "HALO". Weight 400–600, often `font-variation-settings: opsz` for opticals. Italic = quotes only; upright = headlines.
- **Inter Tight (sans)** — all body copy, paragraphs, athlete name on cards. 13–15px, line-height 1.5–1.55.
- **JetBrains Mono** — labels, eyebrows, dates, ranks, button text, issue numbers. 8–11px with **wide tracking 0.15–0.22em**, almost always uppercase. This is the visual signature of the system — pure newspaper mast-style mono.

Hierarchy is enforced by **family contrast**, not weight: a serif H2 over a mono eyebrow over a sans paragraph creates the editorial cadence.

### Backgrounds & imagery
- **Photography is hero-first, full-bleed**, but always cropped tight to the athlete's face/body (`object-position: center 15%`–`25%`). It's never decorative — every image is a portrait, a tournament shot, or a kit product photo.
- **No gradients as decoration.** The only gradients in the system are (a) a 35% black-fade overlay over hero images for readability, and (b) the dark slate fallback `linear-gradient(135deg, #5a6478 0%, #2c3340 100%)` used as a **placeholder** when an athlete has no portrait — a chrome-grey tile with white initials.
- **No textures, no grain, no patterns.** The cream `#f1ebde` itself is the only "texture."
- **Color vibe of imagery: warm, action-shot, daylit.** Not stylized; raw broadcast feeds and press shots.
- **Flag color stripes** (3–4px tall, 2–3 segments) sit between portrait and metadata on athlete cards — the only place flag chroma enters the system.

### Animation
- **Restrained.** Only one keyframe in the codebase: `fade-in` (`opacity 0 → 1` + `translateY(6px → 0)`, 0.4s ease-out). Used for revealing the waveform under the voice player after click.
- **Tailwind-animate** drives Radix primitives (accordion-down/up).
- Hovers are **CSS transitions only**: `filter: brightness()` on dark buttons, `opacity` 0.85→1 on sponsor logos, `transform: translateY(-2px) + box-shadow` on athlete roster cards.
- **No bounces, no spring physics, no scroll-driven animation.** This is an editorial product, not a marketing site.

### Hover & press states
- Dark CTAs (`btn-primary`, navy/ink): `filter: brightness(0.92)` on hover.
- Action-color CTAs: `hover:brightness-110` (subtle lift) — defined inline.
- Sponsor logos: `opacity: 0.85 → 1` on hover.
- Athlete roster cards: `translateY(-2px)` + soft shadow `0 8px 24px rgba(0,0,0,0.10)`.
- Press states: same as hover; **no shrink/scale-down**, no inversion. Disabled state is `opacity: 0.5`.

### Borders
- **Hairline by default.** `1px solid #d8cfb6` (`--line`) is everywhere — between sections, around cards, around inputs. The thicker `--line-2 #beb295` is reserved for prev/next pill buttons in the timeline.
- **No double borders, no inner glows, no decorative outlines.**
- `1px dashed --line` separates match notes from match metadata inside match cards — the only dashed border in the system.

### Shadows
- **Three discrete shadows**, no scale.
  - `0 8px 24px rgba(0,0,0,0.10)` — roster card hover lift.
  - `0 6px 20px rgba(0,0,0,0.22)` — circular athlete portrait.
  - `0 6px 20px rgba(0,0,0,0.45)` — large central play button on video widgets (needs to read against motion).
- **No inner shadows.** **No multi-layer "elevation" system.** Cards live on borders, not shadows.

### Protection gradients vs capsules
- The hero image carries a **protection gradient** for badge legibility (`rgba(0,0,0,0.28) → 0 → 0.18`).
- The `★ MEMBER` and `#03 · 22 APR` badges sitting on hero images are **frosted capsules** — `background: rgba(255,255,255,0.16); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.22); border-radius: 999px`. This is the brand's signature detail on dark photography.
- Top nav is also a **frosted bar**: `bg-bg/90` + `backdrop-filter: blur(10px)`.

### Layout
- **Single column, 480px max-content width.** This is a newsletter recreation — designed for phone, comfortable on desktop.
- Page padding `20px` left/right, vertical rhythm in 14/18/22/40px.
- The story page uses a **sticky-top blurred nav** + flow content + sticky-side timeline of past issues on tablet/desktop.
- **Fixed elements**: top nav (`position: sticky; top: 0; z-index: 50–100`); the editions timeline is sticky in the desktop sidebar.

### Transparency & blur
- Used **only twice**: the frosted top nav and the frosted member/issue capsules over hero photography. Everywhere else is opaque cream.

### Corner radii
- **10px** for primary CTA buttons (`btn-primary-cta`).
- **4px** for action-blue mono buttons (Watch highlights, Submit, Discover →).
- **8–12px** for video frames, voice players, match cards.
- **14px** for the voice-note player outer container.
- **16px** for athlete roster cards.
- **999px (pill)** only for badges and tiny prev/next nav circles.
- **No ovals, no full-bleed rounded sections.**

### Cards
- Cream surface `#fbf6e9` over slightly darker page cream `#f1ebde`.
- 1px hairline border `#d8cfb6`.
- 12–16px radius.
- 12–14px internal padding.
- **No drop shadow** at rest. Shadow only on hover for interactive cards.
- Internal hierarchy: mono meta-row → serif title → sans body → mono CTA.

---

## Iconography

**Lucide React** (v0.462) is the icon library — imported at the component level, e.g. `import { Pause, Play } from "lucide-react"`. It's used **sparingly**: play/pause inside the voice-note player, dropdown carets, the chevrons in radix menus. There is **no decorative iconography** — the design relies on type and photography instead.

**Custom inline SVGs** are used for the central video play triangles (`<svg width="22" height="22"><path d="M8 5v14l11-7z"/></svg>`) and the audio-waveform bars (drawn as 2px-wide divs, not SVG). These are not part of an icon set — they're one-offs.

**Wavesurfer.js** is used to render the actual audio waveforms in the expanded voice-note player. Not iconography per se but visually prominent.

**Flag emoji as data.** Country flags appear as native unicode emoji (🇮🇹 🇫🇷 🇵🇱 🇰🇿 🇧🇪) — never as PNGs or SVGs. They're treated as textual content (1.0em font-size, inline with the country name).

**Unicode glyphs.**
- `★` for the MEMBER badge
- `→` arrow at the end of every CTA label (this is *the* visual signature: every action ends in `→`)
- `›` `‹` for prev/next in the editions carousel
- `◆` rare, for the gold stripe accent

**Sponsor logos** are bitmap (PNG / WEBP / JPG), uploaded at original brand resolution and resized via `max-height: 32px; object-fit: contain`. They remain in their native colors.

**No icon font.** No emoji as decoration.

**For this design system:** when generating new UI, prefer the lucide-react set (or its CDN-equivalent `lucide` for plain HTML — see `https://lucide.dev/`). Do not invent icons; if a needed icon is not in lucide, leave a placeholder and ask.

---

## Substitutions to flag

- **Fonts** — Fraunces, Inter Tight, and JetBrains Mono are **all Google Fonts**, loaded directly from `fonts.googleapis.com`. No local TTF files were shipped in the codebase. The CSS imports them at the top of `colors_and_type.css`. **No substitution was needed**, but if the user wants offline-capable assets they should drop the TTFs into `fonts/` and we'll rewrite the @import block to a local @font-face stack.
- **Athlete & sponsor imagery** — most production photography is served from `img.mailinblue.com` (Brevo / Sendinblue's CDN, used by the underlying email-newsletter platform). Those URLs are referenced in `mockData.ts` and `AthleteShell.tsx` but **not bundled locally**. Local hero/portrait copies are in `assets/heroes/` and `assets/portraits/`. For high-fidelity work that needs offline assets, the user may need to mirror the mailinblue CDN images.

---

## Iterating

**This system is the first pass — please help me sharpen it.** Specific areas where I'd love your input:

- Is **"Court Cream"** actually the official Halo brand, or is it one theme of several? The codebase has a `/courtcream/` folder which suggests there may be other themes I haven't seen.
- Is there a **logo file** (SVG / PNG) for HALO COLLECTIVE? I've recreated the wordmark as a typographic composite (italic Fraunces "HALO" + mono small-caps "COLLECTIVE") because no logo asset was in the codebase. If a real one exists, please drop it in `assets/`.
- Are there **brand guidelines outside the codebase** (a Notion doc, a Figma file, a brand book)? Voice / tone / illustration rules I should bake in?
- Should **slides** exist for this brand (sales decks, athlete pitch decks)? None were provided; happy to build a slide template if there's a template to copy.

