/* global React, Landing, AthleteHub, StoryView, Topbar, Footer */
const { useState } = React;

function App() {
  const [route, setRoute] = useState({ view: "landing" });

  const onAthleteClick = (slug) => setRoute({ view: "hub", slug });
  const onIssueClick = (slug, num) => setRoute({ view: "story", slug, num });
  const onHome = () => setRoute({ view: "landing" });
  const onBackFromStory = () => setRoute({ view: "hub", slug: route.slug });

  let body, label;
  if (route.view === "landing") {
    body = <Landing onAthleteClick={onAthleteClick} />;
    label = "ROSTER";
  } else if (route.view === "hub") {
    const a = window.HALO_DATA.roster.find(x => x.slug === route.slug);
    body = <AthleteHub slug={route.slug} onBack={onHome} onIssueClick={onIssueClick} />;
    label = a.name.toUpperCase();
  } else {
    body = <StoryView onBack={onBackFromStory} onHome={onHome} />;
    label = `ISSUE #${window.HALO_DATA.story.issueNum}`;
  }

  return (
    <div style={{
      maxWidth: "var(--content-max)", margin: "0 auto",
      background: "var(--surface)", minHeight: "100vh",
      borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)"
    }}>
      <Topbar onHome={onHome} current={label} />
      {body}
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
