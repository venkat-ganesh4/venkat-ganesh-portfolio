
import "./ResumeAdminPage.css";
import { useEffect, useState } from "react";

const ADMIN_API = "http://localhost:5000/api/admin/resume";
const UPLOAD_API = "http://localhost:5000/api/admin/uploads/media";

type ResumeData = {
  pageTitle: string;
  headline: string;
  intro: string;
  pdfUrl: string | null;
  pdfPublicId: string | null;
  pdfFilename: string | null;
  videoUrl: string | null;
  videoPublicId: string | null;
  videoFilename: string | null;
  videoThumbnail: string | null;
  published: boolean;
};

const initialData: ResumeData = {
  pageTitle: "My Resume",
  headline: "Get to know my journey",
  intro: "Explore my professional background and experience.",
  pdfUrl: null,
  pdfPublicId: null,
  pdfFilename: null,
  videoUrl: null,
  videoPublicId: null,
  videoFilename: null,
  videoThumbnail: null,
  published: false,
};

export default function ResumeAdminPage() {
  const [resume, setResume] = useState<ResumeData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"pdf" | "video" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(ADMIN_API, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load Resume content");
      }

      if (data.resume) {
        setResume({ ...initialData, ...data.resume });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Resume");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) {
    setResume((current) => ({ ...current, [field]: value }));
  }

  async function uploadMedia(
    event: React.ChangeEvent<HTMLInputElement>,
    type: "pdf" | "video"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = type === "pdf" ? 10 : 100;

    if (file.size > maxSize * 1024 * 1024) {
      setError(`The ${type.toUpperCase()} must be smaller than ${maxSize} MB.`);
      event.target.value = "";
      return;
    }

    if (
      type === "pdf" &&
      (file.type !== "application/pdf" ||
        !file.name.toLowerCase().endsWith(".pdf"))
    ) {
      setError("Please select a valid PDF file.");
      event.target.value = "";
      return;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(type);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(UPLOAD_API, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (type === "pdf") {
        setResume((current) => ({
          ...current,
          pdfUrl: data.url,
          pdfPublicId: data.publicId,
          pdfFilename: data.filename,
        }));
      } else {
        setResume((current) => ({
          ...current,
          videoUrl: data.url,
          videoPublicId: data.publicId,
          videoFilename: data.filename,
        }));
      }

      setMessage(`${type.toUpperCase()} uploaded successfully. Save your changes to publish it.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  }

  async function saveResume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(ADMIN_API, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resume),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save Resume content");
      }

      setResume({ ...initialData, ...data.resume });
      setMessage("Resume content saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  function removeMedia(type: "pdf" | "video") {
    const confirmed = window.confirm(
      `Remove the current ${type.toUpperCase()} from your Resume page?`
    );

    if (!confirmed) return;

    if (type === "pdf") {
      setResume((current) => ({
        ...current,
        pdfUrl: null,
        pdfPublicId: null,
        pdfFilename: null,
      }));
    } else {
      setResume((current) => ({
        ...current,
        videoUrl: null,
        videoPublicId: null,
        videoFilename: null,
      }));
    }

    setMessage("Media removed from the editor. Save changes to apply.");
  }

  if (loading) {
    return <div className="resume-admin">Loading Resume settings...</div>;
  }

  return (
    <main className="resume-admin">
      <header className="resume-admin__header">
        <div>
          <p className="resume-admin__eyebrow">CONTENT MANAGEMENT</p>
          <h1>Resume Manager</h1>
          <p>Manage your PDF resume and video introduction.</p>
        </div>

        <span
          className={`resume-admin__status ${
            resume.published ? "is-published" : ""
          }`}
        >
          {resume.published ? "Published" : "Draft"}
        </span>
      </header>

      {error && <div className="resume-admin__notice is-error">{error}</div>}
      {message && (
        <div className="resume-admin__notice is-success">{message}</div>
      )}

      <form onSubmit={saveResume}>
        <section className="resume-admin__section">
          <h2>Page content</h2>

          <label>
            Page title
            <input
              value={resume.pageTitle}
              onChange={(e) => updateField("pageTitle", e.target.value)}
              required
            />
          </label>

          <label>
            Headline
            <input
              value={resume.headline}
              onChange={(e) => updateField("headline", e.target.value)}
            />
          </label>

          <label>
            Introduction
            <textarea
              rows={3}
              value={resume.intro}
              onChange={(e) => updateField("intro", e.target.value)}
            />
          </label>
        </section>

        <section className="resume-admin__section">
          <h2>PDF Resume</h2>
          <p className="resume-admin__description">
            Upload your latest PDF. Visitors will be able to view it on your
            website and download it.
          </p>

          {resume.pdfUrl ? (
            <div className="resume-admin__file">
              <div>
                <strong>{resume.pdfFilename || "Resume PDF"}</strong>
                <a href={resume.pdfUrl} target="_blank" rel="noreferrer">
                  Preview PDF
                </a>
              </div>
              <button
                type="button"
                className="resume-admin__remove"
                onClick={() => removeMedia("pdf")}
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="resume-admin__empty">No PDF uploaded yet.</p>
          )}

          <label className="resume-admin__upload">
            {uploading === "pdf" ? "Uploading PDF..." : "Upload or replace PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploading !== null}
              onChange={(e) => uploadMedia(e, "pdf")}
            />
          </label>
          <small>PDF only. Maximum file size: 10 MB.</small>
        </section>

        <section className="resume-admin__section">
          <h2>Video Resume</h2>
          <p className="resume-admin__description">
            Upload a compressed video introduction. Visitors can play it
            directly on your website.
          </p>

          {resume.videoUrl ? (
            <div className="resume-admin__video">
              <video
                src={resume.videoUrl}
                controls
                playsInline
                preload="metadata"
              />
              <div className="resume-admin__file">
                <strong>{resume.videoFilename || "Video Resume"}</strong>
                <button
                  type="button"
                  className="resume-admin__remove"
                  onClick={() => removeMedia("video")}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="resume-admin__empty">No video uploaded yet.</p>
          )}

          <label className="resume-admin__upload">
            {uploading === "video"
              ? "Uploading video..."
              : "Upload or replace video"}
            <input
              type="file"
              accept="video/*"
              disabled={uploading !== null}
              onChange={(e) => uploadMedia(e, "video")}
            />
          </label>
          <small>
            Video files only. Maximum file size: 100 MB. MP4 with H.264
            encoding is recommended.
          </small>

          <label>
            Video thumbnail URL (optional)
            <input
              type="url"
              placeholder="https://..."
              value={resume.videoThumbnail || ""}
              onChange={(e) =>
                updateField("videoThumbnail", e.target.value || null)
              }
            />
          </label>
        </section>

        <section className="resume-admin__section resume-admin__publish">
          <label className="resume-admin__checkbox">
            <input
              type="checkbox"
              checked={resume.published}
              onChange={(e) => updateField("published", e.target.checked)}
            />
            Publish Resume page
          </label>
          <p className="resume-admin__description">
            When unpublished, visitors cannot access the public Resume API.
          </p>
        </section>

        <div className="resume-admin__actions">
          <button type="submit" disabled={saving || uploading !== null}>
            {saving ? "Saving..." : "Save Resume Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
