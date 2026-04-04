import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      const logged = await login(email, password);
      setStatus({ type: 'success', message: 'Logged in successfully!' });
      setTimeout(() => {
        navigate(logged.role === 'admin' ? '/admin' : '/home');
      }, 300);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || err.message || 'Login failed' });
    }
  };

  if (user) return <Navigate to="/home" replace />;

  return (
    <>
      <Nav />
      <main className="container page">
        <section className="section-card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.78rem' }}>
            Welcome back
          </p>
          <h2 style={{ marginBottom: '0.5rem' }}>Log in</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Access your profile, create posts, and join the discussion.
          </p>
          {status.message && <div className={`statusMessage ${status.type}`}>{status.message}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Log in</button>
          </form>
          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>
            Don&apos;t have an account? <Link to="/register" className="target-link">Create one</Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
