
import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import PlaceholderPage from './pages/PlaceholderPage';

function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PlaceholderPage title="Home" />} />
        <Route path="/about" element={<PlaceholderPage title="About" />} />
        <Route path="/skills" element={<PlaceholderPage title="Skills" />} />
        <Route path="/experience" element={<PlaceholderPage title="Experience" />} />
        <Route path="/projects" element={<PlaceholderPage title="Projects" />} />
        <Route path="/projects/:slug" element={<PlaceholderPage title="Project Details" />} />
        <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
        <Route path="/thoughts" element={<PlaceholderPage title="Thoughts" />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
