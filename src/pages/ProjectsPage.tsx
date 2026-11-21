import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch(API);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load projects.");
        }

        setProjects(data.projects || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load projects."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <section className="section public-projects">
      <div className="container">
        <div className="projects-intro">
          <span className="technical-label">PORTFOLIO // PROJECTS</span>
          <h1 className="section-title">Things I've Built.</h1>
          <p>
            A collection of projects, experiments, and things I've explored
            through software development, artificial intelligence, and
            computer vision.
          </p>
        </div>

        {loading && <div className="projects-state">Loading projects...</div>}

        {error && (
          <div className="projects-state projects-error">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="projects-state">
            <h2>Projects are on the way.</h2>
            <p>Check back soon for my latest work and experiments.</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="public-project-grid">
            {projects.map((project) => (
              <article className="public-project-card" key={project.id}>
                <Link
                  to={`/projects/${project.slug}`}
                  className="public-project-image"
                  aria-label={`View ${project.title}`}
                >
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} />
                  ) : (
                    <div className="public-project-no-image">
                      PROJECT PREVIEW
                    </div>
                  )}

                  {project.featured && (
                    <span className="project-featured-label">FEATURED</span>
                  )}
                </Link>

                <div className="public-project-content">
                  <div className="public-project-meta">
                    <span className="technical-label">
                      {project.category || "PROJECT"}
                    </span>
                    <span className="project-number">
                      {String(projects.indexOf(project) + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2>
                    <Link to={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h2>

                  <p>{project.summary}</p>

                  <div className="public-project-tags">
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>

                  <Link
                    to={`/projects/${project.slug}`}
                    className="project-view-link"
                  >
                    Explore Project <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}