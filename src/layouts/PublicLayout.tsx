
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Skills', path: '/skills' },
  { label: 'Experience', path: '/experience' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blog', path: '/blog' },
  { label: 'Thoughts', path: '/thoughts' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicLayout() {
  return (
    <>
      <header className="site-header">
        <div className="container header-content">
          <NavLink to="/" className="brand">
            VG<span>.</span>
          </NavLink>

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
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} VG. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
