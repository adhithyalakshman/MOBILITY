import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data: tokenData } = await login(form.username, form.password);
      // Save token + basic user info (role will be auto-detected by AuthContext)
      const userData = {
        email: form.username,
        name: form.username.split('@')[0],
        role: null, // AuthContext will detect this via /driver/ and /rider/ probes
      };
      saveAuth(tokenData, userData);
      navigate('/'); // RootRedirect will handle role-based routing
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">

      {/* Left branding panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, color: '#fff' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 42, height: 42,
              background: 'rgba(37,99,235,0.25)',
              border: '1px solid rgba(37,99,235,0.4)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>MoveIQ</div>
              <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.9)', fontWeight: 400, marginTop: 1 }}>Mobility Intelligence Platform</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 14, color: '#fff' }}>
            Intelligent mobility<br />for Delhi NCR
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.85)', lineHeight: 1.7, marginBottom: 36 }}>
            AI-powered driver positioning and real-time ride matching across 25 zones.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '⚡', text: 'ML-powered traffic demand prediction' },
              { icon: '📍', text: 'Smart driver hotspot recommendations' },
              { icon: '🚗', text: 'Optimal driver-rider matching' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(203,213,225,0.9)', fontWeight: 400 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Sign in</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" name="username" className="form-control"
                placeholder="you@example.com"
                value={form.username} onChange={handleChange} autoComplete="email" />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} name="password" className="form-control"
                  placeholder="Enter your password"
                  value={form.password} onChange={handleChange}
                  style={{ paddingRight: 40 }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', padding: 2,
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : <><span>Sign in</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 24 }}>
            Your role (driver or rider) is automatically detected after sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
