import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';

function RegisterPageNew() {
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    try {
      await register(name, email, password);
      setStatus({ type: 'success', message: 'Registration successful! Redirecting...' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || err.message || 'Registration failed' });
    }
  };

  if (user) return <Navigate to='/home' replace />;

  return (
    <>
      <Nav />
      <main className='container'>
        <section>
          <h2>Create your account</h2>
          {status.message && <div className={`statusMessage ${status.type}`}>{status.message}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor='name'>Full Name</label>
              <input id='name' type='text' value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor='email'>Email</label>
              <input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor='password'>Password</label>
              <input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label htmlFor='confirmPassword'>Confirm Password</label>
              <input id='confirmPassword' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type='submit'>Register</button>
          </form>
          <p>Already have an account? <Link to='/login'>Log in</Link></p>
        </section>
      </main>
    </>
  );
}

export default RegisterPageNew;
