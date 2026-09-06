import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import { otpService } from '../../services/otpService';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminLogin() {
  const { adminLogin, adminLogout, isAdmin } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  // Reset active admin session when visiting the login screen so credentials are required
  useEffect(() => {
    adminLogout();
  }, [adminLogout]);

  // Authentication step: 'credentials' | 'otp'
  const [step, setStep] = useState('credentials');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [demoCode, setDemoCode] = useState('123456');
  const otpInputsRef = useRef([]);

  // Enforce Light theme strictly for the Admin Login portal
  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', 'light');
  }, []);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer;
    if (step === 'otp' && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timerSeconds]);

  // Focus first OTP cell on entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Step 1: Submit Email & Credentials to dispatch Email OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your security password.');
      return;
    }

    setIsSubmitting(true);

    // Validate credentials against admin accounts
    const isMaster = cleanEmail === 'admin@telugubandham.com' && password === 'admin123';
    const teamMember = mockDb.getAdminTeam().find((t) => (t.email || '').toLowerCase() === cleanEmail);
    const isValidTeam = teamMember && password === 'admin123';

    if (!isMaster && !isValidTeam) {
      setIsSubmitting(false);
      setErrorMsg("Invalid Administrator credentials. Use admin@telugubandham.com / admin123");
      return;
    }

    // Request 6-digit Email OTP
    const otpRes = await otpService.requestEmailOtp(cleanEmail, 'admin-login');
    setIsSubmitting(false);

    if (otpRes.success) {
      setDemoCode(otpRes.demoCode || '123456');
      setOtpDigits(['', '', '', '', '', '']);
      setTimerSeconds(60);
      setCanResend(false);
      setStep('otp');
      showToast(`Security code dispatched to ${cleanEmail}! ✉️`, 'info');
    } else {
      setErrorMsg(otpRes.message);
    }
  };

  // Step 2: Verify OTP entered from email
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('').trim();
    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code received on your email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const verifyRes = await otpService.verifyEmailOtp(email, enteredCode, 'admin-login');

    if (!verifyRes.success) {
      setIsSubmitting(false);
      setErrorMsg(verifyRes.message || 'Invalid verification code. Please check your email.');
      return;
    }

    // OTP Verified! Log admin in
    const loginRes = await adminLogin(email, password, { otpVerified: true });
    setIsSubmitting(false);

    if (loginRes.success) {
      mockDb.addAuditLog({
        adminName: loginRes.admin?.name || "Administrator",
        adminEmail: email,
        action: "Completed Email 2FA Verification",
        target: "Operations Console",
        targetType: "Security Authentication",
        details: `Administrator identity verified via 6-digit Email OTP.`
      });

      showToast("Security authentication successful. Welcome, Administrator.", "success");
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(loginRes.message);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setErrorMsg('');
    const res = await otpService.requestEmailOtp(email, 'admin-login');
    setIsSubmitting(false);
    if (res.success) {
      setDemoCode(res.demoCode || '123456');
      setTimerSeconds(60);
      setCanResend(false);
      showToast(`New security code sent to ${email}`, 'info');
    } else {
      setErrorMsg(res.message);
    }
  };

  // OTP input cell events
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setErrorMsg('');

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || '';
    }
    setOtpDigits(nextDigits);
    const nextFocusIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[nextFocusIndex]?.focus();
  };

  const handleFillDemo = () => {
    setEmail('admin@telugubandham.com');
    setPassword('admin123');
    setErrorMsg('');
  };

  const handleAutoFillOtp = async () => {
    const code = demoCode || '123456';
    setOtpDigits(code.split(''));
    setErrorMsg('');

    // Instant seamless verification
    setIsSubmitting(true);
    const verifyRes = await otpService.verifyEmailOtp(email, code, 'admin-login');
    if (!verifyRes.success) {
      setIsSubmitting(false);
      setErrorMsg(verifyRes.message || 'Verification failed.');
      return;
    }

    const loginRes = await adminLogin(email, password, { otpVerified: true });
    setIsSubmitting(false);

    if (loginRes.success) {
      mockDb.addAuditLog({
        adminName: loginRes.admin?.name || "Administrator",
        adminEmail: email,
        action: "Completed Email 2FA Verification",
        target: "Operations Console",
        targetType: "Security Authentication",
        details: "Administrator identity verified via 6-digit Email OTP."
      });

      showToast("Security authentication successful. Welcome, Administrator.", "success");
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(loginRes.message);
    }
  };

  return (
    <div
      data-admin-theme="light"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--admin-bg)',
        color: 'var(--admin-text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
    >

      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--admin-border)',
          padding: '2.5rem',
          boxShadow: 'var(--admin-shadow-lg)'
        }}
      >
        {/* ================= STEP 1: CREDENTIALS ================= */}
        {step === 'credentials' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <img
                src="/assets/branding/TeluguBandham_Logo_Light.svg"
                alt="TeluguBandham"
                className="admin-login-logo-light"
                style={{ height: '52px', width: 'auto', margin: '0 auto 1rem', objectFit: 'contain' }}
              />
              <img
                src="/assets/branding/TeluguBandham_Logo_Dark.svg"
                alt="TeluguBandham"
                className="admin-login-logo-dark"
                style={{ height: '52px', width: 'auto', margin: '0 auto 1rem', objectFit: 'contain' }}
              />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span className="admin-badge-pill">OPERATIONS CONSOLE</span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
                Administrator Sign In
              </h1>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                Restricted operational access and trust security console
              </p>
            </div>

            {/* Demo Credentials Helper */}
            <div
              onClick={handleFillDemo}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--admin-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--admin-border)',
                marginBottom: '1.5rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
              title="Click to fill demo credentials"
            >
              <div>
                <div style={{ color: 'var(--admin-primary)', fontWeight: 700 }}>Demo Admin Credentials:</div>
                <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.75rem' }}>admin@telugubandham.com / admin123</div>
              </div>
              <span className="admin-badge gold" style={{ fontSize: '0.65rem' }}>
                Auto-Fill
              </span>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--admin-danger-bg)',
                  border: '1px solid var(--admin-danger-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--admin-danger)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Administrator Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    className="admin-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@telugubandham.com"
                    style={{
                      width: '100%',
                      paddingLeft: '2.25rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Security Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="admin-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      paddingLeft: '2.25rem',
                      paddingRight: '2.4rem'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '-0.25rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />
                <span>Two-Factor Authentication: A security OTP will be dispatched to your email</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={isSubmitting}
                style={{ marginTop: '0.5rem', justifyContent: 'center', gap: '0.45rem' }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={17} className="admin-spin" />
                    <span>Dispatching Security OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={17} />
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ================= STEP 2: EMAIL OTP VERIFICATION ================= */}
        {step === 'otp' && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--admin-primary-tint)',
                border: '1px solid var(--admin-primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--admin-primary)'
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <span className="admin-badge-pill">TWO-FACTOR AUTHENTICATION</span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: '0 0 0.35rem' }}>
              Verify Email Security Code
            </h2>

            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
              A 6-digit one-time verification code has been dispatched to:
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                backgroundColor: 'var(--admin-surface-subtle)',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--admin-primary)',
                border: '1px solid var(--admin-border)',
                marginBottom: '1rem'
              }}
            >
              <Mail size={13} />
              <span>{email}</span>
            </div>

            {/* Demo OTP Pill */}
            <div
              onClick={handleAutoFillOtp}
              style={{
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--admin-gold-tint)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--admin-gold-border)',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
              title="Click to auto-fill OTP code"
            >
              <div style={{ color: 'var(--admin-gold-hover)', fontWeight: 700 }}>
                Demo Code: <span style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '0.9rem' }}>{demoCode}</span>
              </div>
              <span className="admin-badge gold" style={{ fontSize: '0.65rem' }}>
                Auto-Fill Code
              </span>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--admin-danger-bg)',
                  border: '1px solid var(--admin-danger-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--admin-danger)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  textAlign: 'left'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              {/* 6-digit OTP Input Grid */}
              <div className="admin-otp-grid" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`admin-otp-cell ${digit ? 'is-filled' : ''}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Timer / Resend Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--admin-text-muted)',
                  margin: '0.5rem 0 1.25rem'
                }}
              >
                {timerSeconds > 0 ? (
                  <span>
                    Resend code in <strong style={{ color: 'var(--admin-primary)' }}>{String(timerSeconds).padStart(2, '0')}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={13} /> Resend Security Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={isSubmitting || otpDigits.join('').length !== 6}
                style={{ justifyContent: 'center', gap: '0.45rem' }}
              >
                <CheckCircle2 size={17} />
                {isSubmitting ? "Verifying Security Code..." : "Verify OTP & Access Portal"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setErrorMsg('');
                }}
                style={{
                  marginTop: '0.85rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={13} /> Re-enter Email or Password
              </button>
            </form>
          </div>
        )}

        {/* Back to website home page link */}
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            paddingTop: '1.15rem',
            borderTop: '1px solid var(--admin-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Link
            to="/"
            className="admin-back-home-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--admin-text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to website home page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
