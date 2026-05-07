/* global React */
const { useState, useEffect, useRef } = React;

// ---------------- Wordmark / chrome ----------------
function Wordmark({ size = "md", inverse = false }) {
  const sizes = {
    sm: { halo: 14, coll: 8 },
    md: { halo: 18, coll: 10 },
    lg: { halo: 24, coll: 13 }
  };
  const s = sizes[size];
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
      <span style={{
        fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500,
        fontSize: s.halo, letterSpacing: "-0.02em",
        color: inverse ? "var(--bg)" : "var(--ink)"
      }}>HALO</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontWeight: 600,
        fontSize: s.coll, letterSpacing: "0.18em", textTransform: "uppercase",
        color: inverse ? "var(--line-2)" : "var(--ink-3)"
      }}>COLLECTIVE</span>
    </span>
  );
}

function Topbar({ onHome, current }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(241,235,222,0.9)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--line)",
      padding: "12px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <button onClick={onHome} style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}>
        <Wordmark size="md" />
      </button>
      <span className="meta" style={{ fontSize: 9 }}>{current}</span>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      borderTop: "1px solid var(--line)", padding: "24px 20px",
      textAlign: "center", marginTop: 40
    }}>
      <Wordmark size="sm" />
      <div className="meta" style={{ marginTop: 10, fontSize: 8 }}>
        POWERED BY HALO COLLECTIVE · MEMBER‑ONLY · NO RESALE
      </div>
    </div>
  );
}

// ---------------- Atoms ----------------
function Eyebrow({ children, color }) {
  return <div className="eyebrow" style={{ color: color || "var(--accent)" }}>{children}</div>;
}
function Meta({ children, style }) { return <div className="meta" style={style}>{children}</div>; }

function FlagStripe({ colors, height = 4 }) {
  return (
    <div style={{ display: "flex", height }}>
      {colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
    </div>
  );
}

function FrostedBadge({ children, dark }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 9,
      letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff",
      background: dark ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.16)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.22)",
      padding: "5px 10px", borderRadius: 999
    }}>{children}</span>
  );
}

function BtnPrimary({ children, onClick, full }) {
  return (
    <button onClick={onClick} style={{
      background: "var(--ink)", color: "var(--bg)", border: 0,
      fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11,
      letterSpacing: "0.15em", textTransform: "uppercase",
      padding: "14px 20px", borderRadius: 10, cursor: "pointer",
      width: full ? "100%" : "auto", transition: "filter .15s"
    }}
    onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.92)"}
    onMouseLeave={e => e.currentTarget.style.filter = "none"}
    >{children}</button>
  );
}

function BtnAction({ children, onClick, full, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: "var(--action)", color: "#fff", border: 0,
      fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: 11,
      letterSpacing: "0.05em", textTransform: "uppercase",
      padding: "10px 18px", borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer",
      width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1
    }}>{children}</button>
  );
}

// ---------------- Section banner ----------------
function SectionBanner({ num, eyebrow, title }) {
  return (
    <div style={{
      background: "var(--banner-bg)", color: "var(--bg)",
      padding: "16px 20px 14px", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)"
      }}/>
      <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 6 }}>
        {num} · {eyebrow}
      </div>
      <h2 style={{
        fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 20,
        letterSpacing: "-0.015em", lineHeight: 1.15, margin: 0, color: "var(--bg)"
      }}>{title}</h2>
    </div>
  );
}

