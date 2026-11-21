import { useEffect, useState } from "react";
import "./about.css";

const API = "http://localhost:5000/api/about";

interface AboutContent {
  pageTitle: string;
  headline: string;
  intro: string;
  whoIAm: string;
  whatIExplore: string;
  beyondTech: string;
  myDirection: string;
  profileImage: string | null;
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    async function loadAbout() {
      try {
        const response = await fetch(API);
        const data = await response.json();

        if (!response.ok || !data.about) {
          setUnavailable(true);
          return;
        }

        setAbout(data.about);
      } catch {
        setUnavailable(true);
      } finally {
        setLoading(false);
      }
    }

    loadAbout();
  }, []);

  if (loading) {
    return (
      <section className="about-public-loading">
        <p>Loading About page...</p>
      </section>
    );
  }

  if (unavailable || !about) {
    return (
      <section className="about-public-empty">
        <span className="technical-label">ABOUT / COMING SOON</span>
        <h1>This page is being prepared.</h1>
        <p>More about my background, interests, and journey will be shared here soon.</p>
        <a href="/">Return home</a>
      </section>
    );
  }

  const sections = [
    { title: "Who I Am", content: about.whoIAm, number: "01" },
    { title: "What I Explore", content: about.whatIExplore, number: "02" },
    { title: "Beyond Technology", content: about.beyondTech, number: "03" },
    { title: "My Direction", content: about.myDirection, number: "04" },
  ].filter((section) => section.content.trim());

  return (
    <div className="about-public-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="technical-label">GET TO KNOW ME</span>
          <h1>{about.headline || about.pageTitle}</h1>
          {about.intro && <p className="about-intro">{about.intro}</p>}
        </div>

        <div className="about-profile-frame">
          {about.profileImage ? (
            <img src={about.profileImage} alt="Profile" />
          ) : (
            <div className="about-profile-fallback">
              <span>VG</span>
              <small>PROFILE IMAGE</small>
            </div>
          )}
        </div>
      </section>

      {sections.length > 0 && (
        <section className="about-content-sections">
          {sections.map((section) => (
            <article className="about-content-row" key={section.number}>
              <span className="about-section-number">{section.number}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="about-bottom">
        <span className="technical-label">THANKS FOR STOPPING BY</span>
        <h2>There's always something new to explore.</h2>
        <a href="/projects">Explore my projects <span aria-hidden="true">↗</span></a>
      </section>
    </div>
  );
}