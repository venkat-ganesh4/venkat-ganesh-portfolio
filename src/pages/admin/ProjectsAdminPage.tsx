import ImageUploader from "../../components/admin/ImageUploader";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import "./projects-admin.css";

const API = "http://localhost:5000/api/admin/projects";

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

const emptyForm = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "",
  coverImage: "",
  galleryImages: "",
  githubUrl: "",
  liveUrl: "",
  techStack: "",
  featured: false,
  published: false,
  sortOrder: 0,
};

type ProjectForm = typeof emptyForm;

function getGalleryImages(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load projects");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function updateField<K extends keyof ProjectForm>(
    key: K,
    value: ProjectForm[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  function editProject(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: project.description,
      category: project.category || "",
      coverImage: project.coverImage || "",
      galleryImages: project.galleryImages.join("\n"),
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      techStack: project.techStack.join(", "),
      featured: project.featured,
      published: project.published,
      sortOrder: project.sortOrder,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      galleryImages: form.galleryImages
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      techStack: form.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      category: form.category.trim() || null,
      coverImage: form.coverImage.trim() || null,
      githubUrl: form.githubUrl.trim() || null,
      liveUrl: form.liveUrl.trim() || null,
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save project");
      }

      setMessage(editingId ? "Project updated successfully." : "Project created successfully.");
      resetForm();
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`Delete "${project.title}" permanently?`)) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${project.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete project");
      }

      if (editingId === project.id) resetForm();

      setMessage("Project deleted successfully.");
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project");
    }
  }

  async function toggleProject(
    project: Project,
    field: "published" | "featured"
  ) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${project.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !project[field] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update project");
      }

      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project");
    }
  }

  return (
    <main className="projects-admin">
      <header className="projects-admin-header">
        <div>
          <p className="projects-admin-eyebrow">CONTENT MANAGEMENT</p>
          <h1>Projects</h1>
          <p>Manage your portfolio projects and their visibility.</p>
        </div>
        <a href="/admin">Back to Dashboard</a>
      </header>

      {error && <div className="projects-notice error">{error}</div>}
      {message && <div className="projects-notice success">{message}</div>}

      <section className="project-editor-panel">
        <div className="project-panel-heading">
          <div>
            <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
            <p>Enter your project information below.</p>
          </div>
          {editingId && (
            <button type="button" className="project-secondary-button" onClick={resetForm}>
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={saveProject}>
          <div className="project-form-grid">
            <label>
              Project Title *
              <input
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((previous) => ({
                    ...previous,
                    title,
                    slug: editingId ? previous.slug : makeSlug(title),
                  }));
                }}
                placeholder="My Project"
              />
            </label>

            <label>
              URL Slug *
              <input
                required
                value={form.slug}
                onChange={(e) => updateField("slug", makeSlug(e.target.value))}
                placeholder="my-project"
              />
            </label>

            <label>
              Category
              <input
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="Computer Vision"
              />
            </label>

            <label>
              Display Order
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField("sortOrder", Number(e.target.value))}
              />
            </label>

            <label className="project-form-full">
              Short Description *
              <textarea
                required
                rows={2}
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="A short introduction to this project"
              />
            </label>

            <label className="project-form-full">
              Full Description
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Explain the project, its purpose, implementation and features..."
              />
            </label>

            <label className="project-form-full">
              {/* Cover Image */}
<div className="project-form-full">
  <label>
    Cover Image
    <small>Upload a project thumbnail or paste an image URL.</small>
  </label>

  <ImageUploader
    currentImage={form.coverImage || undefined}
    onUpload={(url) => updateField("coverImage", url)}
  />

  <input
    type="url"
    value={form.coverImage}
    onChange={(e) => updateField("coverImage", e.target.value)}
    placeholder="Or paste a cover image URL"
  />

  {form.coverImage && (
    <button
      type="button"
      className="project-secondary-button"
      onClick={() => updateField("coverImage", "")}
    >
      Remove Cover Image
    </button>
  )}
