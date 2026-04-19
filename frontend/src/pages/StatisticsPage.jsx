import { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../styles/StatisticsPage.css';

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="stats-container"><p>Loading statistics...</p></div>;
  if (error) return <div className="stats-container error-message">{error}</div>;
  if (!stats) return <div className="stats-container"><p>No statistics available</p></div>;

  return (
    <div className="stats-container">
      <h2>Dashboard Statistics</h2>
      
      {/* Key Metrics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.active} active, ${stats.users.inactive} inactive`}
          color="user"
        />
        <StatCard
          title="Total Posts"
          value={stats.posts.total}
          subtitle={`${stats.posts.published} published, ${stats.posts.removed} removed`}
          color="post"
        />
        <StatCard
          title="Total Messages"
          value={stats.messages.total}
          subtitle={`${stats.messages.open} open, ${stats.messages.closed} closed`}
          color="message"
        />
      </div>

      {/* Trends Section */}
      <div className="trends-section">
        <div className="trend-card">
          <h3>Users Joined (Last 30 Days)</h3>
          {stats.trends.usersTrend.length > 0 ? (
            <div className="trend-list">
              {stats.trends.usersTrend.map((item, idx) => (
                <div key={idx} className="trend-item">
                  <span className="date">{item._id}</span>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        width: `${(item.count / Math.max(...stats.trends.usersTrend.map(i => i.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="count">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No user signups in the last 30 days</p>
          )}
        </div>

        <div className="trend-card">
          <h3>Posts Created (Last 30 Days)</h3>
          {stats.trends.postsTrend.length > 0 ? (
            <div className="trend-list">
              {stats.trends.postsTrend.map((item, idx) => (
                <div key={idx} className="trend-item">
                  <span className="date">{item._id}</span>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        width: `${(item.count / Math.max(...stats.trends.postsTrend.map(i => i.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="count">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No posts created in the last 30 days</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="activity-card">
          <h3>Recent Users</h3>
          {stats.recent.users.length > 0 ? (
            <div className="activity-list">
              {stats.recent.users.map((user, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-info">
                    <p className="activity-name">{user.name}</p>
                    <p className="activity-meta">{user.email}</p>
                  </div>
                  <p className="activity-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent users</p>
          )}
        </div>

        <div className="activity-card">
          <h3>Recent Posts</h3>
          {stats.recent.posts.length > 0 ? (
            <div className="activity-list">
              {stats.recent.posts.map((post, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-info">
                    <p className="activity-name">{post.title}</p>
                    <p className="activity-meta">By: {post.author?.name || 'Unknown'}</p>
                  </div>
                  <p className="activity-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent posts</p>
          )}
        </div>
      </div>

      <button onClick={fetchStats} className="refresh-btn">Refresh Statistics</button>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  );
}
