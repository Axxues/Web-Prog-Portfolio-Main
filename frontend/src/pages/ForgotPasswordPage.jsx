import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import api from '../api/axios';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      let message = 'OTP sent to your email! Check your inbox.';
      
      // Show dev OTP if available (development mode only)
      if (data.devOtp) {
        message += ` [DEV: ${data.devOtp}]`;
      }
      
      setStatus({ 
        type: 'success', 
        message 
      });
      setStep('otp');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || err.message || 'Failed to send OTP' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStatus({ 
        type: 'success', 
        message: 'OTP verified! Now set your new password.' 
      });
      setStep('reset');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || err.message || 'Invalid or expired OTP' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event) => {
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
      await api.post('/auth/reset-password', { email, otp, password });
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
            Reset your password
          </p>
          <h2 style={{ marginBottom: '0.5rem' }}>Forgot Password</h2>
          
          {step === 'email' && (
            <>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter your email address and we'll send you an OTP to reset your password.
              </p>
              {status.message && <div className={`statusMessage ${status.type}`}>{status.message}</div>}
              <form onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email">Email</label>
                  <input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter the 6-digit OTP we sent to {email}
              </p>
              {status.message && <div className={`statusMessage ${status.type}`}>{status.message}</div>}
              <form onSubmit={handleOtpSubmit}>
                <div>
                  <label htmlFor="otp">OTP Code</label>
                  <input 
                    id="otp" 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                    placeholder="000000"
                    maxLength="6"
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <button 
                type="button" 
                onClick={() => setStep('email')} 
                className="target-link" 
                style={{ marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Back to email
              </button>
            </>
          )}

          {step === 'reset' && (
            <>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Create a new password for your account.
              </p>
              {status.message && <div className={`statusMessage ${status.type}`}>{status.message}</div>}
              <form onSubmit={handleResetSubmit}>
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
            </>
          )}

          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>
            Remember your password? <Link to="/login" className="target-link">Log in</Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default ForgotPasswordPage;
