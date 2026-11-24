import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./thoughts.css";

interface MyThought {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface VisitorThought {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export default function ThoughtsPage() {
  const [myThoughts, setMyThoughts] = useState<MyThought[]>([]);
  const [communityThoughts, setCommunityThoughts] = useState<VisitorThought[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const [loadingMyThoughts, setLoadingMyThoughts] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API = "http://localhost:5000/api";

  // Fetch published personal thoughts
  async function loadMyThoughts() {
    try {
      const response = await fetch(`${API}/thoughts`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Could not load personal thoughts");
      }

      setMyThoughts(data.thoughts ?? []);
    } catch (err) {
      console.error("My thoughts error:", err);
    } finally {
      setLoadingMyThoughts(false);
    }
  }

  // Fetch published community thoughts
  async function loadCommunityThoughts() {
    try {
      const response = await fetch(`${API}/visitor-thoughts`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Could not load community thoughts");
      }

      setCommunityThoughts(data.thoughts ?? []);
    } catch {
      setError("Community thoughts are temporarily unavailable.");
    } finally {
      setLoadingCommunity(false);
    }
  }

  useEffect(() => {
    void loadMyThoughts();
    void loadCommunityThoughts();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API}/visitor-thoughts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, content }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not submit your thought");
      }

      setMessage(data.message);
      setName("");
      setEmail("");
      setContent("");

      await loadCommunityThoughts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="thoughts-page">
      {/* Hero */}
      <section className="thoughts-hero">
        <span className="technical-label">A SPACE FOR IDEAS</span>

        <h1>Thoughts & Perspectives</h1>

        <p>
          A place for ideas, reflections, experiences, and conversations.
          Share something that's on your mind.
        </p>
      </section>

      <section className="thoughts-content">

        {/* PERSONAL THOUGHTS */}
        <div className="thoughts-list-section">
          <div className="thoughts-section-heading">
            <span className="technical-label">PERSONAL WRITINGS</span>
            <h2>My Thoughts</h2>
            <p>
              Personal reflections, ideas, experiences, and things
              I'm learning along the way.
            </p>
          </div>

          {loadingMyThoughts ? (
            <p className="thoughts-status">Loading my thoughts...</p>
          ) : myThoughts.length === 0 ? (
            <div className="thoughts-empty">
              <h3>Nothing written yet.</h3>
              <p>New writings will appear here when published.</p>
            </div>
          ) : (
            <div className="thoughts-grid">
              {myThoughts.map((thought) => (
                <article className="thought-card" key={thought.id}>
                  <h3>{thought.title}</h3>

                  <p className="thought-card-content">
                    {thought.content}
                  </p>

                  <div className="thought-card-footer">
                    <strong>Venkat Ganesh</strong>

                    <time dateTime={thought.createdAt}>
                      {formatDate(thought.createdAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* COMMUNITY THOUGHTS */}
        <div className="thoughts-list-section">
          <div className="thoughts-section-heading">
            <span className="technical-label">COMMUNITY</span>

            <h2>Shared Thoughts</h2>

            <p>
              Perspectives and messages shared by visitors to this portfolio.
            </p>
          </div>

          {loadingCommunity ? (
            <p className="thoughts-status">Loading community thoughts...</p>
          ) : error && communityThoughts.length === 0 ? (
            <p className="thoughts-status">{error}</p>
          ) : communityThoughts.length === 0 ? (
            <div className="thoughts-empty">
              <h3>Start the conversation.</h3>

              <p>
                There are no published community thoughts yet.
                Your contribution could be the first.
              </p>
            </div>
          ) : (
            <div className="thoughts-grid">
              {communityThoughts.map((thought) => (
                <article className="thought-card" key={thought.id}>
                  <p className="thought-card-content">
                    {thought.content}
                  </p>

                  <div className="thought-card-footer">
                    <strong>{thought.name}</strong>

                    <time dateTime={thought.createdAt}>
                      {formatDate(thought.createdAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* SUBMISSION FORM */}
        <aside className="thoughts-form-section">
          <span className="technical-label">JOIN THE CONVERSATION</span>

          <h2>Leave a thought</h2>

          <p>
            Have an idea, observation, or something you'd like to share?
            I'd love to hear it.
          </p>

          <form onSubmit={handleSubmit} className="thoughts-form">
            <label htmlFor="thought-name">Your name</label>

            <input
              id="thought-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              placeholder="How should we address you?"
            />

            <label htmlFor="thought-email">
              Email <span>(optional, kept private)</span>
            </label>

            <input
              id="thought-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              placeholder="you@example.com"
            />

            <label htmlFor="thought-content">Your thought</label>

            <textarea
              id="thought-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={2000}
              rows={6}
              required
              placeholder="Write what's on your mind..."
            />

            <div className="thoughts-form-meta">
              <span>{content.length}/2000</span>
              <span>Your email won't appear publicly.</span>
            </div>

            {message && (
              <p className="thoughts-success" role="status">
                {message}
              </p>
            )}

            {error && (
              <p className="thoughts-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Share your thought"}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}