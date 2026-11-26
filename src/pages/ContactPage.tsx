
import { useEffect, useState } from "react";
import "./ContactPage.css";

const API = "http://localhost:5000/api/contact";

type ContactItem = {
  id: string;
  label: string;
  value: string;
  url: string;
  enabled: boolean;
};

type ContactContent = {
  pageTitle: string;
  headline: string;
  introduction: string;
  availability: string;
  location: string;
  contactItems: ContactItem[];
  socialLinks: ContactItem[];
};

const defaultContent: ContactContent = {
  pageTitle: "Let's Connect",
  headline: "Find me across the web.",
  introduction:
    "Have a question, an opportunity, or just want to connect? You can find me through these platforms.",
  availability: "",
  location: "",
  contactItems: [],
  socialLinks: [],
};

function ContactIcon({ label }: { label: string }) {
  const name = label.toLowerCase();

  if (name.includes("github")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.69 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.48-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.14 3.08-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.3-2.61 5.24-5.1 5.52.4.35.75 1.03.75 2.08v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"
        />
      </svg>
    );
  }

  if (name.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.7H4.96V9.15h2.97v9.55ZM6.45 7.85a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44ZM19.05 18.7h-2.96v-4.65c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.79V9.15h2.84v1.3h.04c.4-.75 1.36-1.54 2.8-1.54 3 0 3.58 1.97 3.58 4.53v5.26Z"
        />
      </svg>
    );
  }

  if (name.includes("phone") || name.includes("mobile") || name.includes("call")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.6 2.8h10.8a1.8 1.8 0 0 1 1.8 1.8v14.8a1.8 1.8 0 0 1-1.8 1.8H6.6a1.8 1.8 0 0 1-1.8-1.8V4.6a1.8 1.8 0 0 1 1.8-1.8Z M10 18.2h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name.includes("gmail") || name.includes("email") || name.includes("mail")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3.5 18.5V6.2c0-1.1 1.3-1.7 2.2-1L12 10l6.3-4.8c.9-.7 2.2-.1 2.2 1v12.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 7.1 12 13.4l8.5-6.3"
          fill="none"
          stroke="#C75B50"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5.5h16v13H4z M4.5 6l7.5 6 7.5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactCard({ item }: { item: ContactItem }) {
  const label = item.label.toLowerCase();

  let href = item.url?.trim() || "";

  if (!href && (label.includes("email") || label.includes("gmail"))) {
    href = `mailto:${item.value}`;
  } else if (!href && (label.includes("phone") || label.includes("mobile"))) {
    href = `tel:${item.value.replace(/[^\d+]/g, "")}`;
  }

  const external = href.startsWith("http");

  return (
    <a
      className="contact-card"
      href={href || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span className="contact-card-icon">
        <ContactIcon label={item.label} />
      </span>

      <span className="contact-card-copy">
        <span className="contact-card-label">{item.label}</span>
        <strong>{item.value}</strong>
      </span>

      <span className="contact-card-arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

export default function ContactPage() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadContact() {
      try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Unable to load contact details.");

        const data = await response.json();

        if (active && data.content) {
          setContent({
            ...defaultContent,
            ...data.content,
            contactItems: Array.isArray(data.content.contactItems)
              ? data.content.contactItems
              : [],
            socialLinks: Array.isArray(data.content.socialLinks)
              ? data.content.socialLinks
              : [],
          });
        }
      } catch (error) {
        console.error("Contact details:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadContact();

    return () => {
      active = false;
    };
  }, []);

  const contacts = content.contactItems.filter((item) => item.enabled);
  const socials = content.socialLinks.filter((item) => item.enabled);

  if (loading) {
    return (
      <main className="contact-page">
        <div className="contact-container contact-loading">
          Loading contact details...
        </div>
      </main>
    );
  }

  return (
    <main className="contact-page">
      <section className="contact-container contact-content">
        <div className="contact-heading">
          <span className="contact-eyebrow">GET IN TOUCH</span>
          <h1>{content.pageTitle}</h1>
          <h2>{content.headline}</h2>
          <p>{content.introduction}</p>

          {content.availability && (
            <span className="contact-note">{content.availability}</span>
          )}

          {content.location && (
            <span className="contact-note">{content.location}</span>
          )}
        </div>

        {contacts.length > 0 && (
          <section className="contact-group">
            <h3>Direct contact</h3>
            <div className="contact-cards">
              {contacts.map((item) => (
                <ContactCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {socials.length > 0 && (
          <section className="contact-group">
            <h3>Find me online</h3>
            <div className="contact-cards">
              {socials.map((item) => (
                <ContactCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {contacts.length === 0 && socials.length === 0 && (
          <p className="contact-empty">
            Contact details will be added here soon.
          </p>
        )}
      </section>
    </main>
  );
}
