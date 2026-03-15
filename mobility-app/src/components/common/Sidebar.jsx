import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, MapPin, Navigation, Zap, Car, LogOut, Users, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

const DRIVER_NAV = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/driver/location',  icon: MapPin,          label: 'My Location' },
  { to: '/driver/suggest',   icon: Navigation,      label: 'AI Hotspot' },
];
const RIDER_NAV = [
  { to: '/rider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rider/request',   icon: Zap,             label: 'Request Ride' },
];
const ADMIN_NAV = [
  { to: '/admin/dashboard', icon: BarChart3, label: 'Overview' },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === 'driver' ? DRIVER_NAV : role === 'rider' ? RIDER_NAV : ADMIN_NAV;
  const isDriver = role === 'driver';

  const handleLogout = () => { logout(); navigate('/login'); };

  const accentColor   = isDriver ? 'var(--driver)'   : 'var(--brand)';
  const accentLight   = isDriver ? 'var(--driver-light)' : 'var(--brand-light)';
  const accentBorder  = isDriver ? 'var(--driver-border)' : 'var(--brand-border)';

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} style={{
        position: 'fixed', top: 14, left: 14, zIndex: 1000,
        display: 'none',
        background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--r-md)', padding: '7px', color: 'var(--text-secondary)',
        cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
      }} className="mobile-btn">
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', zIndex: 998,
        }} className="mobile-overlay" />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 248,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column',
        zIndex: 999,
      }} className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: accentLight,
            border: `1px solid ${accentBorder}`,
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor, flexShrink: 0,
          }}>
            {isDriver ? <Car size={16} /> : <Navigation size={16} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>MoveIQ</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 400, marginTop: 1 }}>
              {isDriver ? 'Driver Portal' : 'Rider Portal'}
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: accentLight,
            border: `1px solid ${accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: accentColor,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <span className={`badge badge-${isDriver ? 'driver' : 'rider'}`} style={{ marginTop: 2 }}>
              <span className="pulse-dot" />
              {role}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div className="section-label" style={{ paddingLeft: 8 }}>Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--r-md)',
                color: isActive ? accentColor : 'var(--text-secondary)',
                background: isActive ? accentLight : 'transparent',
                textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                transition: 'all var(--transition)', marginBottom: 2,
                border: `1px solid ${isActive ? accentBorder : 'transparent'}`,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '14px 18px',
          background: 'none', border: 'none', borderTop: '1px solid var(--border-light)',
          color: 'var(--text-muted)', fontSize: 13, fontWeight: 400,
          cursor: 'pointer', transition: 'color var(--transition)', fontFamily: 'var(--font)',
          width: '100%', textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={15} /> Sign out
        </button>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .sidebar { transform: translateX(-100%); transition: transform 0.2s ease; box-shadow: none; }
          .sidebar.sidebar-open { transform: translateX(0); box-shadow: var(--shadow-xl); }
        }
      `}</style>
    </>
  );
}
