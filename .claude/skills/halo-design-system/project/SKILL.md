---
name: halo-collective-design
description: Use this skill to generate well-branded interfaces and assets for Halo Collective, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the member-facing reading app + athlete newsletters.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. The system tokens live in `colors_and_type.css` — link or inline it. Athlete photography lives in `assets/heroes/` and `assets/portraits/`; sponsor logos in `assets/sponsors/`. The reading-app UI kit in `ui_kits/reading-app/` contains pixel-faithful React recreations of the three core screens (landing, athlete hub, story view) plus all atoms (Wordmark, Topbar, FrostedBadge, BtnPrimary, BtnAction, SectionBanner, VoiceNote, MatchCard, Poll, SponsorStrip, StatsRow, RosterCard, IssueTile, PullQuote, AthletePortrait) — copy and reuse rather than re-inventing.

If working on production code, read the rules in README.md (CONTENT FUNDAMENTALS + VISUAL FOUNDATIONS + ICONOGRAPHY) to become an expert in designing with this brand. Halo's signature is restraint: warm cream backgrounds (never white), three-family typography contrast (Fraunces serif + Inter Tight sans + JetBrains Mono labels), a single action blue (`#5ba9d8`) for ALL CTAs, navy module banners with a 3px gold top stripe, frosted member/issue badges over hero photography, and copy written in the athlete's first-person voice.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
