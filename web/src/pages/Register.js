import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import api from '../utils/api';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const ROLES = [
  { value: 'donor',     label: 'Blood Donor',          icon: '🩸', desc: 'Donate blood, save lives' },
  { value: 'recipient', label: 'Recipient',             icon: '🏥', desc: 'Request blood for patients' },
  { value: 'hospital',  label: 'Hospital / Blood Bank', icon: '🏨', desc: 'Manage blood inventory' },
  { value: 'ngo',       label: 'NGO / Organization',    icon: '🤝', desc: 'Coordinate blood drives' }
];

// Age is NOT needed for hospital or ngo
const NEEDS_AGE = ['donor', 'recipient'];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: '', age: '',
    bloodType: 'O+', weight: '', priorityAlertOptIn: false,
    hospitalName: '', licenseNumber: '', address: ''
  });
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showAge = form.role !== '' && NEEDS_AGE.includes(form.role);

  const startResendTimer = () => {
    setResendTimer(30); // 30 seconds resend cooldown
    const interval = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!form.email) { setOtpError('Enter your email first'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await api.post('/auth/send-otp', { email: form.email });
      setStep(2);
      startResendTimer();
      if (res.data.otp) {
        setOtp(res.data.otp);
        setOtpError('Email not configured — OTP auto-filled: ' + res.data.otp);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP');
    }
    setOtpLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp });
      setStep(3);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (!result.error) navigate('/');
  };

  return (
    <div style={S.page}>
      <div style={S.bg}><div style={S.orb1} /><div style={S.orb2} /></div>
      <div style={S.container}>
        <div style={S.header}>
          <Link to="/login" style={S.backBtn}>← Back to login</Link>
          <div style={S.logo}>🩸 <span style={S.logoText}>Hemora</span></div>
        </div>

        <div style={S.card}>
          {/* Step indicator */}
          <div style={S.steps}>
            {[['1','Account'],['2','Verify'],['3','Profile']].map(([s, label], i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ ...S.stepDot, ...(step > i+1 ? S.stepDone : step === i+1 ? S.stepActive : {}) }}>
                  {step > i+1 ? '✓' : s}
                </div>
                <span style={{ fontSize: 12, color: step >= i+1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>{label}</span>
                {i < 2 && <div style={{ width: 28, height: 1, background: step > i+1 ? '#ff2d55' : 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>

          {error && <div style={S.errorBox}>⚠️ {error}</div>}

          {/* ── Step 1: Account ── */}
          {step === 1 && (
            <div>
              <h2 style={S.title}>Create your account</h2>
              <p style={S.sub}>Join thousands saving lives every day</p>

              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />

              <label>Email Address</label>
              <div style={S.emailRow}>
                <input placeholder="john@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  style={{ marginBottom: 0, flex: 1 }} required />
                <button type="button" style={S.sendOtpBtn} onClick={handleSendOTP}
                  disabled={otpLoading || !form.email}>
                  {otpLoading ? '...' : 'Send OTP'}
                </button>
              </div>
              {otpError && <div style={S.otpError}>{otpError}</div>}

              <label style={{ marginTop: 12 }}>Phone Number</label>
              <input placeholder="+1 234 567 8900" value={form.phone} onChange={e => set('phone', e.target.value)} required />

              {!['hospital','ngo'].includes(form.role) && (
                <>
                  <label>Age</label>
                  <input type="number" placeholder="25" min="1" max="120" value={form.age} onChange={e => set('age', e.target.value)} required />
                </>
              )}

              <label>Password</label>
              <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required />

              <label style={{ marginBottom: 12 }}>Select Your Role</label>
              <div style={S.roleGrid}>
                {ROLES.map(r => (
                  <div key={r.value}
                    style={{ ...S.roleCard, ...(form.role === r.value ? S.roleCardActive : {}) }}
                    onClick={() => set('role', r.value)}>
                    <span style={S.roleIcon}>{r.icon}</span>
                    <span style={S.roleLabel}>{r.label}</span>
                    <span style={S.roleDesc}>{r.desc}</span>
                    {form.role === r.value && <div style={S.roleCheck}>✓</div>}
                  </div>
                ))}
              </div>

              <button style={S.primaryBtn} onClick={handleSendOTP}
                disabled={!form.role || !form.name || !form.email || otpLoading}>
                {otpLoading ? 'Sending OTP...' : 'Continue & Verify Email →'}
              </button>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
                <h2 style={S.title}>Check your email</h2>
                <p style={S.sub}>We sent a 6-digit code to <strong style={{ color: 'white' }}>{form.email}</strong></p>
              </div>

              {otpError && <div style={{ ...S.errorBox, marginBottom: 16 }}>{otpError}</div>}

              <label>Verification Code</label>
              <input
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ fontSize: 28, fontWeight: 800, letterSpacing: 12, textAlign: 'center' }}
                maxLength={6}
                autoFocus
              />

              <button style={S.primaryBtn} onClick={handleVerifyOTP}
                disabled={otpLoading || otp.length !== 6}>
                {otpLoading ? 'Verifying...' : 'Verify Email →'}
              </button>

              <div style={S.resendRow}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Didn't receive it?</span>
                {resendTimer > 0
                  ? <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Resend in {resendTimer}s</span>
                  : <button style={S.resendBtn} onClick={handleSendOTP} disabled={otpLoading}>Resend OTP</button>
                }
              </div>
              <button style={S.backStepBtn} onClick={() => setStep(1)}>← Change email</button>
            </div>
          )}

          {/* ── Step 3: Profile ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div style={S.verifiedBadge}>✅ Email verified — {form.email}</div>
              <h2 style={S.title}>Complete your profile</h2>
              <p style={S.sub}>A few more details to get started</p>

              {form.role === 'donor' && (
                <>
                  <label>Blood Type</label>
                  <div style={S.btGrid}>
                    {BLOOD_TYPES.map(bt => (
                      <div key={bt}
                        style={{ ...S.btCard, ...(form.bloodType === bt ? S.btCardActive : {}) }}
                        onClick={() => set('bloodType', bt)}>{bt}</div>
                    ))}
                  </div>
                  <label>Weight (kg)</label>
                  <input type="number" placeholder="70" value={form.weight} onChange={e => set('weight', e.target.value)} required />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textTransform: 'none', letterSpacing: 0, marginBottom: 16 }}>
                    <input type="checkbox" style={{ width: 'auto', marginBottom: 0, accentColor: '#ff2d55' }}
                      checked={form.priorityAlertOptIn} onChange={e => set('priorityAlertOptIn', e.target.checked)} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Opt-in for priority emergency alerts</span>
                  </label>
                </>
              )}

              {form.role === 'hospital' && (
                <>
                  <label>Hospital / Blood Bank Name</label>
                  <input placeholder="City General Hospital" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} required />
                  <label>License Number</label>
                  <input placeholder="LIC-12345" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} required />
                  <label>Address</label>
                  <input placeholder="123 Main St" value={form.address} onChange={e => set('address', e.target.value)} />
                </>
              )}

              {(form.role === 'recipient' || form.role === 'ngo') && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <span style={{ fontSize: 48 }}>{ROLES.find(r => r.value === form.role)?.icon}</span>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 }}>
                    Your account will be created as a <strong style={{ color: 'white' }}>{ROLES.find(r => r.value === form.role)?.label}</strong>.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" style={S.ghostBtn} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" style={{ ...S.primaryBtn, flex: 2, marginTop: 0 }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account 🩸'}
                </button>
              </div>
            </form>
          )}

          <p style={S.footer}>Already have an account? <Link to="/login" style={{ color: '#ff2d55' }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, zIndex: 0 },
  orb1: { position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)' },
  orb2: { position: 'absolute', bottom: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.1) 0%, transparent 70%)' },
  container: { position: 'relative', zIndex: 1, width: '100%', maxWidth: 520 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 },
  logoText: { fontWeight: 800, color: 'white' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px', backdropFilter: 'blur(40px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' },
  steps: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flexShrink: 0 },
  stepActive: { background: '#ff2d55', border: '1px solid #ff2d55', color: 'white', boxShadow: '0 0 12px rgba(255,45,85,0.4)' },
  stepDone: { background: 'rgba(48,209,88,0.2)', border: '1px solid rgba(48,209,88,0.4)', color: '#30d158' },
  errorBox: { background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#ff6b6b' },
  title: { fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 6 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  emailRow: { display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' },
  sendOtpBtn: { padding: '12px 14px', background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: 10, color: '#ff2d55', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Inter, sans-serif' },
  otpError: { fontSize: 12, color: '#ff9f0a', marginBottom: 10, marginTop: 4 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  roleCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', transition: 'all 0.2s' },
  roleCardActive: { background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.4)', boxShadow: '0 0 16px rgba(255,45,85,0.1)' },
  roleIcon: { fontSize: 22 },
  roleLabel: { fontSize: 13, fontWeight: 700, color: 'white' },
  roleDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  roleCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#ff2d55', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  primaryBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #ff2d55, #ff6b6b)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 20px rgba(255,45,85,0.35)', fontFamily: 'Inter, sans-serif', transition: 'opacity 0.2s' },
  ghostBtn: { flex: 1, padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  resendRow: { display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', margin: '14px 0 8px' },
  resendBtn: { background: 'none', border: 'none', color: '#ff2d55', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif' },
  backStepBtn: { display: 'block', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, textAlign: 'center', marginTop: 4, fontFamily: 'Inter, sans-serif' },
  verifiedBadge: { background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#30d158', textAlign: 'center' },
  btGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 },
  btCard: { padding: '10px 0', textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' },
  btCardActive: { background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.5)', color: '#ff2d55' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }
};
