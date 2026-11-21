import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./hobbies.css";

type Hobby = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category?: string;
  coverImage?: string;
  galleryImages: string[];
};

export default function HobbyDetailsPage() {
  const { slug } = useParams();
  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/hobbies")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.hobbies || []).find((item: Hobby) => item.slug === slug);
        setHobby(found || null);
      })
      .catch(() => setHobby(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <section className="hobby-detail-page"><p>Loading...</p></section>;
  }

  if (!hobby) {
    return (
      <section className="hobby-detail-page">
        <div className="hobbies-container">
          <h1>Hobby not found.</h1>
          <Link to="/hobbies">← Back to My Hobbies</Link>
        </div>
      </section>
    );
  }

  return (
    <article className="hobby-detail-page">
      <div className="hobbies-container">
        <Link to="/hobbies" className="hobby-back-link">← All Hobbies</Link>

        <header className="hobby-detail-header">
          {hobby.category && <span className="hobbies-kicker">{hobby.category}</span>}
          <h1>{hobby.title}<span>.</span></h1>
          <p>{hobby.summary}</p>
        </header>

        {hobby.coverImage && (
          <div className="hobby-detail-cover">
            <img src={hobby.coverImage} alt={hobby.title} />
          </div>
        )}

        {hobby.description && (
          <div className="hobby-detail-description">
            {hobby.description.split("\n").map((paragraph, index) =>
              paragraph.trim() ? <p key={index}>{paragraph}</p> : null
            )}
          </div>
        )}

        {hobby.galleryImages?.length > 0 && (
          <section className="hobby-detail-gallery">
            <h2>Moments &amp; Frames</h2>
            <div className="hobby-gallery-grid">
              {hobby.galleryImages.map((image, index) => (
                <img src={image} alt={`${hobby.title} gallery ${index + 1}`} key={`${image}-${index}`} loading="lazy" />
              ))}
            </div>
          </section>
        )}

        <div className="hobby-detail-end">
          <span>END OF THIS CHAPTER</span>
          <Link to="/hobbies">Explore other interests →</Link>
        </div>
      </div>
    </article>
  );
}
