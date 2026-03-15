import { useState } from 'react';
import { getCaptain } from '../../api/rider';
import { AREAS, WEATHER_CONDITIONS, TRAFFIC_DENSITIES, ROAD_TYPES, TIME_OF_DAY, DAYS_OF_WEEK } from '../../utils/constants';
import DelhiMap from '../../components/common/DelhiMap';
import AppLayout from '../../components/common/AppLayout';
import { Zap, Car, Info, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

// Auto-detect current time of day
function detectTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 7 && h < 10) return 'Morning Peak';
  if (h >= 10 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 20) return 'Evening Peak';
  return 'Night';
}

function detectDayOfWeek() {
  return DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

const DEFAULT_FORM = {
  rider_area: '',
  end_area: '',
  weather_condition: 'Clear',
  traffic_density_level: 'Medium',
  road_type: 'Main Road',
  distance_km: 5,
  time_of_day: detectTimeOfDay(),
  day_of_week: detectDayOfWeek(),
};

export default function RiderRequestPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'distance_km' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null);
    if (!form.rider_area) { setError('Please select your pickup area.'); return; }
    if (!form.end_area) { setError('Please select your destination area.'); return; }
    if (form.rider_area === form.end_area) { setError('Pickup and destination cannot be the same area.'); return; }
    if (form.distance_km <= 0) { setError('Distance must be greater than 0.'); return; }
    setLoading(true);
    try {
      const { data } = await getCaptain(form);
      setResult(data);
      toast.success('Driver model analyzed succesfully!');
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Could not find a driver. Please try again.');
    } finally { setLoading(false); }
  };

  const handleReset = () => { setForm(DEFAULT_FORM); setResult(null); setError(''); };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">
          Request a <span style={{ color: 'var(--brand)' }}>Ride</span>
        </h1>
        <p className="page-subtitle">
          Enter your journey details — the AI will match you with the optimal driver
        </p>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.85rem' }}>
                Provide accurate journey details so the AI model can match you with the best available driver based on traffic conditions.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
              {/* Route */}
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font)', marginBottom: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={15} /> Route Details
                </h3>

                <div className="form-group">
                  <label className="form-label">Pickup Area</label>
                  <select name="rider_area" className="form-control" value={form.rider_area} onChange={handleChange}>
                    <option value="">— Where are you? —</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Area</label>
                  <select name="end_area" className="form-control" value={form.end_area} onChange={handleChange}>
                    <option value="">— Where to? —</option>
                    {AREAS.filter(a => a !== form.rider_area).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Distance (km)</label>
                  <input type="number" name="distance_km" className="form-control"
                    min={0.5} max={200} step={0.5}
                    value={form.distance_km} onChange={handleChange} placeholder="e.g. 8"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font)', marginBottom: '0.85rem', color: 'var(--text-secondary)' }}>
                  🌡️ Conditions
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Weather</label>
                    <select name="weather_condition" className="form-control" value={form.weather_condition} onChange={handleChange}>
                      {WEATHER_CONDITIONS.map(w => <option key={w} value={w}>{getWeatherEmoji(w)} {w}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Traffic</label>
                    <select name="traffic_density_level" className="form-control" value={form.traffic_density_level} onChange={handleChange}>
                      {TRAFFIC_DENSITIES.map(t => <option key={t} value={t}>{getTrafficEmoji(t)} {t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Road Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {ROAD_TYPES.map(r => (
                      <button key={r} type="button" onClick={() => setForm(p => ({ ...p, road_type: r }))} style={{
                        padding: '0.6rem 0.4rem', borderRadius: 'var(--r-sm)',
                        border: `1px solid ${form.road_type === r ? 'rgba(0,212,255,0.4)' : 'var(--border-light)'}`,
                        background: form.road_type === r ? 'rgba(0,212,255,0.08)' : 'transparent',
                        color: form.road_type === r ? 'var(--brand)' : 'var(--text-secondary)',
                        fontSize: '0.75rem', fontWeight: form.road_type === r ? 600 : 400,
                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all var(--transition)',
                      }}>
                        {getRoadEmoji(r)}<br />{r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font)', marginBottom: '0.85rem', color: 'var(--text-secondary)' }}>
                  🕐 Timing
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Time of Day</label>
                    <select name="time_of_day" className="form-control" value={form.time_of_day} onChange={handleChange}>
                      {TIME_OF_DAY.map(t => <option key={t} value={t}>{getTimeEmoji(t)} {t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <select name="day_of_week" className="form-control" value={form.day_of_week} onChange={handleChange}>
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {error && <div className="alert alert-error"><span>⚠</span>{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading
                    ? <><span className="spinner" /><span>Matching driver…</span></>
                    : <><Zap size={16} /><span>Find My Driver</span></>
                  }
                </button>
                {result && (
                  <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Result + Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {result && (() => {
              const entries = Object.entries(result);
              const hasData = entries.length > 0;
              // Try to detect a "no driver" signal from the model output
              const rawText = JSON.stringify(result).toLowerCase();
              const noDriver =
                !hasData ||
                rawText.includes('no driver') ||
                rawText.includes('not available') ||
                rawText.includes('unavailable') ||
                rawText.includes('no captain') ||
                rawText.includes('0 driver');

              return (
                <div className="result-card" style={{
                  borderColor: noDriver ? 'var(--warning-border)' : 'var(--success-border)',
                  background: noDriver ? 'var(--warning-light)' : 'var(--success-light)',
                }}>
                  {/* Header — driven entirely by model output */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
                      background: noDriver ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Car size={22} color={noDriver ? 'var(--warning)' : 'var(--success)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.07em', color: noDriver ? 'var(--warning)' : 'var(--success)',
                        marginBottom: 3,
                      }}>
                        Model Response
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                        {hasData
                          ? /* Use the first string value from the response as the headline */
                            String(Object.values(result)[0])
                          : 'No response data returned'}
                      </div>
                    </div>
                    <span className={`badge ${noDriver ? 'badge-warning' : 'badge-online'}`} style={{ flexShrink: 0 }}>
                      {noDriver ? '⚠ No match' : <><span className="pulse-dot" /> Matched</>}
                    </span>
                  </div>

                  {/* All model output fields */}
                  {hasData && (
                    <div style={{
                      background: '#fff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--r-md)',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                    }}>
                      <div style={{
                        padding: '8px 14px',
                        borderBottom: '1px solid var(--border-light)',
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.07em', color: 'var(--text-muted)',
                      }}>
                        Full Model Output
                      </div>
                      {entries.map(([key, val], i) => (
                        <div key={key} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '9px 14px',
                          borderBottom: i < entries.length - 1 ? '1px solid var(--border-light)' : 'none',
                          gap: '1rem',
                        }}>
                          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 500 }}>
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Route summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{form.rider_area}</div>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{form.end_area}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {!result && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', borderStyle: 'dashed' }}>
                <Car size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontFamily: 'var(--font)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No match yet</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Fill in the journey form to get matched with a driver</div>
              </div>
            )}

            {/* Map */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Journey Map</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {form.rider_area && form.end_area
                    ? `${form.rider_area} → ${form.end_area}`
                    : 'Select pickup and destination to preview'}
                </p>
              </div>
              <DelhiMap
                height={360}
                currentArea={form.rider_area}
                destinationArea={form.end_area}
                flyTo={form.rider_area || form.end_area}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', display: 'inline-block' }} /> Pickup
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} /> Destination
                </span>
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
const getTimeEmoji = t => ({ Night: '🌙', 'Morning Peak': '🌅', Afternoon: '☀️', 'Evening Peak': '🌆' }[t] || '');
