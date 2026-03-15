import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestRegistrationOtp, verifyRegistrationOtp, register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { USER_ROLES } from '../../utils/constants';

const STEPS = ['Verify Email', 'Enter OTP', 'Create Account'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ name: '', phone_number: '', set_password: '', confirm_password: '', role: 'rider' });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const stepOneSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    try { await requestRegistrationOtp(email); setStep(1); }
    catch (err) { setError(err.response?.data?.detail || 'Failed to send OTP. Check your email.'); }
    finally { setLoading(false); }
  };

  const stepTwoSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit OTP sent to your email.'); return; }
    setLoading(true);
    try { await verifyRegistrationOtp(email, otp); setStep(2); }
    catch (err) { setError(err.response?.data?.detail || 'Invalid or expired OTP.'); }
    finally { setLoading(false); }
  };

  const stepThreeSubmit = async (e) => {
    e.preventDefault(); setError('');
    const { name, phone_number, set_password, confirm_password, role } = form;
    if (!name || !phone_number || !set_password || !confirm_password) { setError('All fields are required.'); return; }
    if (set_password !== confirm_password) { setError('Passwords do not match.'); return; }
    if (set_password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data: tokenData } = await register({ name, email, phone_number, set_password, confirm_password, role });
      // Save with role already known from form
      saveAuth(tokenData, { name, email, phone_number, role });
      navigate('/');
    } catch (err) { setError(err.response?.data?.detail || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      {/* Left panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>MoveIQ</span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.25 }}>Create your account</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(148,163,184,0.85)', lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of drivers and riders using MoveIQ across Delhi NCR.
          </p>

          {/* Step progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600,
                    background: done ? 'rgba(5,150,105,0.2)' : active ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${done ? 'rgba(5,150,105,0.4)' : active ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: done ? '#6ee7b7' : active ? '#93c5fd' : 'rgba(148,163,184,0.6)',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? '#fff' : done ? '#6ee7b7' : 'rgba(148,163,184,0.7)' }}>
                      {label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? 'var(--brand)' : 'var(--border-light)', transition: 'background 0.3s ease' }} />
            ))}
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 4 }}>Step {step + 1} of {STEPS.length}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{STEPS[step]}</h2>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 0 && (
            <form onSubmit={stepOneSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                <span className="form-hint">We'll send a 6-digit OTP to verify your email.</span>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending OTP…</> : <><span>Send OTP</span><ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <form onSubmit={stepTwoSubmit}>
              <div className="form-group">
                <label className="form-label">6-digit OTP</label>
                <input type="text" className="form-control"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6} placeholder="000000"
                  style={{ letterSpacing: '0.35em', textAlign: 'center', fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 500 }}
                />
                <span className="form-hint">
                  Sent to <strong>{email}</strong>.{' '}
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 500 }} onClick={() => { setStep(0); setOtp(''); }}>
                    Change email
                  </button>
                </span>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? <><span className="spinner" /> Verifying…</> : <><span>Verify OTP</span><ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <form onSubmit={stepThreeSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input type="text" name="name" className="form-control" placeholder="Arjun Sharma" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone number</label>
                  <input type="tel" name="phone_number" className="form-control" placeholder="+91 98765 43210" value={form.phone_number} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">I am registering as</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {USER_ROLES.map(r => (
                    <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))} style={{
                      padding: '10px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                      border: `1.5px solid ${form.role === r ? (r === 'driver' ? 'var(--driver)' : 'var(--brand)') : 'var(--border-medium)'}`,
                      background: form.role === r ? (r === 'driver' ? 'var(--driver-light)' : 'var(--brand-light)') : 'var(--bg-surface)',
                      color: form.role === r ? (r === 'driver' ? 'var(--driver)' : 'var(--brand)') : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: form.role === r ? 600 : 400,
                      fontFamily: 'var(--font)',
                      transition: 'all var(--transition)', textTransform: 'capitalize',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      {r === 'driver' ? '🚗' : '👤'} {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} name="set_password" className="form-control" placeholder="At least 6 characters" value={form.set_password} onChange={handleChange} style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input type="password" name="confirm_password" className="form-control" placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? <><span className="spinner" /> Creating account…</> : <><span>Create account</span><ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
