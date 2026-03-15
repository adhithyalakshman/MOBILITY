import { useState } from 'react';
import { suggestArea } from '../../api/driver';
import { AREAS, WEATHER_CONDITIONS, TRAFFIC_DENSITIES, ROAD_TYPES } from '../../utils/constants';
import DelhiMap from '../../components/common/DelhiMap';
import AppLayout from '../../components/common/AppLayout';
import { Navigation, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  end_area: '',
  weather_condition: 'Clear',
  traffic_density_level: 'Medium',
  road_type: 'Main Road',
  average_speed_kmph: 30,
  distance_km: 5,
};

export default function DriverSuggestPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentArea = localStorage.getItem('driver_area') || '';

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({
      ...p,
      [name]: name === 'average_speed_kmph' || name === 'distance_km' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null);
    if (!form.end_area) { setError('Please select your target destination area.'); return; }
    if (form.average_speed_kmph <= 0) { setError('Average speed must be greater than 0.'); return; }
    if (form.distance_km <= 0) { setError('Distance must be greater than 0.'); return; }
    setLoading(true);
    try {
      const { data } = await suggestArea(form);
      setResult(data);
      toast.success(`Hotspot found: ${data.suggested_start_area}`);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Could not get suggestion. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">
          AI Hotspot <span style={{ color: 'var(--brand)' }}>Finder</span>
        </h1>
        <p className="page-subtitle">
          Tell the ML model where you're heading — it will suggest the best area to start from for maximum demand
        </p>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Info banner */}
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.85rem' }}>
                Fill in your planned route details. The AI model will recommend the best <strong>starting area</strong> to position yourself in for maximum ride demand.
              </div>
            </div>

            {!currentArea && (
              <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                ⚠ You haven't set your location yet. <a href="/driver/location" style={{ color: 'inherit', fontWeight: 600 }}>Set it here</a> to appear online.
              </div>
            )}

            <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Your Target End Area</label>
                <select name="end_area" className="form-control form-control-driver" value={form.end_area} onChange={handleChange}>
                  <option value="">— Select destination area —</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Where do you want to drive towards?</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Weather Condition</label>
                  <select name="weather_condition" className="form-control form-control-driver" value={form.weather_condition} onChange={handleChange}>
                    {WEATHER_CONDITIONS.map(w => <option key={w} value={w}>{getWeatherEmoji(w)} {w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Traffic Density</label>
                  <select name="traffic_density_level" className="form-control form-control-driver" value={form.traffic_density_level} onChange={handleChange}>
                    {TRAFFIC_DENSITIES.map(t => <option key={t} value={t}>{getTrafficEmoji(t)} {t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Road Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {ROAD_TYPES.map(r => (
                    <button key={r} type="button" onClick={() => setForm(p => ({ ...p, road_type: r }))} style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${form.road_type === r ? 'rgba(249,115,22,0.45)' : 'var(--border-light)'}`,
                      background: form.road_type === r ? 'rgba(249,115,22,0.1)' : 'transparent',
                      color: form.road_type === r ? 'var(--driver)' : 'var(--text-secondary)',
                      fontSize: '0.78rem', fontWeight: form.road_type === r ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'var(--font)',
                      transition: 'all var(--transition)',
                    }}>
                      {getRoadEmoji(r)} {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Average Speed (km/h)</label>
                  <input type="number" name="average_speed_kmph" className="form-control form-control-driver"
                    min={5} max={120} step={5}
                    value={form.average_speed_kmph} onChange={handleChange}
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Distance (km)</label>
                  <input type="number" name="distance_km" className="form-control form-control-driver"
                    min={0.5} max={100} step={0.5}
                    value={form.distance_km} onChange={handleChange}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {error && <div className="alert alert-error"><span>⚠</span>{error}</div>}

              <button type="submit" className="btn btn-driver btn-full" style={{ marginTop: '0.5rem' }} disabled={loading}>
                {loading
                  ? <><span className="spinner" /><span>Analyzing demand…</span></>
                  : <><Zap size={17} /><span>Get AI Hotspot Suggestion</span></>
                }
              </button>
            </form>
          </div>

          {/* Right: Result + Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Result card */}
            {result && (
              <div className="result-card" style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,0.12)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Navigation size={22} color="var(--success)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font)', fontWeight: 600 }}>
                      🎯 AI Recommendation
                    </div>
                    <div style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                      {result.suggested_start_area}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Based on your route to <strong style={{ color: 'var(--text-primary)' }}>{form.end_area}</strong> under {form.weather_condition.toLowerCase()} weather and {form.traffic_density_level.toLowerCase()} traffic, position yourself in{' '}
                  <strong style={{ color: 'var(--success)' }}>{result.suggested_start_area}</strong> to maximize demand.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                  {[
                    { label: 'Weather', val: form.weather_condition },
                    { label: 'Traffic', val: form.traffic_density_level },
                    { label: 'Road', val: form.road_type },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-sm)', padding: '0.6rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder when no result */}
            {!result && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', borderStyle: 'dashed' }}>
                <Navigation size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontFamily: 'var(--font)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No suggestion yet</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Fill in the form and click the button to get your AI hotspot</div>
              </div>
            )}

            {/* Map */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Route Map</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {result
                    ? `Suggested start: ${result.suggested_start_area} → End: ${form.end_area}`
                    : 'Map will update with your suggestion'}
                </p>
              </div>
              <DelhiMap
                height={350}
                currentArea={currentArea || result?.suggested_start_area}
                destinationArea={form.end_area}
                suggestedArea={result?.suggested_start_area}
                flyTo={result?.suggested_start_area || form.end_area || currentArea}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                {[
                  { color: '#00d4ff', label: 'Your location' },
                  { color: '#10b981', label: 'AI suggested start' },
                  { color: '#a78bfa', label: 'Destination' },
                ].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} /> {l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .page-content > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
}

const getWeatherEmoji = w => ({ Clear: '☀️', Rain: '🌧️', Fog: '🌫️', Heatwave: '🔥' }[w] || '');
const getTrafficEmoji = t => ({ Low: '🟢', Medium: '🟡', High: '🟠', 'Very High': '🔴' }[t] || '');
const getRoadEmoji = r => ({ 'Main Road': '🛣️', 'Inner Road': '🏘️', Highway: '🛤️' }[r] || '');
