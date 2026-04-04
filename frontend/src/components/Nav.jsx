import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/assetUrl';

function Nav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileOpen]);

    const links = useMemo(() => {
        const base = [
            { path: '/home', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/contact', label: 'Contact' },
        ];
        if (user?.role === 'admin') base.push({ path: '/admin', label: 'Admin' });
        if (user) base.push({ path: '/create-post', label: 'Create' });
        return base;
    }, [user]);

    const authLinks = useMemo(() => {
        if (user) return [];
        return [
            { path: '/login', label: 'Log in', variant: 'secondary' },
            { path: '/register', label: 'Join', variant: 'primary' },
        ];
    }, [user]);

    const closeMobile = () => setMobileOpen(false);

    return(
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <nav className="nav">
                    <div className="nav-left">
                        <Link to='/' className='nav-brand' onClick={closeMobile}>
                            <span className="nav-brand-mark">JR</span>
                            <span className="nav-brand-name">Jayvee Reyes</span>
                        </Link>
                    </div>

                    <button
                        type="button"
                        className={`nav-burger ${mobileOpen ? 'open' : ''}`}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        <span className="nav-burger-line" />
                        <span className="nav-burger-line" />
                        <span className="nav-burger-line" />
                    </button>

                    <div 
                        className={`nav-overlay ${mobileOpen ? 'open' : ''}`} 
                        onClick={closeMobile}
                    />

                    <div className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
                        <div className="nav-center">
                            <ul className="nav-links" aria-label="Primary">
                                {links.map((link, index) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            onClick={closeMobile}
                                            className={location.pathname === link.path ? 'active' : ''}
                                        >
                                            {link.label}
                                        </Link>
                                        {/* Prevents the separator from rendering on the last item */}
                                        {index !== links.length - 1 && <span className="nav-separator" />}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="nav-right">
                            <div className="nav-actions">
                                <ThemeToggle />

                                {!user && (
                                    <div className="nav-auth">
                                        {authLinks.map((l) => (
                                            <Link
                                                key={l.path}
                                                to={l.path}
                                                onClick={closeMobile}
                                                className={`btn ${l.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
                                            >
                                                {l.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {user && (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={closeMobile}
                                            className={`nav-profile ${location.pathname === '/profile' ? 'active' : ''}`}
                                        >
                                            <img
                                                src={user.profilePic ? assetUrl(user.profilePic) : '/src/assets/imgs/profile.jpg'}
                                                alt={user.name}
                                                className="nav-profile-pic"
                                            />
                                            <span className="nav-profile-name">{user.name}</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const confirmed = window.confirm('Are you sure you want to log out?');
                                                if (!confirmed) return;
                                                logout();
                                                navigate('/login');
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
export default Nav;