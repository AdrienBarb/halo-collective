# Halo Collective — Reading App UI kit

Member-facing webapp recreation. Three click-thru screens:

1. **Landing** — `index.html` opens here. Editorial hero + roster grid of 5 athletes.
2. **Athlete hub** — click any roster card to land on the athlete's profile (portrait, stats, latest issue list).
3. **Story view** — click an issue to read the full newsletter (hero, voice note, debrief, match list, poll, kit, sponsors).

## Files

- `index.html` — host shell. Loads React + Babel, mounts `<App>`, manages route state in-memory (no real router; clicks update state).
- `App.jsx` — top-level router/state.
- `Landing.jsx` — eyebrow hero + RosterGrid.
- `AthleteHub.jsx` — portrait + stats + issue timeline.
- `StoryView.jsx` — full story page with all modules.
- `components.jsx` — reusable atoms: `Topbar`, `Footer`, `SectionBanner`, `MatchCard`, `VoiceNote`, `Poll`, `SponsorStrip`, `IssueTile`, `RosterCard`, `FrostedBadge`, `BtnPrimary`, `BtnAction`, `Eyebrow`, `Meta`, `PullQuote`, `Wordmark`, `FlagStripe`, `StatsRow`.
- `data.js` — fixtures (roster, issues, matches, sponsors).

## Notes

- Single column, 480px max-content width — designed mobile-first.
- All copy is in voice (English for Świątek/Cobolli/Mertens, French for Rinderknech).
- Click anywhere blue → action (play voice note, vote in poll, open story).
- This is a **visual recreation** — voice notes don't actually play, polls don't actually submit.
