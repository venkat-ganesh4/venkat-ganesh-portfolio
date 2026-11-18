import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="section placeholder-section">
      <div className="container">
        <div className="panel-architectural placeholder-card">
          <div className="panel-header">
            <span className="technical-label">PORTFOLIO // {title.toUpperCase()}</span>
            <span className="tech-badge tech-badge-gold">IN DEVELOPMENT</span>
          </div>

          <div className="placeholder-body">
            <span className="technical-label placeholder-sub">Section // {title}</span>
            <h1 className="section-title">{title}</h1>
            <p className="placeholder-description">
              This section is currently being developed. The visual design foundation, navigation, and theme systems are fully operational.
            </p>

            <div className="placeholder-actions">
              <Link to="/" className="btn btn-primary">
                ← Back to Home
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Venkat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
