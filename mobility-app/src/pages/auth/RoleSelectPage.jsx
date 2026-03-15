import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, User } from 'lucide-react';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { user, saveAuth } = useAuth();
  const token = localStorage.getItem('access_token');

  const selectRole = (role) => {
    const updatedUser = { ...user, role };
    saveAuth({ access_token: token, token_type: 'bearer' }, updatedUser);
    navigate(`/${role}/dashboard`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          How are you using <span style={{ color: 'var(--accent-primary)' }}>MoveIQ</span>?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Select your role to continue
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <button
            onClick={() => selectRole('driver')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              transition: 'all var(--transition)',
              textAlign: 'center',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)';
              e.currentTarget.style.background = 'rgba(249,115,22,0.05)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 64, height: 64,
              background: 'rgba(249,115,22,0.12)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Car size={28} color="var(--accent-driver)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
              I'm a Driver
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Get AI hotspot suggestions & manage availability
            </div>
          </button>

          <button
            onClick={() => selectRole('rider')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              transition: 'all var(--transition)',
              textAlign: 'center',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
              e.currentTarget.style.background = 'rgba(0,212,255,0.05)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 64, height: 64,
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <User size={28} color="var(--accent-primary)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
              I'm a Rider
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Request a ride and get matched with the best driver
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
