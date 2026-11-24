
import ResumePage from "./pages/ResumePage";
import ResumeAdminPage from "./pages/admin/ResumeAdminPage";
import MyThoughtsAdminPage from "./pages/admin/MyThoughtsAdminPage";
import VisitorThoughtsAdminPage from "./pages/admin/VisitorThoughtsAdminPage";
import ThoughtsPage from "./pages/ThoughtsPage";
import ExperiencePage from "./pages/ExperiencePage";
import ExperienceAdminPage from "./pages/admin/ExperienceAdminPage";
import SkillsPage from "./pages/SkillsPage";
import SkillsAdminPage from "./pages/admin/SkillsAdminPage";
import AboutPage from './pages/AboutPage';
import AboutAdminPage from './pages/admin/AboutAdminPage';
import HobbiesAdminPage from './pages/admin/HobbiesAdminPage';
import HobbiesPage from './pages/HobbiesPage';
import HobbyDetailsPage from './pages/HobbyDetailsPage';
import { Navigate } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProjectsAdminPage from './pages/admin/ProjectsAdminPage';
import HomepageEditorPage from './pages/admin/HomepageEditorPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import PlaceholderPage from './pages/PlaceholderPage';
import { trackPageView, trackEvent } from './utils/analytics';

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
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    trackPageView();
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const element = (event.target as HTMLElement).closest(
        'a, button, [data-analytics]'
      );

      if (!element) return;

      const link = element as HTMLAnchorElement;
      const target =
        link.getAttribute('data-analytics') ||
        link.getAttribute('href') ||
        link.textContent?.trim().slice(0, 100) ||
        'unknown';

      const href = link.getAttribute('href') || '';
      const text = link.textContent?.toLowerCase() || '';

      let eventType:
        | 'click'
        | 'resume_download'
        | 'contact_click'
        | 'project_view' = 'click';

      if (
        link.hasAttribute('download') ||
        href.toLowerCase().endsWith('.pdf') ||
        text.includes('resume')
      ) {
        eventType = 'resume_download';
      } else if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        text.includes('contact')
      ) {
        eventType = 'contact_click';
      } else if (href.includes('/projects')) {
        eventType = 'project_view';
      }

      trackEvent({ eventType, target });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);


  return (
    <Routes>
      <Route path="/admin/resume" element={<ResumeAdminPage />} />
      <Route
  path="/admin/my-thoughts"
  element={<MyThoughtsAdminPage />}
/>
      <Route
  path="/admin/visitor-thoughts"
  element={<VisitorThoughtsAdminPage />}
/>
      {/* Admin */}
      <Route
  path="/admin/experience"
  element={<ExperienceAdminPage />}
/>
      <Route path="/admin/skills" element={<SkillsAdminPage />} />
      <Route path="/admin/about" element={<AboutAdminPage />} />
      <Route path="/admin/projects" element={<ProjectsAdminPage />} />
      <Route path="/admin/hobbies" element={<HobbiesAdminPage />} />
      <Route path="/admin/analytics" element={<AnalyticsPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/homepage" element={<HomepageEditorPage />} />

      {/* Public Website */}
      {/* Public Website */}
<Route element={<PublicLayout />}>
  <Route path="/resume" element={<ResumePage />} />
  <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/experience" element={<ExperiencePage />} />

        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailsPage />} />

        <Route path="/hobbies" element={<HobbiesPage />} />
        <Route path="/hobbies/:slug" element={<HobbyDetailsPage />} />

        {/* Redirect old Blog URL */}
        <Route path="/blog" element={<Navigate to="/hobbies" replace />} />

        <Route path="/thoughts" element={<ThoughtsPage />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
