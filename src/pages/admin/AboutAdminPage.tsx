import { useEffect, useState, type FormEvent } from "react";
import ImageUploader from "../../components/admin/ImageUploader";
import "./about-admin.css";

const ADMIN_API = "http://localhost:5000/api/admin/about";

interface AboutContent {
  pageTitle: string;
  headline: string;
  intro: string;
  whoIAm: string;
  whatIExplore: string;
  beyondTech: string;
  myDirection: string;
  profileImage: string | null;
  published: boolean;
}

const emptyForm: AboutContent = {
  pageTitle: "About Me",
  headline: "",
  intro: "",
  whoIAm: "",
  whatIExplore: "",
  beyondTech: "",
  myDirection: "",
  profileImage: null,
  published: false,
};

export default function AboutAdminPage() {
  const [form, setForm] = useState<AboutContent>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAbout() {
      try {
        const response = await fetch(ADMIN_API, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load About content");
        }

        if (data.about) {
          setForm({
            pageTitle: data.about.pageTitle ?? "About Me",
            headline: data.about.headline ?? "",
            intro: data.about.intro ?? "",
            whoIAm: data.about.whoIAm ?? "",
            whatIExplore: data.about.whatIExplore ?? "",
            beyondTech: data.about.beyondTech ?? "",
            myDirection: data.about.myDirection ?? "",
            profileImage: data.about.profileImage ?? null,
            published: data.about.published === true,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load About content"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAbout();
  }, []);

  function updateField<K extends keyof AboutContent>(
    key: K,
    value: AboutContent[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(ADMIN_API, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save About content");
      }

      setForm((previous) => ({
        ...previous,
        ...data.about,
        profileImage: data.about.profileImage ?? null,
      }));

      setMessage(
        form.published
          ? "About page saved and published successfully."
          : "About page saved as a draft."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save About content"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="about-admin-page"><p>Loading About editor...</p></div>;
  }

  return (
    <div className="about-admin-page">
      <div className="about-admin-header">
        <div>
          <span className="technical-label">CONTENT MANAGEMENT</span>
          <h1>About Page Editor</h1>
          <p>Manage the personal introduction and information displayed on your About page.</p>
        </div>
        <a href="/about" target="_blank" rel="noreferrer" className="about-preview-link">
          Preview public page ↗
        </a>
      </div>

      {error && <div className="about-admin-alert error">{error}</div>}
      {message && <div className="about-admin-alert success">{message}</div>}

      <form onSubmit={handleSubmit} className="about-admin-form">
        <section className="about-admin-card">
          <div className="about-admin-section-heading">
            <span className="technical-label">01 / INTRODUCTION</span>
            <h2>Page introduction</h2>
          </div>

          <label>
            Page title
            <input
              value={form.pageTitle}
              onChange={(e) => updateField("pageTitle", e.target.value)}
              placeholder="About Me"
            />
          </label>

          <label>
            Main headline
            <input
              value={form.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder="A little about who I am..."
            />
          </label>

          <label>
            Short introduction
            <textarea
              rows={3}
              value={form.intro}
              onChange={(e) => updateField("intro", e.target.value)}
              placeholder="Write a short introduction for visitors."
            />
          </label>
        </section>

        <section className="about-admin-card">
          <div className="about-admin-section-heading">
            <span className="technical-label">02 / PERSONAL BACKGROUND</span>
            <h2>Who I am</h2>
          </div>
          <label>
            Personal introduction
            <textarea
              rows={6}
              value={form.whoIAm}
              onChange={(e) => updateField("whoIAm", e.target.value)}
              placeholder="Tell visitors about yourself, your background, and what makes you curious."
            />
          </label>
        </section>

        <section className="about-admin-card">
          <div className="about-admin-section-heading">
            <span className="technical-label">03 / TECHNOLOGY</span>
            <h2>What I explore</h2>
          </div>
          <label>
            Technology interests
            <textarea
              rows={5}
              value={form.whatIExplore}
              onChange={(e) => updateField("whatIExplore", e.target.value)}
              placeholder="Describe the technologies and areas you enjoy exploring."
            />
          </label>
        </section>

        <section className="about-admin-card">
          <div className="about-admin-section-heading">
            <span className="technical-label">04 / BEYOND WORK</span>
            <h2>Beyond technology</h2>
          </div>
          <label>
            Personal interests
            <textarea
              rows={5}
              value={form.beyondTech}
              onChange={(e) => updateField("beyondTech", e.target.value)}
              placeholder="Share your creative interests, hobbies, and things you enjoy."
            />
          </label>
        </section>

        <section className="about-admin-card">
          <div className="about-admin-section-heading">
            <span className="technical-label">05 / FUTURE</span>
            <h2>My direction</h2>
          </div>
          <label>
            Career direction and ambitions
            <textarea
              rows={5}
              value={form.myDirection}
              onChange={(e) => updateField("myDirection", e.target.value)}
              placeholder="Describe what you are learning, building, and working toward."
            />
          </label>
        </section>

        <section className="about-admin-card">
          <div className="about-admin-section-heading">
            <span className="technical-label">06 / PROFILE</span>
            <h2>Profile image</h2>
          </div>

          <p className="about-admin-help">
            Upload or replace your profile image. You can remove it to use the
            page's visual fallback instead.
          </p>

          <ImageUploader
            currentImage={form.profileImage ?? undefined}
            onUpload={(url) => updateField("profileImage", url)}
          />

          {form.profileImage && (
            <button
              type="button"
              className="about-remove-image"
              onClick={() => updateField("profileImage", null)}
            >
              Remove profile image
            </button>
          )}
        </section>

        <section className="about-admin-card about-publish-card">
          <div>
            <span className="technical-label">PUBLICATION</span>
            <h2>Page visibility</h2>
            <p>
              Drafts are visible only in the admin editor. Published content
              appears on your public About page.
            </p>
          </div>

          <label className="about-publish-toggle">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
            />
            <span>Publish About page</span>
          </label>
        </section>

        <div className="about-admin-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save About Page"}
          </button>
          <a href="/about" target="_blank" rel="noreferrer">
            View public page ↗
          </a>
        </div>
      </form>
    </div>
  );
}