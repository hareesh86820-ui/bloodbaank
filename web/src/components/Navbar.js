import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const NAV_LINKS = {
  donor:     [{ to: '/', label: '🏠 Dashboard' }, { to: '/map', label: '🗺️ Map' }, { to: '/chatbot', label: '🤖 Eligibility' }],
  recipient: [{ to: '/', label: '🏠 Dashboard' }, { to: '/request/new', label: '➕ New Request' }, { to: '/map', label: '🗺️ Map' }],
  hospital:  [{ to: '/', label: '🏠 Dashboard' }, { to: '/map', label: '🗺️ Map' }],
  admin:     [{ to: '/', label: '🏠 Dashboard' }, { to: '/map', label: '🗺️ Map' }],
  ngo:       [{ to: '/', label: '🏠 Dashboard' }, { to: '/map', label: '🗺️ Map' }]
};

const ROLE_COLORS = {
  donor: '#e63946', recipient: '#457b9d', hospital: '#06d6a0', admin: '#ffd166', ngo: '#a78bfa'
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector(s => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!token) return null;

  const links = NAV_LINKS[user?.role] || [];
  const roleColor = ROLE_COLORS[user?.role] || '#e63946';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Brand */}
        <Link to="/" style={styles.brand} onClick={() => setMenuOpen(false)}>
          <span style={styles.brandIcon}>🩸</span>
          <span style={styles.brandText}>Hemora</span>
        </Link>

        {/* Desktop Links */}
        <div style={{ ...styles.links, display: 'flex' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              ...styles.link,
              ...(location.pathname === l.to ? styles.linkActive : {})
            }}>
              {l.label}
              {location.pathname === l.to && <span style={styles.linkDot} />}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          <div style={{ ...styles.rolePill, background: roleColor + '20', border: '1px solid ' + roleColor + '40', color: roleColor }}>
            {user?.role?.toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <div style={{ ...styles.avatar, background: roleColor }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>

          {/* Hamburger for mobile */}
          <button style={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={{ ...styles.mobileLink, ...(location.pathname === l.to ? styles.mobileLinkActive : {}) }}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={styles.mobileLogout}>Sign out</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: { position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  inner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 8, padding: '0 24px' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginRight: 24, textDecoration: 'none', flexShrink: 0 },
  brandIcon: { fontSize: 24 },
  brandText: { fontSize: 18, fontWeight: 800, color: 'white' },  links: { gap: 4, flex: 1, flexWrap: 'wrap' },
  link: { padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  linkActive: { color: 'white', background: 'rgba(255,255,255,0.08)' },
  linkDot: { width: 4, height: 4, borderRadius: '50%', background: '#e63946' },
  right: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  rolePill: { padding: '3px 10px', borderRadius: 50, fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  logoutBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 },
  hamburger: { display: 'none', background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', padding: '4px 8px' },
  mobileMenu: { background: 'rgba(10,10,15,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 },
  mobileLink: { padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' },
  mobileLinkActive: { color: 'white', background: 'rgba(255,255,255,0.08)' },
  mobileLogout: { marginTop: 8, padding: '10px 14px', background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', borderRadius: 8, cursor: 'pointer', fontSize: 14, textAlign: 'left' }
};
