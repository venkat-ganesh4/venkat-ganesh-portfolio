
interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="section placeholder-page">
      <div className="container">
        <p className="technical-label">Portfolio / {title}</p>
        <h1 className="section-title">{title}</h1>
        <p className="placeholder-description">
          This section is under development. Stay tuned.
        </p>
      </div>
    </section>
  );
}
