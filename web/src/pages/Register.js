import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const ROLES = [
  { value: 'donor', label: 'Blood Donor', icon: '🩸', desc: 'Donate blood, save lives' },
  { value: 'recipient', label: 'Recipient', icon: '🏥', desc: 'Request blood for patients' },
  { value: 'hospital', label: 'Hospital / Blood Bank', icon: '🏨', desc: 'Manage blood inventory' },
  { value: 'ngo', label: 'NGO / Organization', icon: '🤝', desc: 'Coordinate blood drives' }
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: '',
    bloodType: 'O+', age: '', weight: '', priorityAlertOptIn: false,
    hospitalName: '', licenseNumber: '', address: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (!result.error) navigate('/');
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />
      </div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Link to="/login" style={styles.backBtn}>← Back to login</Link>
          <div style={styles.logo}>🩸 <span style={styles.logoText}>BloodConnect</span></div>
        </div>

        <div style={styles.card}>
          {/* Step indicator */}
          <div style={styles.steps}>
            {[1,2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ ...styles.stepDot, ...(step >= s ? styles.stepDotActive : {}) }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 12, color: step >= s ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                  {s === 1 ? 'Account' : 'Profile'}
                </span>
                {s < 2 && <div style={{ width: 40, height: 1, background: step > s ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {step === 1 && (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
              <h2 style={styles.title}>Create your account</h2>
              <p style={styles.sub}>Join thousands saving lives every day</p>

              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              <label>Phone Number</label>
              <input placeholder="+1 234 567 8900" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              <label>Password</label>
              <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required />

              <label style={{ marginBottom: 12 }}>Select Your Role</label>
              <div style={styles.roleGrid}>
                {ROLES.map(r => (
                  <div key={r.value}
                    style={{ ...styles.roleCard, ...(form.role === r.value ? styles.roleCardActive : {}) }}
                    onClick={() => set('role', r.value)}>
                    <span style={styles.roleIcon}>{r.icon}</span>
                    <span style={styles.roleLabel}>{r.label}</span>
                    <span style={styles.roleDesc}>{r.desc}</span>
                    {form.role === r.value && <div style={styles.roleCheck}>✓</div>}
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}
                onClick={() => form.role && setStep(2)} disabled={!form.role || !form.name || !form.email}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ animation: 'slideUp 0.3s ease' }}>
              <h2 style={styles.title}>Complete your profile</h2>
              <p style={styles.sub}>A few more details to get you started</p>

              {form.role === 'donor' && (
                <>
                  <label>Blood Type</label>
                  <div style={styles.btGrid}>
                    {BLOOD_TYPES.map(bt => (
                      <div key={bt}
                        style={{ ...styles.btCard, ...(form.bloodType === bt ? styles.btCardActive : {}) }}
                        onClick={() => set('bloodType', bt)}>
                        {bt}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label>Age</label>
                      <input type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Weight (kg)</label>
                      <input type="number" placeholder="70" value={form.weight} onChange={e => set('weight', e.target.value)} required />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16, textTransform: 'none', letterSpacing: 0 }}>
                    <input type="checkbox" style={{ width: 'auto', marginBottom: 0, accentColor: 'var(--primary)' }}
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
                  <input placeholder="123 Main St, City" value={form.address} onChange={e => set('address', e.target.value)} />
                </>
              )}

              {(form.role === 'recipient' || form.role === 'ngo') && (
                <div style={styles.roleConfirm}>
                  <span style={{ fontSize: 48 }}>{ROLES.find(r => r.value === form.role)?.icon}</span>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 }}>
                    Your account will be created as a <strong style={{ color: 'white' }}>{ROLES.find(r => r.value === form.role)?.label}</strong>.
                    You can complete your profile after signing in.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account 🩸'}
                </button>
              </div>
            </form>
          )}

          <p style={styles.footer}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, zIndex: 0 },
  orb1: { position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)' },
  orb2: { position: 'absolute', bottom: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.1) 0%, transparent 70%)' },
  container: { position: 'relative', zIndex: 1, width: '100%', maxWidth: 520 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { fontSize: 13, color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 },
  logoText: { fontWeight: 800, color: 'white' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, backdropFilter: 'blur(40px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' },
  steps: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flexShrink: 0 },
  stepDotActive: { background: 'var(--primary)', border: '1px solid var(--primary)', color: 'white', boxShadow: '0 0 12px rgba(255,45,85,0.4)' },
  errorBox: { background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#ff6b6b' },
  title: { fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 6 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  roleCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', transition: 'all 0.2s' },
  roleCardActive: { background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.4)', boxShadow: '0 0 20px rgba(255,45,85,0.1)' },
  roleIcon: { fontSize: 24 },
  roleLabel: { fontSize: 13, fontWeight: 700, color: 'white' },
  roleDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  roleCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  btGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 },
  btCard: { padding: '10px 0', textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' },
  btCardActive: { background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.5)', color: 'var(--primary)', boxShadow: '0 0 12px rgba(255,45,85,0.2)' },
  roleConfirm: { textAlign: 'center', padding: '32px 0' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.3)' }
};
