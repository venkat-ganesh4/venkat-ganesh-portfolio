
import { lazy, Suspense, useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import { trackPageView, trackEvent } from './utils/analytics';

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ThoughtsPage = lazy(() => import('./pages/ThoughtsPage'));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'));
const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HobbiesPage = lazy(() => import('./pages/HobbiesPage'));
const HobbyDetailsPage = lazy(() => import('./pages/HobbyDetailsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage'));

// Admin pages
const ContactAdminPage = lazy(() => import('./pages/admin/ContactAdminPage'));
const ResumeAdminPage = lazy(() => import('./pages/admin/ResumeAdminPage'));
const MyThoughtsAdminPage = lazy(() => import('./pages/admin/MyThoughtsAdminPage'));
const VisitorThoughtsAdminPage = lazy(() => import('./pages/admin/VisitorThoughtsAdminPage'));
const ExperienceAdminPage = lazy(() => import('./pages/admin/ExperienceAdminPage'));
const SkillsAdminPage = lazy(() => import('./pages/admin/SkillsAdminPage'));
const AboutAdminPage = lazy(() => import('./pages/admin/AboutAdminPage'));
const HobbiesAdminPage = lazy(() => import('./pages/admin/HobbiesAdminPage'));
const ProjectsAdminPage = lazy(() => import('./pages/admin/ProjectsAdminPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const HomepageEditorPage = lazy(() => import('./pages/admin/HomepageEditorPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}

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

function PageLoading() {
  return (
    <div className="section">
      <div className="container">
        <p>Loading page...</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  // Track public page views
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    trackPageView();
  }, [location.pathname]);

  // Track user interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const targetElement = event.target;

      if (!(targetElement instanceof Element)) return;

      const element = targetElement.closest(
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
    <>
      <ScrollToTop />

      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/contact" element={<ContactAdminPage />} />
          <Route path="/admin/resume" element={<ResumeAdminPage />} />
          <Route path="/admin/my-thoughts" element={<MyThoughtsAdminPage />} />
          <Route path="/admin/visitor-thoughts" element={<VisitorThoughtsAdminPage />} />
          <Route path="/admin/experience" element={<ExperienceAdminPage />} />
          <Route path="/admin/skills" element={<SkillsAdminPage />} />
          <Route path="/admin/about" element={<AboutAdminPage />} />
          <Route path="/admin/projects" element={<ProjectsAdminPage />} />
          <Route path="/admin/hobbies" element={<HobbiesAdminPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/homepage" element={<HomepageEditorPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Public website routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />

            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailsPage />} />

            <Route path="/hobbies" element={<HobbiesPage />} />
            <Route path="/hobbies/:slug" element={<HobbyDetailsPage />} />

            <Route
              path="/blog"
              element={<Navigate to="/hobbies" replace />}
            />

            <Route path="/thoughts" element={<ThoughtsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
