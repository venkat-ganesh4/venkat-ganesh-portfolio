
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./experience-admin.css";

type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  published: boolean;
  sortOrder: number;
};

type ExperienceForm = Omit<Experience, "id"> & { id: string };

const emptyExperience: ExperienceForm = {
  id: "",
  company: "",
  role: "",
  location: "",
  employmentType: "",
  startDate: "",
  endDate: null,
  current: false,
  description: "",
  responsibilities: [],
  technologies: [],
  published: false,
  sortOrder: 0,
};

const API = "http://localhost:5000/api/admin/experience";

function dateForInput(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toInputForm(experience: Experience): ExperienceForm {
  return {
    ...experience,
    startDate: dateForInput(experience.startDate),
    endDate: dateForInput(experience.endDate),
  };
}

function parseList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ExperienceAdminPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [form, setForm] = useState<ExperienceForm>({
    ...emptyExperience,
  });
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [technologiesText, setTechnologiesText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function loadExperiences() {
    setLoading(true);

    try {
      const response = await fetch(API, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load experiences");
      }

      setExperiences(data.experiences || []);
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Could not load experiences"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExperiences();
  }, []);

  function update<K extends keyof ExperienceForm>(
    key: K,
    value: ExperienceForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm({ ...emptyExperience });
    setResponsibilitiesText("");
    setTechnologiesText("");
    setMessage("");
    setError(false);
  }

  function editExperience(experience: Experience) {
    setForm(toInputForm(experience));
    setResponsibilitiesText(experience.responsibilities.join("\n"));
    setTechnologiesText(experience.technologies.join("\n"));
    setMessage("");
    setError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveExperience(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      form.endDate &&
      !form.current &&
      form.endDate < form.startDate
    ) {
      setError(true);
      setMessage("End date cannot be before start date.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError(false);

    try {
      const payload = {
        ...form,
        startDate: new Date(
          `${form.startDate}T00:00:00.000Z`
        ).toISOString(),
        endDate:
          form.current || !form.endDate
            ? null
            : new Date(
                `${form.endDate}T00:00:00.000Z`
              ).toISOString(),
        responsibilities: parseList(responsibilitiesText),
        technologies: parseList(technologiesText),
      };

      const response = await fetch(
        form.id ? `${API}/${form.id}` : API,
        {
          method: form.id ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save experience");
      }

      resetForm();
      setMessage("Experience saved successfully.");
      await loadExperiences();
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteExperience(id: string) {
    if (!window.confirm("Delete this experience permanently?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      if (form.id === id) {
        resetForm();
      }

      setError(false);
      setMessage("Experience deleted successfully.");
      await loadExperiences();
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Delete failed"
      );
    }
  }

  return (
    <main className="experience-admin-page">
      <header className="experience-admin-header">
        <div>
          <span className="experience-admin-eyebrow">
            CONTENT MANAGEMENT
          </span>
          <h1>Experience</h1>
          <p>Manage your professional journey and work history.</p>
        </div>

        <div className="experience-admin-actions">
          <Link to="/admin" className="experience-button secondary">
            Dashboard
          </Link>

          <Link
            to="/experience"
            target="_blank"
            className="experience-button secondary"
          >
            View Website
          </Link>

          <button
            type="button"
            className="experience-button primary"
            onClick={resetForm}
          >
            + New Experience
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`experience-message ${error ? "error" : "success"}`}
        >
          {message}
        </div>
      )}

      <form className="experience-editor" onSubmit={saveExperience}>
        <div className="experience-editor-heading">
          <h2>{form.id ? "Edit Experience" : "Create Experience"}</h2>
          <span>{form.published ? "Published" : "Draft"}</span>
        </div>

        <div className="experience-form-grid">
          <label>
            Company Name *
            <input
              required
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Company or organization"
            />
          </label>

          <label>
            Job Title / Role *
            <input
              required
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Software Developer"
            />
          </label>

          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Hyderabad, India"
            />
          </label>

          <label>
            Employment Type
            <select
              value={form.employmentType}
              onChange={(e) => update("employmentType", e.target.value)}
            >
              <option value="">Select employment type</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Start Date *
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              value={form.endDate || ""}
              disabled={form.current}
              min={form.startDate || undefined}
              onChange={(e) => update("endDate", e.target.value || null)}
            />
          </label>

          <label className="full-width">
            Role Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Write a short introduction about this role."
            />
          </label>

          <label className="full-width">
            Responsibilities
            <textarea
              rows={6}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder={"Enter one responsibility per line.\nExample: Worked with database systems"}
            />
            <small>Enter each responsibility on a separate line.</small>
          </label>

          <label className="full-width">
            Technologies Used
            <textarea
              rows={4}
              value={technologiesText}
              onChange={(e) => setTechnologiesText(e.target.value)}
              placeholder={"Enter one technology per line.\nExample: Python\nLinux\nPostgreSQL"}
            />
            <small>Enter each technology on a separate line.</small>
          </label>

          <label>
            Display Order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </label>
        </div>

        <div className="experience-editor-footer">
          <div className="experience-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={form.current}
                onChange={(e) => {
                  update("current", e.target.checked);
                  if (e.target.checked) update("endDate", null);
                }}
              />
              Currently working here
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update("published", e.target.checked)}
              />
              Publish on website
            </label>
          </div>

          <div className="experience-admin-actions">
            <button
              type="button"
              className="experience-button secondary"
              onClick={resetForm}
            >
              Reset
            </button>

            <button
              type="submit"
              className="experience-button primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : form.id
                  ? "Update Experience"
                  : "Save Experience"}
            </button>
          </div>
        </div>
      </form>

      <section className="experience-admin-list">
        <h2>Existing Experiences ({experiences.length})</h2>

        {loading ? (
          <p>Loading experiences...</p>
        ) : experiences.length === 0 ? (
          <div className="experience-empty-state">
            <h3>No experiences added yet</h3>
            <p>
              Create your first experience above. It will appear on
              your website after publishing.
            </p>
          </div>
        ) : (
          <div className="experience-admin-grid">
            {experiences.map((experience) => (
              <article
                key={experience.id}
                className="experience-admin-card"
              >
                <div className="experience-card-content">
                  <div className="experience-card-status">
                    {experience.published ? "PUBLISHED" : "DRAFT"}
                  </div>

                  <h3>{experience.role}</h3>
                  <h4>{experience.company}</h4>

                  <p>
                    {dateForInput(experience.startDate)} –{" "}
                    {experience.current
                      ? "Present"
                      : dateForInput(experience.endDate) || "Not specified"}
                  </p>

                  {experience.employmentType && (
                    <span className="experience-type">
                      {experience.employmentType}
                    </span>
                  )}

                  {experience.description && (
                    <p className="experience-card-description">
                      {experience.description}
                    </p>
                  )}

                  <div className="experience-card-actions">
                    <button
                      type="button"
                      onClick={() => editExperience(experience)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteExperience(experience.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