</div>

{/* Gallery Images */}
<div className="project-form-full">
  <label>
    Project Gallery
    <small>Upload screenshots and images that show your project.</small>
  </label>

  <div className="project-gallery-upload-list">
    {getGalleryImages(form.galleryImages).map((image, index) => (
      <div className="project-gallery-upload-item" key={`${image}-${index}`}>
        <ImageUploader
          currentImage={image}
          onUpload={(url) => {
            const images = getGalleryImages(form.galleryImages);
            images[index] = url;
            updateField("galleryImages", images.join("\n"));
          }}
        />

        <button
          type="button"
          className="project-delete-button"
          onClick={() => {
            const images = getGalleryImages(form.galleryImages);
            images.splice(index, 1);
            updateField("galleryImages", images.join("\n"));
          }}
        >
          Remove Image
        </button>
      </div>
    ))}
  </div>

  <div className="project-gallery-add">
    <p>Upload another gallery image:</p>
    <ImageUploader
      onUpload={(url) => {
        const images = getGalleryImages(form.galleryImages);
        images.push(url);
        updateField("galleryImages", images.join("\n"));
      }}
    />
  </div>

  <label>
    Or paste gallery image URLs
    <textarea
      rows={3}
      value={form.galleryImages}
      onChange={(e) => updateField("galleryImages", e.target.value)}
      placeholder="Paste one image URL per line"
    />
  </label>
</div>
            </label>

            <label>
              Technologies
              <input
                value={form.techStack}
                onChange={(e) => updateField("techStack", e.target.value)}
                placeholder="Python, OpenCV, React"
              />
              <small>Separate technologies with commas.</small>
            </label>

            <label>
              GitHub URL
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => updateField("githubUrl", e.target.value)}
                placeholder="https://github.com/..."
              />
            </label>

            <label className="project-form-full">
              Live Demo URL
              <input
                type="url"
                value={form.liveUrl}
                onChange={(e) => updateField("liveUrl", e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="project-form-options">
            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
              />
              Featured project
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => updateField("published", e.target.checked)}
              />
              Published
            </label>
          </div>

          <div className="project-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Project" : "Create Project"}
            </button>
            <button type="button" className="project-secondary-button" onClick={resetForm}>
              Clear Form
            </button>
          </div>
        </form>
      </section>

      <section className="project-list-section">
        <div className="project-panel-heading">
          <div>
            <h2>All Projects ({projects.length})</h2>
            <p>Manage existing project entries.</p>
          </div>
          <button type="button" className="project-secondary-button" onClick={loadProjects}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="project-empty-state">
            <h3>No projects yet</h3>
            <p>Add your first project using the form above.</p>
          </div>
        ) : (
          <div className="project-admin-list">
            {projects.map((project) => (
              <article className="project-admin-card" key={project.id}>
                {project.coverImage ? (
                  <img src={project.coverImage} alt="" />
                ) : (
                  <div className="project-image-placeholder">No Image</div>
                )}

                <div className="project-admin-card-content">
                  <div className="project-admin-card-title">
                    <h3>{project.title}</h3>
                    <span>{project.category || "Uncategorized"}</span>
                  </div>

                  <p>{project.summary}</p>

                  <div className="project-admin-tags">
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>

                  <div className="project-admin-status">
                    <span className={project.published ? "status-live" : "status-draft"}>
                      {project.published ? "Published" : "Draft"}
                    </span>
                    {project.featured && <span className="status-featured">Featured</span>}
                  </div>

                  <div className="project-admin-actions">
                    <button type="button" onClick={() => editProject(project)}>Edit</button>
                    <button type="button" onClick={() => toggleProject(project, "published")}>
                      {project.published ? "Unpublish" : "Publish"}
                    </button>
                    <button type="button" onClick={() => toggleProject(project, "featured")}>
                      {project.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      type="button"
                      className="project-delete-button"
                      onClick={() => deleteProject(project)}
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
