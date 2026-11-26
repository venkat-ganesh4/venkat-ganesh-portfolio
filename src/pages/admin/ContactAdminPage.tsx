
import { useEffect, useState } from "react";
import "./admin.css";

const API = "http://localhost:5000/api/admin/contact";

type ContactItem = {
  id: string;
  label: string;
  value: string;
  url: string;
  enabled: boolean;
};

type ContactSettings = {
  pageTitle: string;
  headline: string;
  introduction: string;
  availability: string;
  location: string;
  showContactForm: boolean;
  contactItems: ContactItem[];
  socialLinks: ContactItem[];
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const defaults: ContactSettings = {
  pageTitle: "Let's Connect",
  headline: "Have an idea or opportunity?",
  introduction: "",
  availability: "",
  location: "",
  showContactForm: true,
  contactItems: [],
  socialLinks: [],
};

export default function ContactAdminPage() {
  const [settings, setSettings] = useState<ContactSettings>(defaults);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [tab, setTab] = useState<"settings" | "messages">("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [settingsResponse, messagesResponse] = await Promise.all([
        fetch(`${API}/settings`, { credentials: "include" }),
        fetch(`${API}/messages`, { credentials: "include" }),
      ]);

      if (
        settingsResponse.status === 401 ||
        messagesResponse.status === 401
      ) {
        window.location.href = "/admin/login";
        return;
      }

      if (!settingsResponse.ok || !messagesResponse.ok) {
        throw new Error("Could not load contact admin data.");
      }

      const settingsData = await settingsResponse.json();
      const messagesData = await messagesResponse.json();

      setSettings({
        ...defaults,
        ...(settingsData.content ?? {}),
        contactItems: settingsData.content?.contactItems ?? [],
        socialLinks: settingsData.content?.socialLinks ?? [],
      });

      setMessages(messagesData.messages ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateField<K extends keyof ContactSettings>(
    key: K,
    value: ContactSettings[K]
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
  }

  function updateItem(
    group: "contactItems" | "socialLinks",
    index: number,
    field: keyof ContactItem,
    value: string | boolean
  ) {
    setSettings((previous) => ({
      ...previous,
      [group]: previous[group].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem(group: "contactItems" | "socialLinks") {
    const item: ContactItem = {
      id: crypto.randomUUID(),
      label: "",
      value: "",
      url: "",
      enabled: true,
    };

    setSettings((previous) => ({
      ...previous,
      [group]: [...previous[group], item],
    }));
  }

  function removeItem(
    group: "contactItems" | "socialLinks",
    index: number
  ) {
    setSettings((previous) => ({
      ...previous,
      [group]: previous[group].filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  async function saveSettings() {
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(`${API}/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: settings }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save settings.");
      }

      setNotice("Contact settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateMessageStatus(id: string, status: string) {
    try {
      const response = await fetch(`${API}/messages/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Could not update message.");

      setMessages((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    } catch {
      setError("Could not update message status.");
    }
  }

  async function deleteMessage(id: string) {
    if (!window.confirm("Delete this message permanently?")) return;

    try {
      const response = await fetch(`${API}/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Could not delete message.");

      setMessages((previous) =>
        previous.filter((item) => item.id !== id)
      );
      setNotice("Message deleted.");
    } catch {
      setError("Could not delete message.");
    }
  }

  if (loading) {
    return <main className="admin-main">Loading contact settings...</main>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">VENKAT GANESH</div>
        <nav className="admin-nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/homepage">Homepage</a>
          <a href="/admin/contact" className="active">Contact</a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-heading">Contact Management</h1>
            <p className="admin-subheading">
              Manage your contact information and incoming messages.
            </p>
          </div>
          <a href="/admin">Back to Dashboard</a>
        </header>

        <div className="admin-inline-actions">
          <button
            className="admin-button"
            onClick={() => setTab("settings")}
          >
            Contact Settings
          </button>
          <button
            className="admin-button"
            onClick={() => setTab("messages")}
          >
            Message Inbox ({messages.length})
          </button>
        </div>

        {notice && <p className="admin-message">{notice}</p>}
        {error && <p className="admin-error">{error}</p>}

        {tab === "settings" && (
          <>
            <section className="admin-panel">
              <h2>Page Content</h2>

              <label className="admin-label">Page Title</label>
              <input
                className="admin-input"
                value={settings.pageTitle}
                onChange={(e) => updateField("pageTitle", e.target.value)}
              />

              <label className="admin-label">Headline</label>
              <input
                className="admin-input"
                value={settings.headline}
                onChange={(e) => updateField("headline", e.target.value)}
              />

              <label className="admin-label">Introduction</label>
              <textarea
                className="admin-textarea"
                value={settings.introduction}
                onChange={(e) =>
                  updateField("introduction", e.target.value)
                }
              />

              <label className="admin-label">Availability</label>
              <input
                className="admin-input"
                value={settings.availability}
                onChange={(e) =>
                  updateField("availability", e.target.value)
                }
                placeholder="e.g. Open to opportunities"
              />

              <label className="admin-label">Location</label>
              <input
                className="admin-input"
                value={settings.location}
                onChange={(e) => updateField("location", e.target.value)}
              />

              <label>
                <input
                  type="checkbox"
                  checked={settings.showContactForm}
                  onChange={(e) =>
                    updateField("showContactForm", e.target.checked)
                  }
                />{" "}
                Show contact form on public page
              </label>
            </section>

            {(
              [
                ["contactItems", "Direct Contact Details"],
                ["socialLinks", "Social and Professional Links"],
              ] as const
            ).map(([group, title]) => (
              <section className="admin-panel" key={group}>
                <h2>{title}</h2>

                {settings[group].map((item, index) => (
                  <div className="admin-panel" key={item.id}>
                    <label className="admin-label">Label</label>
                    <input
                      className="admin-input"
                      value={item.label}
                      onChange={(e) =>
                        updateItem(group, index, "label", e.target.value)
                      }
                      placeholder="Email, Phone, LinkedIn..."
                    />

                    <label className="admin-label">Display Value</label>
                    <input
                      className="admin-input"
                      value={item.value}
                      onChange={(e) =>
                        updateItem(group, index, "value", e.target.value)
                      }
                      placeholder="Your email, phone number or profile name"
                    />

                    <label className="admin-label">URL</label>
                    <input
                      className="admin-input"
                      value={item.url}
                      onChange={(e) =>
                        updateItem(group, index, "url", e.target.value)
                      }
                      placeholder="mailto:, tel:, or https://..."
                    />

                    <label>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) =>
                          updateItem(
                            group,
                            index,
                            "enabled",
                            e.target.checked
                          )
                        }
                      />{" "}
                      Visible on public page
                    </label>

                    <button
                      className="admin-button"
                      onClick={() => removeItem(group, index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  className="admin-button"
                  onClick={() => addItem(group)}
                >
                  + Add {group === "contactItems" ? "Contact Detail" : "Social Link"}
                </button>
              </section>
            ))}

            <button
              className="admin-button admin-button-primary"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Contact Settings"}
            </button>
          </>
        )}

        {tab === "messages" && (
          <section className="admin-panel">
            <h2>Contact Messages</h2>

            {messages.length === 0 ? (
              <p>No messages received yet.</p>
            ) : (
              messages.map((item) => (
                <article className="admin-panel" key={item.id}>
                  <div className="admin-inline-actions">
                    <h3>{item.name}</h3>
                    <span>{item.status}</span>
                  </div>

                  <p>
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                  </p>
                  {item.subject && <p><strong>{item.subject}</strong></p>}
                  <p>{item.message}</p>
                  <small>
                    {new Date(item.createdAt).toLocaleString()}
                  </small>

                  <div className="admin-inline-actions">
                    <select
                      className="admin-input"
                      value={item.status}
                      onChange={(e) =>
                        updateMessageStatus(item.id, e.target.value)
                      }
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      className="admin-button"
                      onClick={() => deleteMessage(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}
