import { useState, useEffect } from 'react';
import { setDriverLocation } from '../../api/status';
import { AREAS, AREA_COORDINATES } from '../../utils/constants';
import DelhiMap from '../../components/common/DelhiMap';
import AppLayout from '../../components/common/AppLayout';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverLocationPage() {
  const [selectedArea, setSelectedArea] = useState('');
  const [currentArea, setCurrentArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('driver_area');
    if (saved) { setCurrentArea(saved); setSelectedArea(saved); }
  }, []);

  const filteredAreas = AREAS.filter(a => a.toLowerCase().includes(search.toLowerCase()));

  const handleUpdate = async () => {
    if (!selectedArea) { toast.error('Please select an area first.'); return; }
    setLoading(true);
    try {
      await setDriverLocation(selectedArea);
      setCurrentArea(selectedArea);
      localStorage.setItem('driver_area', selectedArea);
      toast.success(`Location updated to ${selectedArea}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update location.');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">My Location</h1>
        <p className="page-subtitle">Set your current area to appear online and receive ride requests</p>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Current status */}
            {currentArea ? (
              <div className="card" style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.12)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={20} color="var(--success)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font)', fontWeight: 600 }}>Active Location</div>
                    <div style={{ fontFamily: 'var(--font)', fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>{currentArea}</div>
                  </div>
                  <span className="badge badge-online" style={{ marginLeft: 'auto' }}>
                    <span className="pulse-dot" /> Online
                  </span>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>You are <strong>offline</strong>. Select an area and update your location to go online and receive rides.</div>
              </div>
            )}

            {/* Search */}
            <div className="card" style={{ padding: '1.2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Search Area</label>
                <input
                  type="text" className="form-control" placeholder="Search Delhi areas…"
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>

              <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>
                Select Your Current Area — {filteredAreas.length} areas
              </label>

              <div style={{
                maxHeight: 340, overflowY: 'auto',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem',
                paddingRight: '0.25rem',
              }}>
                {filteredAreas.map(area => (
                  <button key={area} type="button" onClick={() => setSelectedArea(area)} style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--r-sm)',
                    border: `1px solid ${selectedArea === area ? 'rgba(249,115,22,0.45)' : 'var(--border-light)'}`,
                    background: selectedArea === area ? 'rgba(249,115,22,0.1)' : 'transparent',
                    color: selectedArea === area ? 'var(--driver)' : 'var(--text-secondary)',
                    fontSize: '0.78rem', fontWeight: selectedArea === area ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font)',
                    transition: 'all var(--transition)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    {selectedArea === area && <MapPin size={11} />}
                    {area}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-driver btn-full"
                style={{ marginTop: '1.25rem' }}
                onClick={handleUpdate}
                disabled={loading || !selectedArea || selectedArea === currentArea}
              >
                {loading ? <span className="spinner" /> : <><MapPin size={16} /><span>{currentArea ? 'Update Location' : 'Go Online'}</span></>}
              </button>

              {selectedArea && selectedArea === currentArea && (
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                  You are already in {currentArea}
                </p>
              )}
            </div>
          </div>

          {/* Right: map */}
          <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Area Preview</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {selectedArea ? `Showing: ${selectedArea}` : 'Select an area to preview on map'}
              </p>
            </div>
            <DelhiMap height={420} currentArea={currentArea} suggestedArea={selectedArea !== currentArea ? selectedArea : null} flyTo={selectedArea || currentArea} />

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
              {currentArea && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', display: 'inline-block' }} /> Current location
                </span>
              )}
              {selectedArea && selectedArea !== currentArea && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Selected (preview)
                </span>
              )}
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
