import { useState, useEffect, useCallback } from 'react';
import { getOnlineDrivers, checkUserStatus } from '../../api/status';
import { AREAS, AREA_COORDINATES } from '../../utils/constants';
import DelhiMap from '../../components/common/DelhiMap';
import AppLayout from '../../components/common/AppLayout';
import { Users, RefreshCw, Activity, MapPin } from 'lucide-react';

export default function AdminDashboard() {
  const [onlineDrivers, setOnlineDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDrivers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const { data } = await getOnlineDrivers();
      const drivers = Array.isArray(data) ? data : (data?.drivers || []);
      setOnlineDrivers(drivers);
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(() => fetchDrivers(), 30000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  // Group drivers by area
  const driversByArea = onlineDrivers.reduce((acc, d) => {
    const area = d.area || d;
    if (!acc[area]) acc[area] = 0;
    acc[area]++;
    return acc;
  }, {});

  const topAreas = Object.entries(driversByArea).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Admin Overview</h1>
            <p className="page-subtitle">
              {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Loading…'} • Auto-refresh every 30s
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchDrivers(true)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh Now'}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Online Drivers', value: onlineDrivers.length, color: 'teal', icon: <Users size={18} /> },
            { label: 'Active Areas', value: Object.keys(driversByArea).length, color: 'blue', icon: <MapPin size={18} /> },
            { label: 'Coverage', value: `${Math.round((Object.keys(driversByArea).length / 25) * 100)}%`, color: 'green', icon: <Activity size={18} /> },
            { label: 'Highest Demand', value: topAreas[0]?.[0]?.split(' ')[0] || 'N/A', color: 'amber', icon: <Activity size={18} /> },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{loading ? '…' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Map */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Live Driver Distribution</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Delhi NCR — real-time positions</p>
              </div>
              <span className="badge badge-online"><span className="pulse-dot" /> Live</span>
            </div>
            {loading ? (
              <div style={{ height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span className="spinner" style={{ marginRight: '0.75rem' }} /> Loading…
              </div>
            ) : (
              <DelhiMap height={440} onlineDrivers={onlineDrivers} />
            )}
          </div>

          {/* Area breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Driver Density by Area</h3>
              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
              ) : topAreas.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  No online drivers at the moment
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {topAreas.map(([area, count]) => {
                    const maxCount = topAreas[0][1];
                    const pct = Math.round((count / maxCount) * 100);
                    return (
                      <div key={area}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{area}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font)', fontWeight: 600 }}>
                            {count} driver{count > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`, borderRadius: 99,
                            background: `linear-gradient(90deg, var(--brand), var(--accent-secondary))`,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All areas status */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>All Areas Coverage</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 280, overflowY: 'auto' }}>
                {AREAS.map(area => {
                  const count = driversByArea[area] || 0;
                  return (
                    <div key={area} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.5rem', borderRadius: 'var(--r-sm)', background: count > 0 ? 'rgba(16,185,129,0.04)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: count > 0 ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{area}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font)', fontWeight: 600, color: count > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                        {count > 0 ? `${count} 🚗` : 'Empty'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .page-content > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
}
