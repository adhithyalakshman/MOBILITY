import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordRequestOtp, resetPassword } from '../../api/auth';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = email, 1 = reset
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const sendOtp = async (e) => {
    e.preventDefault(); setError('');
    if (!email) { setError('Enter your email.'); return; }
    setLoading(true);
    try {
      await forgotPasswordRequestOtp(email);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const doReset = async (e) => {
    e.preventDefault(); setError('');
    const { otp, new_password, confirm_password } = form;
    if (!otp || !new_password || !confirm_password) { setError('All fields required.'); return; }
    if (new_password !== confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await resetPassword({ email, otp, new_password, confirm_password });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Check your OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2rem', transition: 'color var(--transition)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={15} /> Back to Login
        </Link>

        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '2rem' }}>
            {step === 0 ? "Enter your email and we'll send you a reset OTP." : `Enter the OTP sent to ${email}`}
          </p>

          {error && <div className="alert alert-error"><span>⚠</span>{error}</div>}
          {success && <div className="alert alert-success"><span>✓</span>{success}</div>}

          {step === 0 ? (
            <form onSubmit={sendOtp}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? <span className="spinner" /> : <><span>Send Reset OTP</span><ArrowRight size={17} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={doReset}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input type="text" name="otp" className="form-control" placeholder="______" value={form.otp}
                  onChange={e => setForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  style={{ letterSpacing: '0.4em', textAlign: 'center', fontFamily: 'var(--font)', fontSize: '1.2rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} name="new_password" className="form-control" placeholder="New password" value={form.new_password} onChange={handleChange} style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" name="confirm_password" className="form-control" placeholder="Repeat new password" value={form.confirm_password} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? <span className="spinner" /> : <><span>Reset Password</span><ArrowRight size={17} /></>}
              </button>
              <button type="button" style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', width: '100%' }} onClick={() => setStep(0)}>
                ← Try a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
