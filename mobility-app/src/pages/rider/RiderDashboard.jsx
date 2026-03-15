import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRiderHome } from '../../api/rider';
import { getOnlineDrivers } from '../../api/status';
import DelhiMap from '../../components/common/DelhiMap';
import AppLayout from '../../components/common/AppLayout';
import { Zap, Car, MapPin, ArrowRight, Activity } from 'lucide-react';

export default function RiderDashboard() {
  const { user } = useAuth();
  const [onlineDrivers, setOnlineDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await getRiderHome();
        const { data } = await getOnlineDrivers();
        const drivers = Array.isArray(data) ? data : (data?.drivers || []);
        setOnlineDrivers(drivers);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const stats = [
    { label: 'Available Drivers', value: onlineDrivers.length, color: 'teal', icon: <Car size={18} /> },
    { label: 'Platform', value: 'Delhi NCR', color: 'blue', icon: <MapPin size={18} /> },
    { label: 'Status', value: 'Active', color: 'green', icon: <Activity size={18} /> },
    { label: 'Coverage', value: '25 Areas', color: 'amber', icon: <Zap size={18} /> },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">
              Hello, <span style={{ color: 'var(--brand)' }}>{user?.name?.split(' ')[0] || 'Rider'}</span> 👋
            </h1>
            <p className="page-subtitle">Where would you like to go today?</p>
          </div>
          <Link to="/rider/request" className="btn btn-primary">
            <Zap size={16} /> Request a Ride
          </Link>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick action */}
        <Link to="/rider/request" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.06))',
            borderColor: 'rgba(0,212,255,0.2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ width: 56, height: 56, background: 'rgba(0,212,255,0.12)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={26} color="var(--brand)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Book a Smart Ride</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Our AI matches you with the best available driver based on traffic and conditions
              </div>
            </div>
            <ArrowRight size={20} color="var(--brand)" />
          </div>
        </Link>

        {/* Map */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Live Driver Map — Delhi NCR</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {loading ? 'Loading…' : `${onlineDrivers.length} drivers currently available`}
              </p>
            </div>
            <span className="badge badge-online">
              <span className="pulse-dot" /> Live
            </span>
          </div>

          {loading ? (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ marginRight: '0.75rem' }} /> Loading map…
            </div>
          ) : (
            <DelhiMap height={400} onlineDrivers={onlineDrivers} />
          )}

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} /> Available driver
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
