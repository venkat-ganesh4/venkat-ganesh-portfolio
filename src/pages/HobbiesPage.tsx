import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./hobbies.css";

type Hobby = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category?: string;
  coverImage?: string;
};

export default function HobbiesPage() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/hobbies")
      .then((res) => res.json())
      .then((data) => setHobbies(data.hobbies || []))
      .catch(() => setHobbies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="hobbies-page">
      <div className="hobbies-container">
        <header className="hobbies-intro">
          <span className="hobbies-kicker">BEYOND THE SCREEN</span>
          <h1>My Hobbies<span>.</span></h1>
          <p>
            The things I enjoy exploring, creating, and experiencing outside of
            work. A little glimpse into what makes me curious.
          </p>
        </header>

        {loading ? (
          <p className="hobbies-loading">Loading...</p>
        ) : hobbies.length === 0 ? (
          <div className="hobbies-empty">
            <h2>More than just code.</h2>
            <p>Personal interests and creative explorations will find their place here.</p>
          </div>
        ) : (
          <div className="hobbies-grid">
            {hobbies.map((hobby, index) => (
              <Link
                to={`/hobbies/${hobby.slug}`}
                key={hobby.id}
                className={`hobby-card ${index % 3 === 1 ? "hobby-card-offset" : ""}`}
              >
                <div className="hobby-card-image">
                  {hobby.coverImage ? (
                    <img src={hobby.coverImage} alt={hobby.title} loading="lazy" />
                  ) : (
                    <div className="hobby-image-placeholder">
                      <span>VG / INTERESTS</span>
                    </div>
                  )}
                  <span className="hobby-card-arrow">↗</span>
                </div>
                <div className="hobby-card-content">
                  {hobby.category && <span className="hobby-category">{hobby.category}</span>}
                  <h2>{hobby.title}</h2>
                  <p>{hobby.summary}</p>
                  <span className="hobby-explore">Explore <span>→</span></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
