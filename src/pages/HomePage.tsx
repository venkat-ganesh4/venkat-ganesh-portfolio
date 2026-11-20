import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homepageContent } from '../data/homepageContent';
import type { HomePageContent } from '../types/homepage';
import ProfileImage from '../components/ProfileImage';

export default function HomePage() {
  const [content, setContent] = useState<HomePageContent>(homepageContent);

  useEffect(() => {
    async function loadHomepage() {
      try {
        const response = await fetch(
          'http://localhost:5000/api/public/homepage'
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.content) {
          setContent(data.content as HomePageContent);
        }
      } catch (error) {
        console.error('Could not load homepage content:', error);
      }
    }

    loadHomepage();
  }, []);

  const { hero, projects, about, skills, experience, contact } = content;

  return (
    <div className="home-page">
      {/* --------------------------------------------------------------------
          01. HERO SECTION
          -------------------------------------------------------------------- */}
      <section className="section hero-section" id="hero">
        <div className="container">
          <div className="hero-layout">
            {/* Left Column: Personal Introduction & Story */}
            <div className="hero-text-col">
              <div className="hero-badge-row">
                <span className="personal-status-pill">
                  <span className={`status-dot status-dot-${hero.statusBadge.dotColor}`}></span>
                  <span>{hero.statusBadge.text}</span>
                </span>
                <span className="tech-badge tech-badge-sage">{hero.roleBadge}</span>
              </div>

              <div className="hero-headline-block">
                <p className="hero-greeting">{hero.greeting}</p>
                <h1 className="hero-name">
                  {hero.name}<span className="hero-dot">.</span>
                </h1>
              </div>

              <div className="hero-identity-tag">
                {hero.identity}
              </div>

              <p className="hero-lead">
                {hero.leadParagraph}
              </p>

              {/* Action Buttons */}
              <div className="hero-cta-group">
                {hero.ctaButtons.map((btn, idx) => (
                  btn.url.startsWith('#') ? (
                    <a
                      key={idx}
                      href={btn.url}
                      className={`btn btn-${btn.variant || 'primary'}`}
                    >
                      {btn.label}
                    </a>
                  ) : (
                    <Link
                      key={idx}
                      to={btn.url}
                      className={`btn btn-${btn.variant || 'primary'}`}
                    >
                      {btn.label}
                    </Link>
                  )
                ))}
              </div>

              {/* Personal Focus & Exploration Chips */}
              <div className="hero-focus-block">
                <span className="hero-focus-label">{hero.interestChipsLabel}</span>
                <div className="hero-focus-tags">
                  {hero.interestChips.map((chip, idx) => (
                    <span key={idx} className="personal-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Configurable Profile Image with Graceful Fallback */}
            <div className="hero-visual-col">
              <div className="portrait-composition">
                <div className="portrait-frame panel-architectural">
                  <div className="portrait-inner">
                    <div className="portrait-media-slot">
                      <ProfileImage config={hero.profileImage} />
                    </div>

                    <div className="portrait-caption">
                      <div className="portrait-caption-header">
                        <span className="portrait-caption-name">{hero.name}</span>
                        <span className="status-dot"></span>
                      </div>
                      <p className="portrait-caption-tagline">{hero.identity}</p>
                    </div>
                  </div>
                </div>

                {/* Subtle geometric backing layer for artistic depth */}
                <div className="portrait-backing-layer" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          02. SELECTED PROJECTS SECTION
          -------------------------------------------------------------------- */}
      <section className="section home-projects-section" id="projects">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="technical-label">{projects.eyebrow}</div>
              <h2 className="section-title">{projects.title}</h2>
              <p className="section-description">{projects.description}</p>
            </div>
            <Link to={projects.viewAllLink.url} className="btn btn-outline section-header-action">
              {projects.viewAllLink.label}
            </Link>
          </div>

          <div className="featured-projects-grid">
            {projects.projects.map((project) => (
              <article key={project.id} className="project-card panel-architectural">
                <div className="project-card-header">
                  <span className={`tech-badge tech-badge-${project.badgeTone}`}>
                    {project.category}
                  </span>
                  <span className="project-year">{project.year}</span>
                </div>

                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.description}</p>

                <div className="project-tech-stack">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="personal-chip">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="project-card-footer">
                  {project.links.details && (
                    <Link to={project.links.details} className="tech-link">
                      <span>View Project Details</span>
                      <span className="arrow">→</span>
                    </Link>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editorial-link project-ext-link"
                    >
                      Source Code ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          03. ABOUT PREVIEW SECTION
          -------------------------------------------------------------------- */}
      <section className="section home-about-section" id="about">
        <div className="container">
          <div className="about-preview-grid">
            <div className="about-preview-text">
              <div className="technical-label">{about.eyebrow}</div>
              <h2 className="section-title">{about.title}</h2>
              <p className="about-preview-lead">{about.lead}</p>

              <div className="about-bio-stack">
                {about.bioParagraphs.map((para, idx) => (
                  <p key={idx} className="about-bio-p">
                    {para}
                  </p>
                ))}
              </div>

              <div className="about-actions-row">
                <Link to={about.readMoreLink.url} className="btn btn-primary">
                  {about.readMoreLink.label}
                </Link>
                <a href="#contact" className="btn btn-secondary">
                  Let's Connect
                </a>
              </div>
            </div>

            <div className="about-principles-col">
              <div className="panel-architectural principles-card">
                <div className="panel-header">
                  <span className="technical-label">// Core Principles</span>
                  <span className="tech-badge tech-badge-gold">PHILOSOPHY</span>
                </div>

                <div className="principles-list">
                  {about.principles.map((principle, idx) => (
                    <div key={idx} className="principle-item">
                      <div className="principle-number">0{idx + 1}</div>
                      <div className="principle-body">
                        <h4 className="principle-title">{principle.title}</h4>
                        <p className="principle-desc">{principle.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          04. SKILLS PREVIEW SECTION
          -------------------------------------------------------------------- */}
      <section className="section home-skills-section" id="skills">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="technical-label">{skills.eyebrow}</div>
              <h2 className="section-title">{skills.title}</h2>
              <p className="section-description">{skills.description}</p>
            </div>
            {skills.viewAllLink && (
              <Link to={skills.viewAllLink.url} className="btn btn-outline section-header-action">
                {skills.viewAllLink.label}
              </Link>
            )}
          </div>

          <div className="skills-categories-grid">
            {skills.categories.map((category) => (
              <div key={category.id} className="skill-cat-card panel-architectural">
                <div className="skill-cat-header">
                  <span className={`tech-badge tech-badge-${category.badgeTone}`}>
                    {category.badgeLabel}
                  </span>
                </div>

                <h3 className="skill-cat-title">{category.title}</h3>
                <p className="skill-cat-desc">{category.description}</p>

                <div className="skill-tags-cloud">
                  {category.skills.map((skill, idx) => (
                    <span key={idx} className="skill-item-pill">
                      <span className="skill-item-name">{skill.name}</span>
                      {skill.level && (
                        <span className="skill-item-level">{skill.level}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          05. EXPERIENCE PREVIEW SECTION
          -------------------------------------------------------------------- */}
      <section className="section home-experience-section" id="experience">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="technical-label">{experience.eyebrow}</div>
              <h2 className="section-title">{experience.title}</h2>
              <p className="section-description">{experience.description}</p>
            </div>
            {experience.viewAllLink && (
              <Link to={experience.viewAllLink.url} className="btn btn-outline section-header-action">
                {experience.viewAllLink.label}
              </Link>
            )}
          </div>

          <div className="experience-timeline">
            {experience.timeline.map((item, idx) => (
              <div key={item.id} className="timeline-item panel-architectural">
                <div className="timeline-meta-col">
                  <span className="timeline-period">{item.period}</span>
                  {item.current && (
                    <span className="tech-badge tech-badge-emerald timeline-current-badge">
                      CURRENT
                    </span>
                  )}
                  {item.location && (
                    <span className="timeline-location">{item.location}</span>
                  )}
                </div>

                <div className="timeline-content-col">
                  <div className="timeline-header">
                    <h3 className="timeline-role">{item.role}</h3>
                    <span className="timeline-org">{item.organization}</span>
                  </div>

                  <p className="timeline-desc">{item.description}</p>

                  <div className="timeline-tech-stack">
                    {item.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="personal-chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="timeline-index" aria-hidden="true">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          06. CONTACT SECTION
          -------------------------------------------------------------------- */}
      <section className="section home-contact-section" id="contact">
        <div className="container">
          <div className="contact-banner panel-architectural">
            <div className="contact-banner-inner">
              <div className="contact-text-block">
                <div className="technical-label">{contact.eyebrow}</div>
                <h2 className="contact-title">{contact.title}</h2>
                <p className="contact-desc">{contact.description}</p>

                <div className="contact-status-notice">
                  <span className="status-dot status-dot-emerald"></span>
                  <span>{contact.availabilityNotice}</span>
                </div>
              </div>

              <div className="contact-actions-block">
                <div className="contact-primary-btns">
                  <a
                    href={contact.primaryAction.url}
                    className={`btn btn-${contact.primaryAction.variant || 'primary'} btn-lg`}
                  >
                    {contact.primaryAction.label}
                  </a>
                  {contact.secondaryAction && (
                    <Link
                      to={contact.secondaryAction.url}
                      className={`btn btn-${contact.secondaryAction.variant || 'secondary'} btn-lg`}
                    >
                      {contact.secondaryAction.label}
                    </Link>
                  )}
                </div>

                <div className="contact-socials-row">
                  <span className="contact-socials-label">Find Me Online:</span>
                  <div className="contact-social-links">
                    {contact.socialLinks.map((social, idx) => (
                      social.isExternal ? (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tech-link social-link-item"
                        >
                          <span>{social.label}</span>
                          <span className="arrow">↗</span>
                        </a>
                      ) : (
                        <a
                          key={idx}
                          href={social.url}
                          className="tech-link social-link-item"
                        >
                          <span>{social.label}</span>
                          <span className="arrow">→</span>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
