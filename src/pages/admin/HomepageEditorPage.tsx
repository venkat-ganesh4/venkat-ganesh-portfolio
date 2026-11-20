import "./admin.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { homepageContent } from "../../data/homepageContent";
import type { HomePageContent } from "../../types/homepage";
import ImageUploader from "../../components/admin/ImageUploader";

type EditorMode = "visual" | "json";
type Path = (string | number)[];

function updateAtPath(
  source: unknown,
  path: Path,
  value: unknown
): unknown {
  if (path.length === 0) return value;

  const [key, ...remaining] = path;

  if (Array.isArray(source)) {
    const copy = [...source];
    copy[key as number] = updateAtPath(
      copy[key as number],
      remaining,
      value
    );
    return copy;
  }

  if (source && typeof source === "object") {
    const copy = { ...source } as Record<string, unknown>;
    copy[key as string] = updateAtPath(
      copy[key as string],
      remaining,
      value
    );
    return copy;
  }

  return source;
}

function getNewItem(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.length > 0 ? structuredClone(value[0]) : "";
  }
  return "";
}

function VisualField({
  label,
  value,
  path,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  value: unknown;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  onAdd: (path: Path, value: unknown) => void;
  onRemove: (path: Path) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (Array.isArray(value)) {
    return (
      <section style={{ margin: "16px 0", paddingLeft: 12, borderLeft: "2px solid var(--border, #ccc)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <strong>{label} ({value.length})</strong>
          <div>
            <button type="button" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Collapse" : "Expand"}
            </button>
            <button
              type="button"
              onClick={() => onAdd(path, getNewItem(value))}
              style={{ marginLeft: 8 }}
            >
              + Add
            </button>
          </div>
        </div>

        {expanded && value.map((item, index) => (
          <div key={index} style={{ marginTop: 12, padding: 12, border: "1px solid var(--border, #ccc)", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{label} #{index + 1}</strong>
              <button type="button" onClick={() => onRemove([...path, index])}>
                Remove
              </button>
            </div>
            <VisualField
              label={`Item ${index + 1}`}
              value={item}
              path={[...path, index]}
              onChange={onChange}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          </div>
        ))}
      </section>
    );
  }

  if (value && typeof value === "object") {
    return (
      <section style={{ margin: "16px 0", paddingLeft: 12, borderLeft: "2px solid var(--border, #ccc)" }}>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{ fontWeight: 700, marginBottom: 8 }}
        >
          {expanded ? "▼" : "▶"} {label}
        </button>

        {expanded && Object.entries(value).map(([key, child]) => (
          <VisualField
            key={key}
            label={key}
            value={child}
            path={[...path, key]}
            onChange={onChange}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </section>
    );
  }

  return (
    <div style={{ margin: "12px 0" }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>

      {typeof value === "boolean" ? (
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />
      ) : typeof value === "number" ? (
        <input
          type="number"
          value={value}
          className="admin-input"
          onChange={(event) => onChange(path, Number(event.target.value))}
        />
      ) : typeof value === "string" && value.length > 100 ? (
        <textarea
          value={value}
          rows={4}
          className="admin-textarea"
          onChange={(event) => onChange(path, event.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value == null ? "" : String(value)}
          className="admin-input"
          onChange={(event) =>
            onChange(path, value === null && !event.target.value
              ? null
              : event.target.value)
          }
        />
      )}
    </div>
  );
}

export default function HomepageEditorPage() {
  const navigate = useNavigate();

  const [content, setContent] = useState<HomePageContent>(homepageContent);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(homepageContent, null, 2)
  );
  const [mode, setMode] = useState<EditorMode>("visual");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const session = await fetch("http://localhost:5000/api/admin/me", {
          credentials: "include",
        });

        if (!session.ok) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/settings",
          { credentials: "include" }
        );

        if (!response.ok) throw new Error("Could not load settings");

        const data = await response.json();
        const saved = data.settings.find(
          (item: { key: string }) => item.key === "homepage"
        );

        if (saved) {
          const loaded = saved.value as HomePageContent;
          setContent(loaded);
          setJsonText(JSON.stringify(loaded, null, 2));
        }
      } catch {
        setMessage("Could not load saved content.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [navigate]);

  function updateVisualContent(path: Path, value: unknown) {
    setContent((previous) =>
      updateAtPath(previous, path, value) as HomePageContent
    );

    setJsonError("");
    setMessage("");
    setJsonText(
      JSON.stringify(updateAtPath(content, path, value), null, 2)
    );
  }

  function addArrayItem(path: Path, value: unknown) {
    const current = path.reduce<unknown>((result, key) => {
      if (Array.isArray(result)) return result[key as number];
      if (result && typeof result === "object") {
        return (result as Record<string, unknown>)[key as string];
      }
      return undefined;
    }, content);

    if (!Array.isArray(current)) return;

    updateVisualContent(path, [...current, value]);
  }

  function removeItem(path: Path) {
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1] as number;

    const current = parentPath.reduce<unknown>((result, key) => {
      if (Array.isArray(result)) return result[key as number];
      if (result && typeof result === "object") {
        return (result as Record<string, unknown>)[key as string];
      }
      return undefined;
    }, content);

    if (!Array.isArray(current)) return;

    updateVisualContent(
      parentPath,
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function handleJsonChange(value: string) {
    setJsonText(value);
    setMessage("");

    try {
      const parsed = JSON.parse(value) as HomePageContent;
      setContent(parsed);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON. Correct the syntax before saving.");
    }
  }

  async function handleSave() {
    if (jsonError) {
      setMessage("Fix JSON errors before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/settings/homepage",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ value: content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Save failed");
      }

      setJsonText(JSON.stringify(content, null, 2));
      setMessage("Homepage content saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading homepage editor...</p>;

  return (
  <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <strong>VG / STUDIO</strong>
        <span>Portfolio Control Center</span>
      </div>

      <div>
        <p className="admin-nav-label">Workspace</p>
        <nav className="admin-nav">
          <a href="/admin">◈ Dashboard</a>
          <a href="/admin/homepage" className="active">▤ Homepage Editor</a>
        </nav>
      </div>

      <div>
        <p className="admin-nav-label">Content Management</p>
        <nav className="admin-nav">
          {Object.keys(content).map((section) => (
            <button
              key={section}
              type="button"
              onClick={() =>
                document.getElementById(`section-${section}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              ◦ {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-sidebar-footer">
        <div>OWNER ACCESS</div>
        <div>Venkat Ganesh · Admin</div>
      </div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar">
        <div>
          <div className="admin-breadcrumb">Workspace / Content / Homepage</div>
          <h1 className="admin-heading">Content Studio</h1>
          <p className="admin-subheading">
            Manage and customize your portfolio homepage.
          </p>
        </div>

        <div className="admin-actions">
          <a href="/" target="_blank" rel="noreferrer" className="admin-button">
            Preview Website ↗
          </a>
          <button
            className="admin-button admin-button-primary"
            onClick={handleSave}
            disabled={saving || Boolean(jsonError)}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          type="button"
          aria-pressed={mode === "visual"}
          onClick={() => {
            setMode("visual");
            setJsonText(JSON.stringify(content, null, 2));
            setJsonError("");
          }}
        >
          ◈ Visual Editor
        </button>
        <button
          type="button"
          aria-pressed={mode === "json"}
          onClick={() => setMode("json")}
        >
          {"</>"} Advanced JSON
        </button>
      </nav>

      {mode === "visual" ? (
        <>
          <section className="admin-panel">
            <h2>Profile Image</h2>
            <p>Upload or replace the image displayed in your homepage hero.</p>

            <ImageUploader
              currentImage={content.hero.profileImage.url ?? undefined}
              onUpload={(url) => {
                updateVisualContent(
                  ["hero", "profileImage"],
                  {
                    ...content.hero.profileImage,
                    url,
                    enabled: true,
                  }
                );
                setMessage("Image uploaded. Save changes to publish it.");
              }}
            />
          </section>

          <section className="admin-panel">
            <h2>Homepage Sections</h2>
            <p>
              Edit text, manage lists, and customize the content shown on your
              public homepage.
            </p>

            {Object.entries(content).map(([section, value]) => (
              <details
                key={section}
                id={`section-${section}`}
                className="admin-section"
                open={section === "hero"}
              >
                <summary>{section}</summary>
                <div className="admin-section-body">
                  <VisualField
                    label={section}
                    value={value}
                    path={[section]}
                    onChange={updateVisualContent}
                    onAdd={addArrayItem}
                    onRemove={removeItem}
                  />
                </div>
              </details>
            ))}
          </section>
        </>
      ) : (
        <section className="admin-panel">
          <h2>Advanced JSON Editor</h2>
          <p>
            Directly edit the complete homepage configuration. Invalid JSON
            cannot be saved.
          </p>

          <textarea
            className="admin-code-editor"
            value={jsonText}
            onChange={(event) => handleJsonChange(event.target.value)}
            spellCheck={false}
          />

          {jsonError && (
            <p className="admin-message admin-error" role="alert">
              {jsonError}
            </p>
          )}

          <button
            className="admin-button"
            type="button"
            onClick={() => {
              try {
                setJsonText(JSON.stringify(JSON.parse(jsonText), null, 2));
                setMessage("JSON formatted.");
              } catch {
                setJsonError("Cannot format invalid JSON.");
              }
            }}
          >
            Format JSON
          </button>
        </section>
      )}

      <div className="admin-inline-actions">
        <button
          className="admin-button admin-button-primary"
          onClick={handleSave}
          disabled={saving || Boolean(jsonError)}
        >
          {saving ? "Saving..." : "Save Homepage"}
        </button>
        <a href="/" target="_blank" rel="noreferrer" className="admin-button">
          Open Public Website ↗
        </a>
      </div>

      {message && (
        <p
          role="status"
          className={`admin-message ${jsonError ? "admin-error" : ""}`}
        >
          {message}
        </p>
      )}
    </main>
  </div>
);
}
