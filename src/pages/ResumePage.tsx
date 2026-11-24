
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "./ResumePage.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API = "http://localhost:5000/api/resume";

type ResumeData = {
  pageTitle: string;
  headline: string;
  intro: string;
  pdfUrl: string | null;
  pdfFilename: string | null;
  videoUrl: string | null;
  videoFilename: string | null;
  videoThumbnail: string | null;
};

type ViewMode = "home" | "pdf" | "video";

export default function ResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [view, setView] = useState<ViewMode>("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [numPages, setNumPages] = useState(0);
  const [pdfWidth, setPdfWidth] = useState(800);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadResume() {
      try {
        const response = await fetch(API);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Resume is not available");
        }

        setResume(data.resume);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load Resume content"
        );
      } finally {
        setLoading(false);
      }
    }

    loadResume();
  }, []);

  // Measure the available PDF width and adapt to screen resizing.
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setPdfWidth(Math.max(280, Math.min(container.clientWidth - 32, 1000)));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, [view]);

  function openPdf() {
    setNumPages(0);
    setView("pdf");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openVideo() {
    setView("video");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goBack() {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <main className="resume-page">
        <div className="resume-page__loading">Loading Resume...</div>
      </main>
    );
  }

  if (error || !resume) {
    return (
      <main className="resume-page">
        <section className="resume-page__unavailable">
          <span className="resume-page__eyebrow">RESUME</span>
          <h1>My professional journey</h1>
          <p>{error || "Resume content is currently unavailable."}</p>
          <a href="/">Return to Home</a>
        </section>
      </main>
    );
  }

  // PDF viewer: all pages are rendered in the normal document flow.
  if (view === "pdf" && resume.pdfUrl) {
    return (
      <main className="resume-page resume-page--viewer">
        <div className="resume-page__viewer-header">
          <button type="button" onClick={goBack}>
            ← Back to Resume
          </button>

          <div>
            <span className="resume-page__eyebrow">DOCUMENT VIEWER</span>
            <h1>My Resume</h1>
            {numPages > 0 && (
              <span className="resume-page__viewer-label">
                {numPages} {numPages === 1 ? "PAGE" : "PAGES"}
              </span>
            )}
          </div>

          <a
            href={resume.pdfUrl}
            target="_blank"
            rel="noreferrer"
            download={resume.pdfFilename || "Venkat-Ganesh-Resume.pdf"}
          >
            Download PDF ↗
          </a>
        </div>

        <div
          className="resume-page__pdf-document"
          ref={pdfContainerRef}
        >
          <Document
            file={resume.pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(error) => {
              console.error("PDF loading error:", error);
            }}
            loading={<p className="resume-page__pdf-message">Loading PDF...</p>}
            error={
              <p className="resume-page__pdf-message">
                Unable to display this PDF. Please use the Download PDF option.
              </p>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div className="resume-page__pdf-page" key={`page_${index + 1}`}>
                <Page
                  pageNumber={index + 1}
                  width={pdfWidth}
                  renderTextLayer
                  renderAnnotationLayer
                />
              </div>
            ))}
          </Document>
        </div>
      </main>
    );
  }

  // Video viewer remains unchanged.
  if (view === "video" && resume.videoUrl) {
    return (
      <main className="resume-page resume-page--viewer">
        <div className="resume-page__viewer-header">
          <button type="button" onClick={goBack}>
            ← Back to Resume
          </button>

          <div>
            <span className="resume-page__eyebrow">
              VIDEO INTRODUCTION
            </span>
            <h1>Meet me through video</h1>
          </div>

          <span className="resume-page__viewer-label">
            VIDEO RESUME
          </span>
        </div>

        <section className="resume-page__video-stage">
          <video
            src={resume.videoUrl}
            poster={resume.videoThumbnail || undefined}
            controls
            playsInline
            preload="metadata"
          >
            Your browser does not support embedded video.
          </video>

          <p>{resume.videoFilename || "My Video Resume"}</p>
        </section>
      </main>
    );
  }

  // Main Resume landing page.
  return (
    <main className="resume-page">
      <section className="resume-page__hero">
        <div className="resume-page__hero-copy">
          <span className="resume-page__eyebrow">
            PROFESSIONAL PROFILE / 01
          </span>

          <h1>{resume.pageTitle}</h1>
          <h2>{resume.headline}</h2>
          <p>{resume.intro}</p>

          <div className="resume-page__identity">
            <span>SOFTWARE DEVELOPER</span>
            <span>AI/ML ENTHUSIAST</span>
          </div>
        </div>

        <div className="resume-page__hero-decoration" aria-hidden="true">
          <span className="resume-page__orbit resume-page__orbit--one" />
          <span className="resume-page__orbit resume-page__orbit--two" />
          <span className="resume-page__decoration-mark">VG</span>
          <span className="resume-page__decoration-caption">
            PROFILE / DOCUMENTS
          </span>
        </div>
      </section>

      <section className="resume-page__choices">
        <div className="resume-page__section-heading">
          <div>
            <span className="resume-page__eyebrow">
              EXPLORE MY PROFILE / 02
            </span>
            <h2>Choose how you'd like to know me.</h2>
          </div>

          <span className="resume-page__section-number">01 — 02</span>
        </div>

        <div className="resume-page__cards">
          {/* PDF RESUME */}
          <div
            className={`resume-choice resume-choice--pdf ${
              resume.pdfUrl ? "resume-choice--available" : ""
            }`}
            role="button"
            tabIndex={resume.pdfUrl ? 0 : -1}
            aria-label="Open my PDF resume"
            aria-disabled={!resume.pdfUrl}
            onClick={() => resume.pdfUrl && openPdf()}
            onKeyDown={(event) => {
              if (
                resume.pdfUrl &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                openPdf();
              }
            }}
          >
            <div className="resume-choice__top">
              <span className="resume-choice__number">01</span>
              <span className="resume-choice__format">
                PDF / DOCUMENT
              </span>
            </div>

            <div className="resume-choice__visual resume-choice__visual--pdf">
              {resume.pdfUrl ? (
                <div className="resume-choice__pdf-preview">
                  <iframe
                    src={`${resume.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Resume document preview"
                    loading="lazy"
                    tabIndex={-1}
                  />
                </div>
              ) : (
                <div className="resume-choice__empty">
                  <span>PDF</span>
                  <p>Resume not uploaded yet</p>
                </div>
              )}

              <span className="resume-choice__preview-label">
                LIVE DOCUMENT PREVIEW
              </span>
            </div>

            <div className="resume-choice__bottom">
              <div>
                <h3>My Resume</h3>
                <p>Explore my experience, education and skills.</p>
              </div>
              <span className="resume-choice__arrow">↗</span>
            </div>

            <span className="resume-choice__hover-hint">
              Hover to preview · Click to open
            </span>
          </div>

          {/* VIDEO RESUME */}
          <div
            className={`resume-choice resume-choice--video ${
              resume.videoUrl ? "resume-choice--available" : ""
            }`}
            role="button"
            tabIndex={resume.videoUrl ? 0 : -1}
            aria-label="Open my video resume"
            aria-disabled={!resume.videoUrl}
            onClick={() => resume.videoUrl && openVideo()}
            onKeyDown={(event) => {
              if (
                resume.videoUrl &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                openVideo();
              }
            }}
          >
            <div className="resume-choice__top">
              <span className="resume-choice__number">02</span>
              <span className="resume-choice__format">
                VIDEO / INTRODUCTION
              </span>
            </div>

            <div
              className="resume-choice__visual resume-choice__visual--video"
              style={
                resume.videoThumbnail
                  ? { backgroundImage: `url("${resume.videoThumbnail}")` }
                  : undefined
              }
            >
              {resume.videoUrl && !resume.videoThumbnail && (
                <video
                  className="resume-choice__video-preview"
                  src={resume.videoUrl}
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                />
              )}

              <span className="resume-choice__play">▶</span>
              <span className="resume-choice__video-caption">
                A PERSONAL INTRODUCTION
              </span>
            </div>

            <div className="resume-choice__bottom">
              <div>
                <h3>Video Resume</h3>
                <p>Get to know me beyond the written profile.</p>
              </div>
              <span className="resume-choice__arrow">↗</span>
            </div>

            <span className="resume-choice__hover-hint">
              Hover to preview · Click to open
            </span>

            {!resume.videoUrl && (
              <span className="resume-choice__unavailable">
                Video not uploaded yet
              </span>
            )}
          </div>
        </div>
      </section>

      <footer className="resume-page__footer">
        <span>VENKAT GANESH / PORTFOLIO</span>
        <span>SOFTWARE · AI · COMPUTER VISION</span>
      </footer>
    </main>
  );
}
