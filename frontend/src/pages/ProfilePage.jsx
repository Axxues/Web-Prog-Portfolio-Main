import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const persistedProfilePic = useMemo(() => assetUrl(user?.profilePic), [user?.profilePic]);

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setProfilePicPreview(persistedProfilePic || '');
  }, [user?.name, user?.bio, persistedProfilePic]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }
      const { data } = await API.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      if (data?.user) setUser(data.user);
      setProfilePic(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Update failed.' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    try {
      await API.put('/auth/change-password', { password });
      setStatus({ type: 'success', message: 'Password changed successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Password change failed.' });
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <Nav />
      <main className="container page profile-container">
        <section className="section-card profile-header">
          <div className="header-content">
            <div className="avatar-large">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" className="avatar-image" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="header-info">
              <h1>{user?.name}</h1>
              <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
              <p className="user-email">{user?.email}</p>
              <p className="member-since">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        {status && (
          <div className={`statusMessage ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Profile Settings
          </button>
          <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            Security
          </button>
          <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            Account
          </button>
        </div>

        {activeTab === 'profile' && (
          <section className="section-card profile-section">
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="profilePic">Profile Picture</label>
                <div className="profile-pic-upload">
                  {profilePicPreview && (
                    <div className="profile-pic-preview">
                      <img src={profilePicPreview} alt="Preview" />
                    </div>
                  )}
                  <input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="file-input"
                  />
                  <label htmlFor="profilePic" className="btn btn-secondary">
                    Choose Image
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio / About</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="form-input"
                  placeholder="Tell us about yourself, your skills, and your interests"
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Profile</button>
            </form>
          </section>
        )}

        {activeTab === 'security' && (
          <section className="section-card profile-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </section>
        )}

        {activeTab === 'account' && (
          <section className="section-card profile-section">
            <h2>Account Information</h2>
            <div className="account-info">
              <div className="info-card">
                <div className="info-label">Email Address</div>
                <div className="info-value">{user?.email}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Account Role</div>
                <div className="info-value">
                  <span className={`role-badge ${user?.role}`}>
                    {user?.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Account Status</div>
                <div className="info-value">
                  <span className={`status-badge ${user?.status}`}>
                    {user?.status}
                  </span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Member Since</div>
                <div className="info-value">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default ProfilePage;
