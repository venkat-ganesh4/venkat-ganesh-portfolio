
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./skills-admin.css";

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

const API = "http://localhost:5000/api/admin/skills";

export default function SkillsAdminPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);

  async function loadSkills() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load skills. Please check admin login.");
      }

      const data = await response.json();
      setCategories(data.categories ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  async function request(
    url: string,
    method: string,
    body?: unknown,
  ) {
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingCategory) {
        await request(
          `${API}/categories/${editingCategory.id}`,
          "PUT",
          { name: categoryName.trim() },
        );
        setMessage("Category updated successfully.");
      } else {
        await request(`${API}/categories`, "POST", {
          name: categoryName.trim(),
        });
        setMessage("Category created successfully.");
      }

      setCategoryName("");
      setEditingCategory(null);
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Category operation failed");
    }
  }

  async function handleSkillSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }

    try {
      if (editingSkill) {
        await request(`${API}/${editingSkill.id}`, "PUT", {
          name: skillName.trim(),
          categoryId: selectedCategory,
        });
        setMessage("Skill updated successfully.");
      } else {
        await request(API, "POST", {
          name: skillName.trim(),
          categoryId: selectedCategory,
        });
        setMessage("Skill added successfully.");
      }

      setSkillName("");
      setSelectedCategory("");
      setEditingSkill(null);
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Skill operation failed");
    }
  }

  async function deleteCategory(category: SkillCategory) {
    const confirmed = window.confirm(
      `Delete "${category.name}" and all its skills? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await request(`${API}/categories/${category.id}`, "DELETE");
      setMessage("Category deleted.");
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
    }
  }

  async function deleteSkill(skill: Skill) {
    const confirmed = window.confirm(`Delete "${skill.name}"?`);

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await request(`${API}/${skill.id}`, "DELETE");
      setMessage("Skill deleted.");
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete skill");
    }
  }

  function startEditSkill(skill: Skill) {
    setEditingSkill(skill);
    setSkillName(skill.name);
    setSelectedCategory(skill.categoryId);
    setEditingCategory(null);
    setCategoryName("");
  }

  function cancelSkillEdit() {
    setEditingSkill(null);
    setSkillName("");
    setSelectedCategory("");
  }

  function startEditCategory(category: SkillCategory) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setEditingSkill(null);
    setSkillName("");
    setSelectedCategory("");
  }

  function cancelCategoryEdit() {
    setEditingCategory(null);
    setCategoryName("");
  }

  return (
    <main className="skills-admin-page">
      <header className="skills-admin-header">
        <div>
          <p className="skills-admin-eyebrow">CONTENT MANAGEMENT</p>
          <h1>Skills Manager</h1>
          <p>Organize your technical skills into categories.</p>
        </div>

        <Link to="/admin" className="skills-admin-back">
          ← Dashboard
        </Link>
      </header>

      {message && <div className="skills-admin-message success">{message}</div>}
      {error && <div className="skills-admin-message error">{error}</div>}

      <div className="skills-admin-grid">
        <section className="skills-admin-panel">
          <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>

          <form onSubmit={handleCategorySubmit}>
            <label htmlFor="category-name">Category Name</label>
            <input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Programming Languages"
              required
            />

            <div className="skills-admin-form-actions">
              <button type="submit">
                {editingCategory ? "Save Category" : "Add Category"}
              </button>

              {editingCategory && (
                <button type="button" className="secondary" onClick={cancelCategoryEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="skills-admin-panel">
          <h2>{editingSkill ? "Edit Skill" : "Add Skill"}</h2>

          <form onSubmit={handleSkillSubmit}>
            <label htmlFor="skill-name">Skill Name</label>
            <input
              id="skill-name"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Python"
              required
            />

            <label htmlFor="skill-category">Category</label>
            <select
              id="skill-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="skills-admin-form-actions">
              <button type="submit" disabled={!categories.length}>
                {editingSkill ? "Save Skill" : "Add Skill"}
              </button>

              {editingSkill && (
                <button type="button" className="secondary" onClick={cancelSkillEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <section className="skills-admin-list-panel">
        <div className="skills-admin-list-heading">
          <div>
            <h2>Your Skill Categories</h2>
            <p>Manage categories and the skills inside them.</p>
          </div>
          <button type="button" className="secondary" onClick={loadSkills}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading skills...</p>
        ) : categories.length === 0 ? (
          <div className="skills-admin-empty">
            <h3>No categories yet</h3>
            <p>Create your first category using the form above.</p>
          </div>
        ) : (
          <div className="skills-admin-category-list">
            {categories.map((category) => (
              <article className="skills-admin-category" key={category.id}>
                <header className="skills-admin-category-header">
                  <div>
                    <h3>{category.name}</h3>
                    <span>
                      {category.skills.length}{" "}
                      {category.skills.length === 1 ? "skill" : "skills"}
                    </span>
                  </div>

                  <div className="skills-admin-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => startEditCategory(category)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteCategory(category)}
                    >
                      Delete
                    </button>
                  </div>
                </header>

                {category.skills.length === 0 ? (
                  <p className="skills-admin-no-skills">No skills in this category yet.</p>
                ) : (
                  <div className="skills-admin-skill-list">
                    {category.skills.map((skill) => (
                      <div className="skills-admin-skill-row" key={skill.id}>
                        <span>{skill.name}</span>
                        <div className="skills-admin-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => startEditSkill(skill)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteSkill(skill)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
