import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Skills', path: '/skills' },
  { label: 'Experience', path: '/experience' },
  { label: 'Projects', path: '/projects' },
  { label: 'My Hobbies', path: '/hobbies' },
  { label: 'Thoughts', path: '/thoughts' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="site-wrapper">
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main site header */}
      <header className="site-header">
        <div className="container header-content">
          <NavLink
            to="/"
            className="brand"
            aria-label="Venkat Ganesh Portfolio Home"
            onClick={closeMobileMenu}
          >
            <span className="brand-letters">VG</span>
            <span className="brand-dot">.</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="main-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Theme Switcher & Mobile Menu Button */}
          <div className="header-actions">
            <ThemeToggle />

            <button
              type="button"
              className="mobile-menu-toggle"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="container mobile-nav-content">
            <div className="mobile-nav-header">
              <span className="technical-label">Menu</span>
            </div>
            <nav className="mobile-nav-links" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                >
                  <span className="mobile-nav-label">{item.label}</span>
                  <span className="mobile-nav-arrow">→</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="site-main">
        <Outlet />
      </main>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-col-brand">
            <div className="brand brand-footer">
              <span>VG</span>
              <span className="brand-dot">.</span>
            </div>
            <p className="footer-description">
              Software Developer & AI/ML Enthusiast. Building software, exploring artificial intelligence, and experimenting with computer vision.
            </p>
          </div>

          <div className="footer-col-meta">
            <div className="footer-meta-block">
              <span className="technical-label">Core Interests</span>
              <p className="footer-mono">Software Development · AI / ML · Computer Vision</p>
            </div>
            <div className="footer-meta-block">
              <span className="technical-label">Palette</span>
              <p className="footer-mono">Forest Emerald · Midnight Navy · Warm Ivory · Soft Sage · Champagne Gold · Muted Lavender</p>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Venkat Ganesh. All rights reserved.
          </p>
          <div className="footer-status-pill">
            <span className="status-dot status-dot-emerald"></span>
            <span>OPEN TO COLLABORATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
