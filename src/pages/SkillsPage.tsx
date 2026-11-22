
import { useEffect, useState } from "react";
import "./skills.css";

type Skill = {
  id: string;
  name: string;
  categoryId: string;
  sortOrder: number;
};

type SkillCategory = {
  id: string;
  name: string;
  sortOrder: number;
  skills: Skill[];
};

export default function SkillsPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSkills() {
      try {
        const response = await fetch("http://localhost:5000/api/skills");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load skills");
        }

        setCategories(data.categories ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load skills",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

  return (
    <main className="skills-page">
      <section className="skills-hero">
        <div className="skills-container">
          <span className="skills-label">WHAT I WORK WITH</span>
          <h1>
            Skills & <span>Technologies.</span>
          </h1>
          <p>
            Technologies, tools, and concepts I work with, explore, and continue
            learning.
          </p>
        </div>
      </section>

      <section className="skills-content">
        <div className="skills-container">
          {loading ? (
            <div className="skills-state">Loading skills...</div>
          ) : error ? (
            <div className="skills-state skills-error">{error}</div>
          ) : categories.length === 0 ? (
            <div className="skills-state">
              <h2>Skills are being updated.</h2>
              <p>Check back soon as I add technologies to this page.</p>
            </div>
          ) : (
            <div className="skills-category-list">
              {categories.map((category, index) => (
                <section
                  className="skills-category"
                  key={category.id}
                >
                  <div className="skills-category-heading">
                    <span className="skills-category-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2>{category.name}</h2>
                    <span className="skills-category-count">
                      {category.skills.length} skills
                    </span>
                  </div>

                  <div className="skills-grid">
                    {category.skills.map((skill) => (
                      <div className="skill-card" key={skill.id}>
                        <span className="skill-card-indicator" />
                        <span className="skill-card-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
