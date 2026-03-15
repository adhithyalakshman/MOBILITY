import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDriverHome } from '../../api/driver';
import { getOnlineDrivers } from '../../api/status';
import DelhiMap from '../../components/common/DelhiMap';
import { MapPin, Navigation, Activity, Users, ArrowRight } from 'lucide-react';
import AppLayout from '../../components/common/AppLayout';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [onlineDrivers, setOnlineDrivers] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await getDriverHome();
        const { data } = await getOnlineDrivers();
        const drivers = Array.isArray(data) ? data : (data?.drivers || []);
        setOnlineDrivers(drivers);
        // Read cached location
        const savedArea = localStorage.getItem('driver_area');
        if (savedArea) setCurrentArea(savedArea);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    init();
  }, []);

  const stats = [
    { label: 'Online Drivers', value: onlineDrivers.length, color: 'teal', icon: <Users size={18} /> },
    { label: 'Your Location', value: currentArea ? currentArea.split(' ')[0] : 'Not Set', color: 'amber', icon: <MapPin size={18} /> },
    { label: 'Status', value: currentArea ? 'Active' : 'Idle', color: 'green', icon: <Activity size={18} /> },
    { label: 'Suggestions', value: 'Ready', color: 'blue', icon: <Navigation size={18} /> },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">
              Good {getGreeting()},{' '}
              <span style={{ color: 'var(--driver)' }}>{user?.name?.split(' ')[0] || 'Driver'}</span>
            </h1>
            <p className="page-subtitle">Here's your mobility intelligence overview</p>
          </div>
          {currentArea && (
            <span className="badge badge-online" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
              <span className="pulse-dot" /> Live in {currentArea}
            </span>
          )}
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/driver/location" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all var(--transition)', borderColor: 'rgba(249,115,22,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(249,115,22,0.12)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--driver)' }}>
                  <MapPin size={18} />
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
              <div style={{ fontFamily: 'var(--font)', fontWeight: 700, marginBottom: '0.3rem' }}>Update Location</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {currentArea ? `Currently: ${currentArea}` : 'Set your current area to go online'}
              </div>
            </div>
          </Link>

          <Link to="/driver/suggest" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all var(--transition)', borderColor: 'rgba(0,212,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(0,212,255,0.1)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                  <Navigation size={18} />
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
              <div style={{ fontFamily: 'var(--font)', fontWeight: 700, marginBottom: '0.3rem' }}>AI Hotspot Finder</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Get ML-powered area suggestions to maximize rides</div>
            </div>
          </Link>
        </div>

        {/* Map */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Delhi Driver Distribution</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {onlineDrivers.length} driver{onlineDrivers.length !== 1 ? 's' : ''} currently online
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} /> Online Drivers
              </span>
              {currentArea && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', display: 'inline-block' }} /> Your Location
                </span>
              )}
            </div>
          </div>
          {loading ? (
            <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ marginRight: '0.75rem' }} /> Loading map…
            </div>
          ) : (
            <DelhiMap height={380} currentArea={currentArea} onlineDrivers={onlineDrivers} flyTo={currentArea} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
