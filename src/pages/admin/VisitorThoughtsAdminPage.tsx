
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./visitor-thoughts-admin.css";

const API = "http://localhost:5000/api/admin/visitor-thoughts";

interface VisitorThought {
  id: string;
  name: string;
  email?: string | null;
  content: string;
  published: boolean;
  createdAt: string;
}

interface ThoughtSettings {
  acceptSubmissions: boolean;
  autoPublish: boolean;
  showCommunityThoughts: boolean;
}

const defaultSettings: ThoughtSettings = {
  acceptSubmissions: true,
  autoPublish: false,
  showCommunityThoughts: true,
};

export default function VisitorThoughtsAdminPage() {
  const [thoughts, setThoughts] = useState<VisitorThought[]>([]);
  const [settings, setSettings] = useState<ThoughtSettings>(defaultSettings);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  async function loadThoughts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, { credentials: "include" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load visitor thoughts.");
      }

      setThoughts(data.thoughts || []);
      setSettings({ ...defaultSettings, ...data.settings });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load visitor thoughts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadThoughts();
  }, []);

  const filteredThoughts = useMemo(() => {
    if (filter === "pending") return thoughts.filter((item) => !item.published);
    if (filter === "published") return thoughts.filter((item) => item.published);
    return thoughts;
  }, [thoughts, filter]);

  async function saveSettings() {
    setSavingSettings(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save settings.");
      }

      setSettings({ ...defaultSettings, ...(data.settings || settings) });
      setMessage("Visitor thought settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  function startEditing(thought: VisitorThought) {
    setEditingId(thought.id);
    setEditName(thought.name);
    setEditContent(thought.content);
    setMessage("");
  }

  async function saveEdit(id: string) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          content: editContent,
          published: thoughts.find((item) => item.id === id)?.published ?? false,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update this thought.");
      }

      setEditingId(null);
      setMessage("Thought updated.");
      await loadThoughts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update this thought.");
    }
  }

  async function togglePublished(thought: VisitorThought) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${thought.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: thought.name,
          content: thought.content,
          published: !thought.published,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to change publication status.");
      }

      setMessage(thought.published ? "Thought moved to pending." : "Thought published.");
      await loadThoughts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update publication status.");
    }
  }

  async function deleteThought(thought: VisitorThought) {
    const confirmed = window.confirm(
      `Delete the thought submitted by ${thought.name}? This cannot be undone.`
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
        throw new Error(data.message || "Unable to delete this thought.");
      }

      setThoughts((current) => current.filter((item) => item.id !== thought.id));
      setMessage("Thought deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this thought.");
    }
  }

  function updateSetting(key: keyof ThoughtSettings, value: boolean) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  if (loading) {
    return <main className="visitor-admin-page"><p>Loading visitor thoughts...</p></main>;
  }

  return (
    <main className="visitor-admin-page">
      <header className="visitor-admin-header">
        <div>
          <p className="visitor-admin-eyebrow">CONTENT MANAGEMENT</p>
          <h1>Visitor Thoughts</h1>
          <p>Review and manage messages shared by visitors on your portfolio.</p>
        </div>
        <Link className="visitor-admin-back" to="/admin">Back to Dashboard</Link>
      </header>

      {message && <p className="visitor-admin-message" role="status">{message}</p>}
      {error && <p className="visitor-admin-error" role="alert">{error}</p>}

      <section className="visitor-admin-settings">
        <div className="visitor-admin-section-heading">
          <div>
            <p className="visitor-admin-eyebrow">PUBLIC EXPERIENCE</p>
            <h2>Submission Settings</h2>
          </div>
        </div>

        <label className="visitor-admin-setting">
          <span>
            <strong>Accept visitor submissions</strong>
            <small>Allow visitors to submit new thoughts.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.acceptSubmissions}
            onChange={(event) => updateSetting("acceptSubmissions", event.target.checked)}
          />
        </label>

        <label className="visitor-admin-setting">
          <span>
            <strong>Automatically publish new submissions</strong>
            <small>When off, new submissions remain pending until you publish them.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.autoPublish}
            onChange={(event) => updateSetting("autoPublish", event.target.checked)}
          />
        </label>

        <label className="visitor-admin-setting">
          <span>
            <strong>Display community thoughts</strong>
            <small>Show published visitor thoughts on the public Thoughts page.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.showCommunityThoughts}
            onChange={(event) => updateSetting("showCommunityThoughts", event.target.checked)}
          />
        </label>

        <button className="visitor-admin-primary" onClick={saveSettings} disabled={savingSettings}>
          {savingSettings ? "Saving..." : "Save Settings"}
        </button>
      </section>

      <section className="visitor-admin-submissions">
        <div className="visitor-admin-section-heading">
          <div>
            <p className="visitor-admin-eyebrow">COMMUNITY</p>
            <h2>Submissions</h2>
          </div>
          <span className="visitor-admin-count">{thoughts.length} total</span>
        </div>

        <div className="visitor-admin-filters" aria-label="Filter submissions">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All ({thoughts.length})
          </button>
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>
            Pending ({thoughts.filter((item) => !item.published).length})
          </button>
          <button className={filter === "published" ? "active" : ""} onClick={() => setFilter("published")}>
            Published ({thoughts.filter((item) => item.published).length})
          </button>
        </div>

        {filteredThoughts.length === 0 ? (
          <div className="visitor-admin-empty">No submissions in this view.</div>
        ) : (
          <div className="visitor-admin-list">
            {filteredThoughts.map((thought) => (
              <article className="visitor-admin-card" key={thought.id}>
                <div className="visitor-admin-card-top">
                  <div>
                    <h3>{thought.name}</h3>
                    <p>
                      {new Date(thought.createdAt).toLocaleString()}
                      {thought.email ? ` · ${thought.email}` : ""}
                    </p>
                  </div>
                  <span className={thought.published ? "visitor-status published" : "visitor-status pending"}>
                    {thought.published ? "Published" : "Pending"}
                  </span>
                </div>

                {editingId === thought.id ? (
                  <div className="visitor-admin-edit">
                    <label>
                      Name
                      <input value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={80} />
                    </label>
                    <label>
                      Thought
                      <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={5} maxLength={2000} />
                    </label>
                    <div className="visitor-admin-actions">
                      <button className="visitor-admin-primary" onClick={() => saveEdit(thought.id)}>Save Changes</button>
                      <button className="visitor-admin-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="visitor-admin-thought-content">{thought.content}</p>
                )}

                {editingId !== thought.id && (
                  <div className="visitor-admin-actions">
                    <button className="visitor-admin-secondary" onClick={() => startEditing(thought)}>Edit</button>
                    <button className="visitor-admin-secondary" onClick={() => togglePublished(thought)}>
                      {thought.published ? "Move to Pending" : "Publish"}
                    </button>
                    <button className="visitor-admin-danger" onClick={() => deleteThought(thought)}>Delete</button>
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
