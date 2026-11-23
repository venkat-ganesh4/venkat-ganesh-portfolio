import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      try {
        const response = await fetch("http://localhost:5000/api/admin/me", {
          credentials: "include",
        });

        if (!response.ok) {
          navigate("/admin/login");
          return;
        }
      } catch {
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [navigate]);

  async function handleLogout() {
    try {
      await fetch("http://localhost:5000/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/admin/login");
    }
  }

  if (loading) return <p>Verifying access...</p>;

  return (
    <main className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome! You are signed in.</p>

      <section>
        <h2>Content Management</h2>

        <div>
          <Link to="/admin/homepage">Edit Homepage</Link>
          <div>
  <Link to="/admin/projects">Manage Projects</Link>
  <div>
  <Link to="/admin/hobbies">Manage Hobbies</Link>
</div>
<div>
  <Link to="/admin/skills">Manage Skills</Link>
</div>
</div>
<a href="/admin/about">Manage About Page</a>
<div>
  <Link to="/admin/analytics">View Analytics</Link>
</div>
<div>
  <Link to="/admin/experience">Manage Experience</Link>
</div>
        </div>
      </section>

      <button onClick={handleLogout}>Sign out</button>
    </main>
  );
}