import { useEffect, useState } from "react";
import "./experience.css";

interface Experience {
  id: string;
  role: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getDuration(startDate: string, endDate: string | null, current: boolean) {
  const start = new Date(startDate);
  const end = current || !endDate ? new Date() : new Date(endDate);

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const parts = [];

  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`);
  }

  return parts.length ? parts.join(" ") : "Less than a month";
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExperiences() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:5000/api/experience");

        if (!response.ok) {
          throw new Error("Unable to load experience details.");
        }

        const data = await response.json();

        setExperiences(
          Array.isArray(data) ? data : data.experiences || []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading experiences."
        );
      } finally {
        setLoading(false);
      }
    }

    loadExperiences();
  }, []);

  return (
    <main className="experience-page">
      <section className="experience-hero">
        <p className="experience-eyebrow">MY JOURNEY</p>

        <h1>
          Experience<span>.</span>
        </h1>

        <p className="experience-intro">
          A look at the roles, responsibilities, and practical experiences
          that continue to shape my journey in technology.
        </p>
      </section>

      <section className="experience-content">
        {loading && (
          <p className="experience-status">Loading experience...</p>
        )}

        {!loading && error && (
          <p className="experience-status experience-error">{error}</p>
        )}

        {!loading && !error && experiences.length === 0 && (
          <div className="experience-empty">
            <span className="experience-empty-label">01 / JOURNEY</span>
            <h2>The journey is taking shape.</h2>
            <p>
              Experience details will appear here as they are published.
            </p>
          </div>
        )}

        {!loading && !error && experiences.length > 0 && (
          <div className="experience-timeline">
            {experiences.map((experience, index) => (
              <article className="experience-item" key={experience.id}>
                <div className="experience-marker">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div className="experience-line" />
                </div>

                <div className="experience-card">
                  <div className="experience-card-top">
                    <div>
                      <p className="experience-dates">
                        {formatDate(experience.startDate)} —{" "}
                        {experience.current
  ? "Present"
  : experience.endDate
    ? formatDate(experience.endDate)
    : "End date not specified"}
                      </p>

                      <h2>{experience.role}</h2>
                      <h3>{experience.company}</h3>
                    </div>

                    {experience.current && (
                      <span className="experience-current">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="experience-meta">
                    {experience.employmentType && (
                      <span>{experience.employmentType}</span>
                    )}

                    {experience.location && (
                      <span>{experience.location}</span>
                    )}

                    <span>
                      {getDuration(
                        experience.startDate,
                        experience.endDate,
                        experience.current
                      )}
                    </span>
                  </div>

                  {experience.description && (
                    <p className="experience-description">
                      {experience.description}
                    </p>
                  )}

                  {experience.responsibilities?.length > 0 && (
                    <div className="experience-responsibilities">
                      <h4>What I worked on</h4>

                      <ul>
                        {experience.responsibilities.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {experience.technologies?.length > 0 && (
                    <div className="experience-technologies">
                      {experience.technologies.map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}