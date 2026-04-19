import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import api from '../api/axios';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setStatus({ type: 'success', message: 'Password reset successfully!' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || err.message || 'Failed to reset password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="container page">
        <section className="section-card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.78rem' }}>
            Create new password
          </p>
          <h2 style={{ marginBottom: '0.5rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter your new password below.
          </p>
          {status.message && <div className={`statusMessage ${status.type}`}>{status.message}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password">New Password</label>
              <input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>
            Remember your password? <Link to="/login" className="target-link">Log in</Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default ResetPasswordPage;