// ---------------- Voice note ----------------
function VoiceNote({ duration, title, date }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => (p + 1.5) % 100), 80);
    return () => clearInterval(id);
  }, [playing]);
  const bars = 32;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "var(--surface)", border: "1px solid var(--line)",
      borderRadius: 14, padding: 12
    }}>
      <button onClick={() => setPlaying(p => !p)} style={{
        width: 42, height: 42, borderRadius: "50%", border: 0,
        background: "var(--action)", color: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, flexShrink: 0
      }}>{playing ? "❚❚" : "▶"}</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Meta style={{ fontSize: 9, color: "var(--ink-3)" }}>VOICE NOTE · {duration} · {date}</Meta>
        <div style={{
          fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 14,
          color: "var(--ink)", marginTop: 2
        }}>{title}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16, marginTop: 6 }}>
          {Array.from({ length: bars }).map((_, i) => {
            const seed = (Math.sin(i * 1.7) + 1) * 0.5;
            const h = 4 + seed * 12;
            const pct = (i / bars) * 100;
            return <div key={i} style={{
              width: 2, height: h, borderRadius: 1,
              background: pct < progress ? "var(--action)" : "var(--ink-3)",
              opacity: pct < progress ? 1 : 0.4
            }}/>;
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------- Match card ----------------
function MatchCard({ result, round, date, oppName, oppRank, oppFlag, score, notes }) {
  const colors = { W: "#2e7d32", L: "#7a1f1f", BYE: "#beb295" };
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--line)",
      borderRadius: 12, padding: 12, marginBottom: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, background: colors[result],
          color: "#fff", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{result}</div>
        <Meta style={{ fontSize: 10 }}>{round} · {date}</Meta>
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
        {oppName} <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 10, color: "var(--ink-3)" }}>{oppRank} · {oppFlag}</span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24,
        letterSpacing: "0.04em", margin: "10px 0 4px", color: "var(--ink)",
        fontVariantNumeric: "tabular-nums"
      }}>{score}</div>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5,
        color: "var(--ink-2)", margin: 0, marginTop: 10, paddingTop: 10,
        borderTop: "1px dashed var(--line)"
      }}>{notes}</p>
      <button style={{
        background: "var(--action)", color: "#fff", border: 0,
        fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: 11,
        letterSpacing: "0.05em", textTransform: "uppercase",
        padding: "8px 16px", borderRadius: 4, marginTop: 10, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 7
      }}><span style={{ fontSize: 9 }}>▶</span> Watch highlights →</button>
    </div>
  );
}

// ---------------- Poll ----------------
function Poll({ question, options }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div>
      <div style={{ padding: "16px 20px 12px" }}>
        <p className="quote-sm" style={{ margin: 0 }}>"{question}"</p>
      </div>
      <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        {options.map((o, i) => {
          const isSel = selected === i;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                textAlign: "left", padding: "14px 20px",
                borderBottom: i < options.length - 1 ? "1px solid var(--line)" : 0,
                border: 0, borderTop: 0, borderLeft: 0, borderRight: 0,
                background: isSel ? "rgba(91,169,216,0.12)" : (i % 2 ? "#fff" : "var(--surface)"),
                cursor: submitted ? "default" : "pointer", position: "relative"
              }}>
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${isSel ? "var(--action)" : "var(--line-2)"}`,
                background: isSel ? "var(--action)" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {isSel && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}/>}
              </span>
              <span style={{ fontSize: 16 }}>{o.emoji}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", flex: 1 }}>{o.label}</span>
              {submitted && isSel && <span className="meta" style={{ fontSize: 9, color: "var(--ok)" }}>VOTED</span>}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px 0" }}>
        <BtnAction full disabled={selected === null || submitted}
          onClick={() => setSubmitted(true)}>
          {submitted ? "Thanks for voting" : "Submit my vote"}
        </BtnAction>
      </div>
    </div>
  );
}

// ---------------- Sponsor strip ----------------
function SponsorStrip({ sponsors, label = "PARTNERS" }) {
  return (
    <div style={{
      padding: "20px 20px 24px", borderTop: "1px solid var(--line)",
      borderBottom: "1px solid var(--line)"
    }}>
      <div className="tiny" style={{ textAlign: "center", marginBottom: 16 }}>{label}</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(4, sponsors.length)}, 1fr)`,
        alignItems: "center", justifyItems: "center", columnGap: 12, rowGap: 18
      }}>
        {sponsors.map((s, i) => (
          <img key={i} src={s.img} alt={s.name}
            style={{ maxHeight: 32, maxWidth: "100%", objectFit: "contain", opacity: 0.85 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.85}/>
        ))}
      </div>
    </div>
  );
}

