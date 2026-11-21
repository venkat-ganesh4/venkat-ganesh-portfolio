import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./projects.css";

interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string | null;
  coverImage: string | null;
  galleryImages: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

const API = "http://localhost:5000/api/projects";

export default function ProjectDetailsPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(API);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load project.");
        }

        const found = (data.projects || []).find(
          (item: Project) => item.slug === slug
        );

        setProject(found || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <section className="section">
        <div className="container projects-state">Loading project...</div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="section">
        <div className="container projects-state">
          <h1>{error ? "Unable to load project" : "Project not found"}</h1>
          <p>{error || "This project may have been removed or unpublished."}</p>
          <Link to="/projects" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </section>
    );
  }

  const gallery = project.galleryImages || [];

  return (
    <section className="section project-detail-page">
      <div className="container">
        <Link to="/projects" className="project-back-link">
          ← Back to Projects
        </Link>

        <div className="project-detail-header">
          <span className="technical-label">
            PORTFOLIO // {project.category || "PROJECT"}
          </span>

          <h1 className="section-title">{project.title}</h1>

          <p>{project.summary}</p>

          {project.featured && (
            <span className="project-featured-label">FEATURED PROJECT</span>
          )}
        </div>

        {project.coverImage && (
          <div className="project-detail-cover">
            <img src={project.coverImage} alt={project.title} />
          </div>
        )}

        <div className="project-detail-layout">
          <article className="project-detail-description">
            <span className="technical-label">ABOUT THE PROJECT</span>
            <h2>Overview</h2>

            <p className="project-description-text">
              {project.description || project.summary}
            </p>
          </article>

          <aside className="project-detail-sidebar">
            <span className="technical-label">TECHNOLOGIES</span>

            <div className="public-project-tags detail-tags">
              {project.techStack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>

            <div className="project-detail-links">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  View GitHub ↗
                </a>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  Live Demo ↗
                </a>
              )}
            </div>
          </aside>
        </div>

        {gallery.length > 0 && (
          <div className="project-detail-gallery">
            <span className="technical-label">PROJECT // GALLERY</span>
            <h2>Inside the Project</h2>

            <div className="project-gallery-grid">
              {gallery.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${project.title} screenshot ${index + 1}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        <div className="project-detail-footer">
          <h2>Interested in this project?</h2>
          <Link to="/contact" className="btn btn-primary">
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}