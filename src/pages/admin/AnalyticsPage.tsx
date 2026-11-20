
import { useEffect, useState } from "react";
import "./admin.css";

type AnalyticsData = {
  range: number;
  overview: {
    totalEvents: number;
    pageViews: number;
    uniqueVisitors: number;
    resumeDownloads: number;
    contactClicks: number;
  };
  visitorsByDay: { date: string; visitors: number }[];
  popularPages: { page: string; views: number }[];
  popularClicks: { target: string | null; clicks: number }[];
  devices: { device: string | null; events: number }[];
  trafficSources: { source: string | null; events: number }[];
};

const API = "http://localhost:5000/api/admin/analytics/overview";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics(range = days) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}?days=${range}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your admin session expired. Please log in again."
            : "Unable to load analytics."
        );
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(days);
  }, [days]);

  const maxVisitors = Math.max(
    1,
    ...(data?.visitorsByDay.map((item) => item.visitors) ?? [])
  );

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">PORTFOLIO INSIGHTS</p>
          <h1>Analytics</h1>
          <p>Understand how visitors interact with your portfolio.</p>
        </div>

        <div className="analytics-actions">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button onClick={() => loadAnalytics(days)}>Refresh</button>
        </div>
      </header>

      {loading && <p className="analytics-message">Loading analytics...</p>}
      {error && <p className="analytics-error">{error}</p>}

      {!loading && data && (
        <>
          <div className="analytics-stats-grid">
            <StatCard label="Unique Visitors" value={data.overview.uniqueVisitors} />
            <StatCard label="Page Views" value={data.overview.pageViews} />
            <StatCard label="Total Events" value={data.overview.totalEvents} />
            <StatCard label="Resume Downloads" value={data.overview.resumeDownloads} />
            <StatCard label="Contact Clicks" value={data.overview.contactClicks} />
          </div>

          <section className="analytics-panel">
            <div className="analytics-panel-heading">
              <h2>Visitor Activity</h2>
              <span>Daily page views</span>
            </div>

            <div className="analytics-chart">
              {data.visitorsByDay.map((item) => (
                <div className="analytics-bar-item" key={item.date}>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar"
                      style={{
                        height: `${(item.visitors / maxVisitors) * 100}%`,
                      }}
                      title={`${item.visitors} page views`}
                    />
                  </div>
                  <span>{item.date.slice(5)}</span>
                  <strong>{item.visitors}</strong>
                </div>
              ))}
            </div>
          </section>

          <div className="analytics-tables-grid">
            <AnalyticsTable
              title="Popular Pages"
              firstColumn="Page"
              secondColumn="Views"
              rows={data.popularPages.map((item) => [item.page, item.views])}
            />

            <AnalyticsTable
              title="Most Clicked"
              firstColumn="Target"
              secondColumn="Clicks"
              rows={data.popularClicks.map((item) => [
                item.target || "Unknown",
                item.clicks,
              ])}
            />

            <AnalyticsTable
              title="Traffic Sources"
              firstColumn="Source"
              secondColumn="Events"
              rows={data.trafficSources.map((item) => [
                item.source || "Unknown",
                item.events,
              ])}
            />

            <AnalyticsTable
              title="Devices"
              firstColumn="Device"
              secondColumn="Events"
              rows={data.devices.map((item) => [
                item.device || "Unknown",
                item.events,
              ])}
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="analytics-stat-card">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function AnalyticsTable({
  title,
  firstColumn,
  secondColumn,
  rows,
}: {
  title: string;
  firstColumn: string;
  secondColumn: string;
  rows: (string | number)[][];
}) {
  return (
    <section className="analytics-panel analytics-table-panel">
      <h2>{title}</h2>

      {rows.length === 0 ? (
        <p className="analytics-empty">No data yet.</p>
      ) : (
        <table className="analytics-table">
          <thead>
            <tr>
              <th>{firstColumn}</th>
              <th>{secondColumn}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