// ---------------- Stats row ----------------
function StatsRow({ items }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)"
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          textAlign: "center", padding: "14px 8px",
          borderRight: i < items.length - 1 ? "1px solid var(--line)" : 0
        }}>
          <div style={{
            fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 22,
            letterSpacing: "-0.01em", lineHeight: 1, color: "var(--ink)"
          }}>{it.value}</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--ink-3)", marginTop: 6
          }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Roster card ----------------
function RosterCard({ athlete, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transform: hover ? "translateY(-2px)" : "none",
        boxShadow: hover ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
        transition: "transform .15s, box-shadow .15s"
      }}>
      <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "linear-gradient(135deg, #5a6478, #2c3340)" }}>
        {athlete.hero && <img src={athlete.hero} alt={athlete.name} style={{
          width: "100%", height: "100%", objectFit: "cover", objectPosition: athlete.heroPos, display: "block"
        }}/>}
      </div>
      <FlagStripe colors={athlete.flagStripe} />
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{
          fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 15,
          letterSpacing: "-0.01em", lineHeight: 1.1, color: "var(--ink)"
        }}>{athlete.name}</div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
          color: "var(--ink-3)", marginTop: 4
        }}>{athlete.tour} #{athlete.rank}</div>
      </div>
    </div>
  );
}

// ---------------- Issue tile ----------------
function IssueTile({ issue, onClick, athlete }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "stretch", width: "100%", textAlign: "left",
      background: "var(--surface)", border: "1px solid var(--line)",
      borderRadius: 12, padding: 0, cursor: "pointer", overflow: "hidden",
      marginBottom: 10
    }}>
      <div style={{
        width: 76, background: "var(--banner-bg)", color: "var(--bg)",
        padding: "12px 10px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        position: "relative"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--accent)" }}/>
        <div style={{
          fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 22,
          letterSpacing: "-0.02em", color: "var(--bg)"
        }}>#{issue.num}</div>
        <div className="meta" style={{ fontSize: 8, color: "var(--line-2)", marginTop: 4 }}>{issue.date}</div>
      </div>
      <div style={{ padding: "12px 14px", flex: 1 }}>
        <div className="eyebrow" style={{ fontSize: 9 }}>{issue.tag}</div>
        <div style={{
          fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 15,
          letterSpacing: "-0.01em", lineHeight: 1.15, color: "var(--ink)", marginTop: 4
        }}>{issue.title}</div>
        <div className="meta" style={{ fontSize: 9, marginTop: 8, color: "var(--ink-3)" }}>READ →</div>
      </div>
    </button>
  );
}

// ---------------- Pull quote ----------------
function PullQuote({ source, text }) {
  return (
    <div style={{ borderLeft: "3px solid var(--accent)", padding: "6px 0 6px 14px", margin: "20px 20px" }}>
      <div className="meta" style={{ fontSize: 9, marginBottom: 5 }}>{source}</div>
      <p style={{
        fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400,
        fontSize: 15, lineHeight: 1.4, letterSpacing: "-0.005em",
        color: "var(--ink)", margin: 0
      }}>"{text}"</p>
    </div>
  );
}

// ---------------- Athlete portrait ----------------
function AthletePortrait({ athlete, size = 96 }) {
  if (athlete.portrait) {
    return <img src={athlete.portrait} alt={athlete.name} style={{
      width: size, height: size, borderRadius: "50%", objectFit: "cover",
      objectPosition: "center 20%",
      boxShadow: "0 6px 20px rgba(0,0,0,0.22)"
    }}/>;
  }
  const initials = athlete.name.split(" ").map(p => p[0]).slice(0, 2).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #5a6478 0%, #2c3340 100%)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: size * 0.34,
      letterSpacing: "-0.02em", boxShadow: "0 6px 20px rgba(0,0,0,0.22)"
    }}>{initials}</div>
  );
}

Object.assign(window, {
  Wordmark, Topbar, Footer, Eyebrow, Meta, FlagStripe, FrostedBadge,
  BtnPrimary, BtnAction, SectionBanner, VoiceNote, MatchCard, Poll,
  SponsorStrip, StatsRow, RosterCard, IssueTile, PullQuote, AthletePortrait
});
