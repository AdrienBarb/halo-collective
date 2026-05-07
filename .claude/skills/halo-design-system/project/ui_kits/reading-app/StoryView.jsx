/* global React */
function StoryView({ onBack, onHome }) {
  const data = window.HALO_DATA;
  const story = data.story;
  const a = data.roster.find(x => x.slug === story.athleteSlug);

  return (
    <div>
      {/* Hero with frosted badges */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "5/4", overflow: "hidden", background: "linear-gradient(135deg,#5a6478,#2c3340)" }}>
        {a.hero && <img src={a.hero} alt={a.name} style={{
          width: "100%", height: "100%", objectFit: "cover", objectPosition: a.heroPos, display: "block"
        }}/>}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.45) 100%)"
        }}/>
        <div style={{ position: "absolute", top: 16, left: 20, display: "flex", gap: 8 }}>
          <FrostedBadge>★ MEMBER</FrostedBadge>
          <FrostedBadge dark>#{story.issueNum} · {story.date.split(" ").slice(0, 2).join(" ")}</FrostedBadge>
        </div>
        <button onClick={onBack} style={{
          position: "absolute", top: 16, right: 20, border: 0,
          background: "rgba(0,0,0,0.30)", color: "#fff",
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          padding: "6px 12px", borderRadius: 999, cursor: "pointer",
          backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.16)"
        }}>‹ Back</button>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, color: "#fff" }}>
          <div className="meta" style={{ color: "rgba(255,255,255,0.85)", fontSize: 9 }}>
            {a.flag} {story.location} · ISSUE #{story.issueNum}
          </div>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 28,
            letterSpacing: "-0.02em", lineHeight: 1.05, margin: "8px 0 0",
            textTransform: "uppercase", color: "#fff"
          }}>{story.title}</h1>
        </div>
        <FlagStripe colors={a.flagStripe} height={4} />
      </div>

      {/* Subtitle */}
      <div style={{ padding: "20px 20px 4px" }}>
        <p className="quote" style={{ margin: 0 }}>{story.subtitle}</p>
      </div>

      {/* 1 · MY DEBRIEF */}
      <div style={{ marginTop: 24 }}>
        <SectionBanner num="01" eyebrow="MY DEBRIEF" title="The voice note + the words" />
        <div style={{ padding: "20px 20px 0" }}>
          <VoiceNote {...story.voiceNote} />
        </div>
        <div style={{ padding: "16px 20px 0" }}>
          {story.debrief.map((p, i) => (
            <p key={i} className="p" style={{ margin: "0 0 12px" }}>{p}</p>
          ))}
        </div>
        <PullQuote source={story.quote.source} text={story.quote.text} />
      </div>

      {/* 2 · TOURNAMENT RECAP */}
      <div style={{ marginTop: 16 }}>
        <SectionBanner num="02" eyebrow="TOURNAMENT RECAP" title="Match by match" />
        <div style={{ padding: "16px 20px 0" }}>
          {story.matches.map((m, i) => <MatchCard key={i} {...m} />)}
        </div>
      </div>

      {/* 3 · YOUR TURN — Poll */}
      <div style={{ marginTop: 16 }}>
        <SectionBanner num="03" eyebrow="YOUR TURN" title="Help me pick the next peak" />
        <Poll question={story.poll.question} options={story.poll.options} />
        <div style={{ padding: "20px 20px 0" }}>
          <Meta>ASK ME A QUESTION</Meta>
          <p className="p" style={{ marginTop: 6 }}>
            I'll pick 3 fan questions and answer them in the next newsletter.
          </p>
          <textarea placeholder="Type your question…" style={{
            width: "100%", boxSizing: "border-box", marginTop: 10,
            background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: 8, padding: 12, minHeight: 72, resize: "vertical",
            fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)"
          }}/>
          <div style={{ marginTop: 10 }}>
            <BtnAction>Ask me a question →</BtnAction>
          </div>
        </div>
      </div>

      {/* 4 · MY KIT */}
      <div style={{ marginTop: 24 }}>
        <SectionBanner num="04" eyebrow="MY KIT" title={story.kit.title} />
        <div style={{ padding: "16px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {story.kit.items.map((it, i) => (
            <div key={i} style={{
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8
            }}>
              <div style={{
                aspectRatio: "1/1", background: "#fff", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid var(--line)"
              }}>
                <img src={it.img} alt={it.name} style={{ maxWidth: "70%", maxHeight: "70%", objectFit: "contain" }}/>
              </div>
              <div style={{
                fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 13,
                color: "var(--ink)", letterSpacing: "-0.01em"
              }}>{it.name}</div>
              <div className="meta" style={{ fontSize: 8 }}>{it.role}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 20px 0" }}>
          <BtnAction full>Discover Tecnifibre's tennis collection →</BtnAction>
        </div>
      </div>

      {/* Sponsors */}
      <div style={{ marginTop: 28 }}>
        <SponsorStrip sponsors={story.sponsors} />
      </div>

      {/* Subscribe */}
      <div style={{ padding: "24px 20px 8px" }}>
        <Meta>NEXT EDITION DROPS WEDNESDAY</Meta>
        <h3 style={{
          fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 20,
          letterSpacing: "-0.015em", margin: "8px 0 14px"
        }}>Want it in your inbox first?</h3>
        <BtnPrimary full>Get future editions in your inbox →</BtnPrimary>
      </div>
    </div>
  );
}

window.StoryView = StoryView;
