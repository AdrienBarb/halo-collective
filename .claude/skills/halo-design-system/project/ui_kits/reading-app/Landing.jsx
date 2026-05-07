/* global React, RosterCard */
const { useState: useState_l } = React;

function Landing({ onAthleteClick }) {
  const data = window.HALO_DATA;
  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "44px 20px 32px", borderBottom: "1px solid var(--line)" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>HALO COLLECTIVE · MEMBER‑ONLY</div>
        <h1 className="h-display" style={{ fontSize: 30, lineHeight: 1.05, margin: 0 }}>
          The inside story,<br/>direct from the athlete.
        </h1>
        <p className="quote" style={{ margin: "16px 0 0", fontSize: 16 }}>
          Honest match debriefs. The gear, the schedule, the wins and the losses — unfiltered, member‑only, delivered between matches.
        </p>
      </div>

      {/* Roster */}
      <div style={{ padding: "24px 20px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <Meta>THE ROSTER</Meta>
          <Meta style={{ fontSize: 8 }}>{data.roster.length} ATHLETES</Meta>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {data.roster.map(a => (
            <RosterCard key={a.slug} athlete={a} onClick={() => onAthleteClick(a.slug)} />
          ))}
        </div>
      </div>
    </div>
  );
}

window.Landing = Landing;
