/* global React */
function AthleteHub({ slug, onBack, onIssueClick }) {
  const data = window.HALO_DATA;
  const a = data.roster.find(x => x.slug === slug);
  const issues = data.issues[slug] || [
    { num: a.latestIssue, date: a.latestDate, title: a.latestTitle, tag: "Latest" }
  ];
  return (
    <div>
      {/* Hero photo with frosted badges */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden", background: "linear-gradient(135deg,#5a6478,#2c3340)" }}>
        {a.hero && <img src={a.hero} alt={a.name} style={{
          width: "100%", height: "100%", objectFit: "cover", objectPosition: a.heroPos, display: "block"
        }}/>}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.18) 100%)"
        }}/>
        <div style={{ position: "absolute", top: 16, left: 20, display: "flex", gap: 8 }}>
          <FrostedBadge>★ MEMBER</FrostedBadge>
        </div>
        <button onClick={onBack} style={{
          position: "absolute", top: 16, right: 20, border: 0,
          background: "rgba(0,0,0,0.30)", color: "#fff",
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          padding: "6px 12px", borderRadius: 999, cursor: "pointer",
          backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.16)"
        }}>‹ Back</button>
        <FlagStripe colors={a.flagStripe} height={4} />
      </div>

      {/* Identity block */}
      <div style={{ padding: "20px 20px 16px", display: "flex", gap: 16, alignItems: "center" }}>
        <AthletePortrait athlete={a} size={72} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Meta style={{ fontSize: 9 }}>{a.flag} {a.country.toUpperCase()} · {a.sport.toUpperCase()}</Meta>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 24,
            letterSpacing: "-0.02em", lineHeight: 1.05, margin: "4px 0 0", color: "var(--ink)"
          }}>{a.name}</h1>
        </div>
      </div>

      {/* Stats */}
      <StatsRow items={[
        { value: `#${a.rank}`, label: `${a.tour} WORLD` },
        { value: `#${a.countryRank}`, label: a.countryCode },
        { value: a.titles, label: "TITLES" }
      ]}/>

      {/* About / member intro */}
      <div style={{ padding: "20px 20px 8px" }}>
        <Eyebrow>WHY I'M HERE</Eyebrow>
        <p className="quote-sm" style={{ marginTop: 8 }}>
          "I wanted a space to talk to you that wasn't a 30‑second clip. Match debriefs, voice notes, the kit, the schedule — all in one place, between matches."
        </p>
      </div>

      {/* Issue archive */}
      <div style={{ padding: "16px 20px 8px" }}>
        <Meta style={{ marginBottom: 10 }}>EDITIONS · {issues.length}</Meta>
        {issues.map(iss => (
          <IssueTile key={iss.num} issue={iss}
            onClick={() => onIssueClick(slug, iss.num)} />
        ))}
      </div>

      {/* Subscribe CTA */}
      <div style={{ padding: "12px 20px 32px" }}>
        <BtnPrimary full>Get future editions in your inbox →</BtnPrimary>
      </div>
    </div>
  );
}

window.AthleteHub = AthleteHub;
