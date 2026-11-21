import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ImageUploader from "../../components/admin/ImageUploader";
import "./hobbies-admin.css";

type Hobby = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  coverImage: string;
  galleryImages: string[];
  published: boolean;
  sortOrder: number;
};

const emptyHobby: Hobby = {
  id: "",
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "",
  coverImage: "",
  galleryImages: [],
  published: false,
  sortOrder: 0,
};

const API = "http://localhost:5000/api/admin/hobbies";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function HobbiesAdminPage() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [form, setForm] = useState<Hobby>(emptyHobby);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadHobbies() {
    setLoading(true);
    try {
      const response = await fetch(API, { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load hobbies");
      setHobbies(data.hobbies || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load hobbies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHobbies();
  }, []);

  function update<K extends keyof Hobby>(key: K, value: Hobby[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startNew() {
    setForm({ ...emptyHobby });
    setMessage("");
  }

  function editHobby(hobby: Hobby) {
    setForm({ ...hobby });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveHobby(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        slug: slugify(form.slug || form.title),
        galleryImages: form.galleryImages.filter(Boolean),
      };

      const response = await fetch(form.id ? `${API}/${form.id}` : API, {
        method: form.id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save hobby");

      setMessage("Hobby saved successfully.");
      setForm({ ...emptyHobby });
      await loadHobbies();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteHobby(id: string) {
    if (!window.confirm("Delete this hobby permanently?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");

      if (form.id === id) setForm({ ...emptyHobby });
      setMessage("Hobby deleted.");
      await loadHobbies();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  function addGalleryImage(url: string) {
    update("galleryImages", [...form.galleryImages, url]);
  }

  function removeGalleryImage(index: number) {
    update(
      "galleryImages",
      form.galleryImages.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  return (
    <main className="hobbies-admin-page">
      <header className="hobbies-admin-header">
        <div>
          <span className="hobby-admin-eyebrow">CONTENT MANAGEMENT</span>
          <h1>My Hobbies</h1>
          <p>Manage your personal interests, stories and photo galleries.</p>
        </div>
        <div className="hobbies-admin-actions">
          <Link to="/admin" className="hobby-admin-button secondary">Dashboard</Link>
          <Link to="/hobbies" target="_blank" className="hobby-admin-button secondary">View Website</Link>
          <button type="button" className="hobby-admin-button primary" onClick={startNew}>+ New Hobby</button>
        </div>
      </header>

      {message && <div className="hobby-admin-message">{message}</div>}

      <form className="hobby-editor" onSubmit={saveHobby}>
        <div className="hobby-editor-heading">
          <h2>{form.id ? "Edit Hobby" : "Create Hobby"}</h2>
          <span>{form.published ? "Published" : "Draft"}</span>
        </div>

        <div className="hobby-form-grid">
          <label>
            Title *
            <input
              value={form.title}
              required
              onChange={(e) => {
                const title = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: prev.id ? prev.slug : slugify(title),
                }));
              }}
              placeholder="Hobby title"
            />
          </label>

          <label>
            URL Slug *
            <input
              value={form.slug}
              required
              onChange={(e) => update("slug", slugify(e.target.value))}
              placeholder="hobby-url"
            />
          </label>

          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Art, Technology, Outdoors..."
            />
          </label>

          <label>
            Display Order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </label>

          <label className="full-width">
            Short Introduction *
            <textarea
              rows={3}
              value={form.summary}
              required
              onChange={(e) => update("summary", e.target.value)}
              placeholder="A short introduction shown on the hobby card."
            />
          </label>

          <label className="full-width">
            Full Description
            <textarea
              rows={8}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Write about this interest, what you enjoy, experiences, and anything you want visitors to know."
            />
          </label>
        </div>

        <div className="hobby-image-section">
          <h3>Cover Image</h3>
          <ImageUploader
            currentImage={form.coverImage}
            onUpload={(url) => update("coverImage", url)}
          />
          {form.coverImage && (
            <button type="button" className="remove-image" onClick={() => update("coverImage", "")}>
              Remove cover image
            </button>
          )}
        </div>

        <div className="hobby-image-section">
          <h3>Gallery</h3>
          <p>Upload images to showcase this hobby. You can add multiple images.</p>
          <ImageUploader onUpload={addGalleryImage} />
          <div className="hobby-gallery-preview">
            {form.galleryImages.map((url, index) => (
              <div className="hobby-gallery-item" key={`${url}-${index}`}>
                <img src={url} alt={`Gallery ${index + 1}`} />
                <button type="button" onClick={() => removeGalleryImage(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="hobby-editor-footer">
          <label className="hobby-publish-toggle">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            Publish on website
          </label>
          <div className="hobbies-admin-actions">
            <button type="button" className="hobby-admin-button secondary" onClick={startNew}>Reset</button>
            <button type="submit" className="hobby-admin-button primary" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update Hobby" : "Save Hobby"}
            </button>
          </div>
        </div>
      </form>

      <section className="hobbies-admin-list">
        <h2>Existing Hobbies ({hobbies.length})</h2>
        {loading ? (
          <p>Loading hobbies...</p>
        ) : hobbies.length === 0 ? (
          <div className="hobbies-empty-state">
            <h3>No hobbies added yet</h3>
            <p>Create your first hobby entry above. It will appear publicly after publishing.</p>
          </div>
        ) : (
          <div className="hobbies-admin-grid">
            {hobbies.map((hobby) => (
              <article key={hobby.id} className="hobby-admin-card">
                {hobby.coverImage && <img src={hobby.coverImage} alt={hobby.title} />}
                <div className="hobby-admin-card-content">
                  <div className="hobby-admin-card-status">
                    {hobby.published ? "PUBLISHED" : "DRAFT"}
                  </div>
                  <h3>{hobby.title}</h3>
                  <p>{hobby.summary}</p>
                  <div className="hobby-admin-card-actions">
                    <button type="button" onClick={() => editHobby(hobby)}>Edit</button>
                    <button type="button" className="danger" onClick={() => deleteHobby(hobby.id)}>Delete</button>
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
