
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./my-thoughts-admin.css";

const API = "http://localhost:5000/api/admin/thoughts";

interface Thought {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

type ViewFilter = "all" | "drafts" | "published";

export default function MyThoughtsAdminPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<ViewFilter>("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  async function loadThoughts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load your thoughts.");
      }

      setThoughts(data.thoughts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load thoughts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadThoughts();
  }, []);

  const filteredThoughts = thoughts.filter((thought) => {
    if (filter === "drafts") return !thought.published;
    if (filter === "published") return thought.published;
    return true;
  });

  function resetEditor() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setPublishNow(false);
  }

  function startNewThought() {
    resetEditor();
    setError("");
    setMessage("");
  }

  function startEditing(thought: Thought) {
    setEditingId(thought.id);
    setTitle(thought.title);
    setContent(thought.content);
    setPublishNow(thought.published);
    setError("");
    setMessage("");
  }

  async function saveThought(published: boolean) {
    if (!title.trim() || !content.trim()) {
      setError("Please add both a title and your thought before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const body = {
      title: title.trim(),
      content: content.trim(),
      published,
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save your thought.");
      }

      setMessage(published ? "Your thought is published." : "Draft saved.");
      resetEditor();
      await loadThoughts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your thought.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublication(thought: Thought) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${thought.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: thought.title,
          content: thought.content,
          published: !thought.published,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to change publication status.");
      }

      setMessage(thought.published ? "Thought unpublished." : "Thought published.");
      await loadThoughts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update thought.");
    }
  }

  async function deleteThought(thought: Thought) {
    const confirmed = window.confirm(
      `Delete "${thought.title}" permanently?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${thought.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete thought.");
      }

      setThoughts((current) =>
        current.filter((item) => item.id !== thought.id)
      );

      if (editingId === thought.id) resetEditor();

      setMessage("Thought deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete thought.");
    }
  }

  const draftCount = thoughts.filter((thought) => !thought.published).length;
  const publishedCount = thoughts.filter((thought) => thought.published).length;

  return (
    <main className="my-thoughts-admin">
      <header className="my-thoughts-header">
        <div>
          <span className="my-thoughts-label">PERSONAL WRITING SPACE</span>
          <h1>My Thoughts</h1>
          <p>A place for ideas, reflections, experiences and things worth sharing.</p>
        </div>

        <Link to="/admin" className="my-thoughts-back">
          ← Dashboard
        </Link>
      </header>

      <div className="my-thoughts-stats">
        <div>
          <span>Total writings</span>
          <strong>{thoughts.length}</strong>
        </div>
        <div>
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </div>
        <div>
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </div>
      </div>

      {message && <div className="my-thoughts-message">{message}</div>}
      {error && <div className="my-thoughts-error">{error}</div>}

      <section className="my-thoughts-editor">
        <div className="my-thoughts-editor-heading">
          <div>
            <span className="my-thoughts-label">
              {editingId ? "EDIT YOUR WRITING" : "NEW ENTRY"}
            </span>
            <h2>{editingId ? "Edit thought" : "Write something"}</h2>
          </div>
          {editingId && (
            <button className="my-thoughts-text-button" onClick={startNewThought}>
              + New thought
            </button>
          )}
        </div>

        <label className="my-thoughts-field">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            placeholder="Give your thought a title..."
          />
          <small>{title.length}/160</small>
        </label>

        <label className="my-thoughts-field">
          <span>Your thought</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={20000}
            rows={12}
            placeholder="Write freely. This is your space..."
          />
          <small>{content.length}/20,000 characters</small>
        </label>

        <div className="my-thoughts-editor-actions">
          <button
            className="my-thoughts-save-draft"
            disabled={saving}
            onClick={() => saveThought(false)}
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>

          <button
            className="my-thoughts-publish"
            disabled={saving}
            onClick={() => saveThought(true)}
          >
            {saving ? "Saving..." : editingId && publishNow ? "Update & Publish" : "Publish"}
          </button>
        </div>

        <p className="my-thoughts-private-note">
          Drafts are private. Published thoughts are visible on your public website.
        </p>
      </section>

      <section className="my-thoughts-library">
        <div className="my-thoughts-library-heading">
          <div>
            <span className="my-thoughts-label">YOUR WRITING</span>
            <h2>Writing library</h2>
          </div>
        </div>

        <div className="my-thoughts-filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All ({thoughts.length})
          </button>
          <button className={filter === "drafts" ? "active" : ""} onClick={() => setFilter("drafts")}>
            Drafts ({draftCount})
          </button>
          <button className={filter === "published" ? "active" : ""} onClick={() => setFilter("published")}>
            Published ({publishedCount})
          </button>
        </div>

        {loading ? (
          <p className="my-thoughts-empty">Loading your writing...</p>
        ) : filteredThoughts.length === 0 ? (
          <div className="my-thoughts-empty">
            <h3>No writings here yet.</h3>
            <p>Start with an idea, an experience, or something you learned.</p>
          </div>
        ) : (
          <div className="my-thoughts-list">
            {filteredThoughts.map((thought) => (
              <article className="my-thoughts-card" key={thought.id}>
                <div className="my-thoughts-card-top">
                  <span className={thought.published ? "my-thoughts-status published" : "my-thoughts-status draft"}>
                    {thought.published ? "Published" : "Draft"}
                  </span>
                  <time>{new Date(thought.updatedAt).toLocaleDateString()}</time>
                </div>

                <h3>{thought.title}</h3>
                <p className="my-thoughts-preview">{thought.content}</p>

                <div className="my-thoughts-card-actions">
                  <button onClick={() => startEditing(thought)}>Edit</button>
                  <button onClick={() => togglePublication(thought)}>
                    {thought.published ? "Unpublish" : "Publish"}
                  </button>
                  <button className="delete" onClick={() => deleteThought(thought)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
