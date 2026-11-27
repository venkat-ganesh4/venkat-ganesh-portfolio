
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homepageContent } from '../data/homepageContent';
import type { HomePageContent } from '../types/homepage';
import ProfileImage from '../components/ProfileImage';
import './HomePage.css';

const API = 'http://localhost:5000/api';

type Project = {
  id: string;
  title: string;
  slug: string;
  category?: string;
  summary?: string;
  description?: string;
  coverImage?: string;
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
};

type About = {
  pageTitle?: string;
  headline?: string;
  intro?: string;
  whoIAm?: string;
  whatIExplore?: string;
  beyondTech?: string;
  myDirection?: string;
};

type SkillCategory = {
  id: string;
  name: string;
  skills?: { id?: string; name: string }[];
};

type Experience = {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
  technologies?: string[];
  responsibilities?: string[];
};

type Thought = {
  id: string;
  title?: string;
  content?: string;
  body?: string;
  excerpt?: string;
  createdAt?: string;
  category?: string;
  slug?: string;
};

async function getJson(path: string) {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  return response.json();
}

function SectionHeading({
  label,
  title,
  description,
  link,
}: {
  label: string;
  title: string;
  description?: string;
  link: string;
}) {
  return (
    <div className="section-header-row">
      <div>
        <div className="technical-label">{label}</div>
        <h2 className="section-title">{title}</h2>
        {description && (
          <p className="section-description">{description}</p>
        )}
      </div>

      <Link to={link} className="btn btn-outline section-header-action">
        Explore More <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
}

export default function HomePage() {
  const [hero, setHero] = useState(homepageContent.hero);

  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  // Load the saved homepage hero settings from the admin CMS.
  useEffect(() => {
    let active = true;

    async function loadSavedHomepage() {
      try {
        const response = await fetch(`${API}/public/homepage`);

        if (!response.ok) return;

        const result = await response.json();
        const savedContent =
          result.content as Partial<HomePageContent> | null;

        if (!active || !savedContent?.hero) return;

        setHero({
          ...homepageContent.hero,
          ...savedContent.hero,
          profileImage: {
            ...homepageContent.hero.profileImage,
            ...savedContent.hero.profileImage,
          },
        });
      } catch (error) {
        console.error(
          'Could not load saved homepage settings:',
          error,
        );
      }
    }

    loadSavedHomepage();

    return () => {
      active = false;
    };
  }, []);

  // Load actual published content for homepage previews.
  useEffect(() => {
    let active = true;

    async function loadSections() {
      const results = await Promise.allSettled([
        getJson('/projects'),
        getJson('/about'),
        getJson('/skills'),
        getJson('/experience'),
        getJson('/thoughts'),
      ]);

      if (!active) return;

      const [
        projectResult,
        aboutResult,
        skillResult,
        experienceResult,
        thoughtResult,
      ] = results;

      if (projectResult.status === 'fulfilled') {
        const items: Project[] =
          projectResult.value.projects ?? [];

        setProjects(
          items
            .filter((item) => item.featured)
            .slice(0, 4),
        );
      }

      if (aboutResult.status === 'fulfilled') {
        setAbout(aboutResult.value.about ?? null);
      }

      if (skillResult.status === 'fulfilled') {
        setSkills(
          (skillResult.value.categories ?? []).slice(0, 4),
        );
      }

      if (experienceResult.status === 'fulfilled') {
        setExperiences(
          (experienceResult.value.experiences ?? []).slice(0, 4),
        );
      }

      if (thoughtResult.status === 'fulfilled') {
        const items =
          thoughtResult.value.thoughts ??
          thoughtResult.value.posts ??
          [];

        setThoughts(items.slice(0, 4));
      }
    }

    loadSections().catch((error) => {
      console.error('Could not load homepage sections:', error);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="section hero-section" id="hero">
        <div className="container">
          <div className="hero-layout">

            <div className="hero-text-col">
              <div className="hero-badge-row">
                <span className="personal-status-pill">
                  <span
                    className={`status-dot status-dot-${hero.statusBadge.dotColor}`}
                  />
                  <span>{hero.statusBadge.text}</span>
                </span>

                <span className="tech-badge tech-badge-sage">
                  {hero.roleBadge}
                </span>
              </div>

              <div className="hero-headline-block">
                <p className="hero-greeting">{hero.greeting}</p>

                <h1 className="hero-name">
                  {hero.name}
                  <span className="hero-dot">.</span>
                </h1>
              </div>

              <div className="hero-identity-tag">
                {hero.identity}
              </div>

              <p className="hero-lead">
                {hero.leadParagraph}
              </p>

              <div className="hero-cta-group">
                {hero.ctaButtons.map((button, index) => {
                  const destination =
                    button.url === '#contact'
                      ? '/contact'
                      : button.url;

                  if (destination.startsWith('http')) {
                    return (
                      <a
                        key={index}
                        href={destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-${button.variant || 'primary'}`}
                      >
                        {button.label}
                      </a>
                    );
                  }

                  if (destination.startsWith('#')) {
                    return (
                      <a
                        key={index}
                        href={destination}
                        className={`btn btn-${button.variant || 'primary'}`}
                      >
                        {button.label}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={index}
                      to={destination}
                      className={`btn btn-${button.variant || 'primary'}`}
                    >
                      {button.label}
                    </Link>
                  );
                })}
              </div>

              {!!hero.interestChips.length && (
                <div className="hero-focus-block">
                  <span className="hero-focus-label">
                    {hero.interestChipsLabel}
                  </span>

                  <div className="hero-focus-tags">
                    {hero.interestChips.map((chip, index) => (
                      <span key={index} className="personal-chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hero-visual-col">
              <div className="portrait-composition">
                <div className="portrait-frame panel-architectural">
                  <div className="portrait-inner">
                    <div className="portrait-media-slot">
                      <ProfileImage config={hero.profileImage} />
                    </div>

                    <div className="portrait-caption">
                      <div className="portrait-caption-header">
                        <span className="portrait-caption-name">
                          {hero.name}
                        </span>
                        <span className="status-dot" />
                      </div>

                      <p className="portrait-caption-tagline">
                        {hero.identity}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="portrait-backing-layer"
                  aria-hidden="true"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      {projects.length > 0 && (
        <section
          className="section home-projects-section"
          id="projects"
        >
          <div className="container">
            <SectionHeading
              label="Selected Work"
              title="Featured Projects"
              description="A selection of projects I've worked on."
              link="/projects"
            />

            <div className="featured-projects-grid">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="project-card panel-architectural"
                >
                  {project.coverImage && (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="project-card-image"
                      loading="lazy"
                    />
                  )}

                  {project.category && (
                    <span className="tech-badge tech-badge-sage">
                      {project.category}
                    </span>
                  )}

                  <h3 className="project-card-title">
                    {project.title}
                  </h3>

                  {(project.summary || project.description) && (
                    <p className="project-card-desc">
                      {project.summary || project.description}
                    </p>
                  )}

                  {!!project.techStack?.length && (
                    <div className="project-tech-stack">
                      {project.techStack.map((tag) => (
                        <span key={tag} className="personal-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="project-card-footer">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="tech-link"
                    >
                      View Project <span className="arrow">→</span>
                    </Link>

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="editorial-link"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {about && (
        <section
          className="section home-about-section"
          id="about"
        >
          <div className="container">
            <div className="about-preview-grid">

              <div className="about-preview-text">
                <div className="technical-label">About</div>

                <h2 className="section-title">
                  {about.headline || about.pageTitle}
                </h2>

                {about.intro && (
                  <p className="about-preview-lead">
                    {about.intro}
                  </p>
                )}

                <div className="about-bio-stack">
                  {[about.whoIAm, about.whatIExplore, about.beyondTech, about.myDirection]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((paragraph, index) => (
                      <p key={index} className="about-bio-p">
                        {paragraph}
                      </p>
                    ))}
                </div>

                <div className="about-actions-row">
                  <Link to="/about" className="btn btn-primary">
                    Explore More
                  </Link>
                </div>
              </div>

              <div className="about-preview-side">
                <div className="about-side-card">
                  <span className="technical-label">
                    A LITTLE MORE ABOUT ME
                  </span>

                  {about.whatIExplore && (
                    <div className="about-side-item">
                      <span className="about-side-number">01</span>
                      <div>
                        <h3>What I Explore</h3>
                        <p>{about.whatIExplore}</p>
                      </div>
                    </div>
                  )}

                  {about.myDirection && (
                    <div className="about-side-item">
                      <span className="about-side-number">02</span>
                      <div>
                        <h3>My Direction</h3>
                        <p>{about.myDirection}</p>
                      </div>
                    </div>
                  )}

                  {about.beyondTech && (
                    <div className="about-side-item">
                      <span className="about-side-number">03</span>
                      <div>
                        <h3>Beyond Technology</h3>
                        <p>{about.beyondTech}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <section
          className="section home-skills-section"
          id="skills"
        >
          <div className="container">
            <SectionHeading
              label="What I Work With"
              title="Skills"
              link="/skills"
            />

            <div className="skills-categories-grid">
              {skills.map((category) => (
                <div
                  key={category.id}
                  className="skill-cat-card panel-architectural"
                >
                  <h3 className="skill-cat-title">
                    {category.name}
                  </h3>

                  <div className="skill-tags-cloud">
                    {(category.skills ?? []).map((skill, index) => (
                      <span
                        key={skill.id ?? `${category.id}-${index}`}
                        className="skill-item-pill"
                      >
                        <span className="skill-item-name">
                          {skill.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {experiences.length > 0 && (
        <section
          className="section home-experience-section"
          id="experience"
        >
          <div className="container">
            <SectionHeading
              label="Professional Journey"
              title="Experience"
              link="/experience"
            />

            <div className="experience-timeline">
              {experiences.map((item, index) => (
                <article
                  key={item.id}
                  className="timeline-item panel-architectural"
                >
                  <div className="timeline-meta-col">
                    <span className="timeline-period">
                      {formatDate(item.startDate)}
                      {item.startDate && ' - '}
                      {item.current
                        ? 'Present'
                        : formatDate(item.endDate)}
                    </span>

                    {item.location && (
                      <span className="timeline-location">
                        {item.location}
                      </span>
                    )}
                  </div>

                  <div className="timeline-content-col">
                    <div className="timeline-header">
                      <h3 className="timeline-role">
                        {item.role}
                      </h3>
                      <span className="timeline-org">
                        {item.company}
                      </span>
                    </div>

                    {item.description && (
                      <p className="timeline-desc">
                        {item.description}
                      </p>
                    )}

                    {!!item.technologies?.length && (
                      <div className="timeline-tech-stack">
                        {item.technologies.map((tech) => (
                          <span key={tech} className="personal-chip">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="timeline-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* THOUGHTS */}
      {thoughts.length > 0 && (
        <section
          className="section home-thoughts-section"
          id="thoughts"
        >
          <div className="container">
            <SectionHeading
              label="Notes & Reflections"
              title="Recent Thoughts"
              link="/thoughts"
            />

            <div className="featured-projects-grid">
              {thoughts.map((thought) => (
                <article
                  key={thought.id}
                  className="project-card panel-architectural"
                >
                  {thought.category && (
                    <span className="tech-badge tech-badge-sage">
                      {thought.category}
                    </span>
                  )}

                  <h3 className="project-card-title">
                    {thought.title}
                  </h3>

                  {(thought.excerpt || thought.content || thought.body) && (
                    <p className="project-card-desc">
                      {thought.excerpt || thought.content || thought.body}
                    </p>
                  )}

                  {thought.slug && (
                    <Link
                      to={`/thoughts/${thought.slug}`}
                      className="tech-link"
                    >
                      Read More <span className="arrow">→</span>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
