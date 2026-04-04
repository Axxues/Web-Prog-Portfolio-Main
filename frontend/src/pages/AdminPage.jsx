import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import API from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import '../styles/AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([API.get('/admin/users'), API.get('/admin/posts')]);
      setUsers(u.data);
      setPosts(p.data);
      setStatus('');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleUserStatus = async (id) => {
    try {
      await API.put(`/admin/users/${id}/status`);
      setStatus('User status updated');
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Update failed');
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setStatus('Post removed');
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <><Nav /><main className="container"><p>Loading...</p></main></>;

  return (
    <>
      <Nav />
      <main className="container page admin-container">
        <section className="section-card admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users and posts</p>
        </section>

        {status && <div className={`statusMessage ${status.includes('failed') ? 'error' : 'success'}`}>{status}</div>}

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Users ({users.length})
          </button>
          <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts ({posts.length})
          </button>
        </div>

        {activeTab === 'users' && (
          <section className="section-card admin-section">
            <h2>Member Management</h2>
            <div className="cards-grid">
              {users.map((u) => (
                <div key={u._id} className={`user-card ${u.status === 'inactive' ? 'inactive' : ''}`}>
                  <div className="card-header">
                    <div className="user-avatar">{u.name?.charAt(0)?.toUpperCase()}</div>
                    <span className={`status-badge ${u.status}`}>
                      {u.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <h3 className="user-name">{u.name}</h3>
                    <p className="user-email">{u.email}</p>
                    <p className="user-bio">{u.bio || 'No bio added'}</p>
                    <p className="join-date">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="card-footer">
                    <button
                      className={`btn ${u.status === 'active' ? 'btn-danger' : 'btn-primary'} admin-action-btn`}
                      onClick={() => toggleUserStatus(u._id)}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'posts' && (
          <section className="section-card admin-section">
            <h2>Post Management</h2>
            <div className="cards-grid">
              {posts.map((p) => (
                <div key={p._id} className={`post-card-admin ${p.status === 'removed' ? 'removed' : ''}`}>
                  <div className="card-header">
                    <span className={`status-badge ${p.status}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <h3 className="post-title">{p.title}</h3>
                    <p className="post-author">By {p.author?.name}</p>
                    {p.image && (
                      <img src={assetUrl(p.image)} alt={p.title} className="post-card-image" />
                    )}
                    <p className="post-content-preview">
                      {p.body.substring(0, 100)}...
                    </p>
                    <p className="post-date">Created {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="card-footer">
                    {p.status !== 'removed' && (
                      <button
                        className="btn btn-danger admin-action-btn"
                        onClick={() => deletePost(p._id)}
                      >
                        Remove Post
                      </button>
                    )}
                    {p.status === 'removed' && <span className="badge-removed">Removed</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default AdminPage;
