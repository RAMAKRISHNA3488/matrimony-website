import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { validators } from '../../services/authService';
import { DEMO_MODE } from '../../config/appConfig';
import {
  Lock,
  Phone,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import '../../styles/pages.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { requestOtp, resetPassword, isAuthenticated } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  // If already logged in, go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Step state: 1 = Mobile, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Field states
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCopiedDevCode, setIsCopiedDevCode] = useState(false);

  const inputRefs = useRef([]);

  // Validation & UI states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Timer & cooldown
  const [timer, setTimer] = useState(60);
  const [devCode, setDevCode] = useState('');
  const [resendCount, setResendCount] = useState(0);

  // Countdown effect
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Mobile input handler
  const handleMobileChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digits);
    setGlobalError('');
    if (touched.mobile) {
      if (!digits) {
        setErrors((prev) => ({ ...prev, mobile: t('validation.mobileRequired') }));
      } else if (!validators.isValidIndianMobile(digits)) {
        setErrors((prev) => ({ ...prev, mobile: t('validation.mobileInvalid') }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.mobile;
          return next;
        });
      }
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setGlobalError('');
    setTouched((prev) => ({ ...prev, mobile: true }));

    if (!mobileNumber || !validators.isValidIndianMobile(mobileNumber)) {
      setErrors({ mobile: t('validation.mobileInvalid') });
      return;
    }

    setIsSubmitting(true);
    const res = await requestOtp(mobileNumber, 'forgot-password');
    setIsSubmitting(false);

    if (res.success) {
      const code = res.demoCode || '123456';
      setDevCode(code);
      if (DEMO_MODE) {
        setOtpCode(code);
        setDigits(code.split(''));
      } else {
        setOtpCode('');
        setDigits(['', '', '', '', '', '']);
      }
      setTimer(res.cooldownSeconds || 60);
      setResendCount((c) => c + 1);
      setStep(2);
      showToast(`OTP sent to +91 ${mobileNumber}`, 'success');
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } else {
      setGlobalError(res.message || 'Unable to send OTP. Please verify your mobile number.');
    }
  };

  // Digit input handlers
  const handleDigitChange = (index, value) => {
    const numericChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = numericChar;
    setDigits(newDigits);
    setOtpCode(newDigits.join(''));
    setErrors({});

    if (numericChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setOtpCode(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        setOtpCode(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleVerifyOtp(e);
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    setOtpCode(newDigits.join(''));
    setErrors({});

    const lastIdx = Math.min(pasted.length - 1, 5);
    if (lastIdx >= 0) inputRefs.current[lastIdx]?.focus();
  };

  const handleQuickFillDevCode = () => {
    if (!devCode) return;
    const codeDigits = devCode.replace(/\D/g, '').slice(0, 6).split('');
    setDigits(codeDigits);
    setOtpCode(codeDigits.join(''));
    setErrors({});
    setIsCopiedDevCode(true);
    setTimeout(() => setIsCopiedDevCode(false), 2000);
    inputRefs.current[5]?.focus();
  };

  // Step 2: Verify OTP and proceed to Password setup
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setGlobalError('');

    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrors({ otp: t('otp.enterOtp') });
      const firstEmpty = digits.findIndex((d) => !d);
      if (firstEmpty !== -1) inputRefs.current[firstEmpty]?.focus();
      return;
    }

    setOtpCode(fullCode);
    // Move to step 3 (Password creation)
    setStep(3);
  };

  // Step 3: Final Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setGlobalError('');

    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = t('validation.passwordRequired');
    } else if (!validators.isStrongPassword(newPassword)) {
      newErrors.newPassword = t('validation.passwordStrong');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ newPassword: true, confirmPassword: true });
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(mobileNumber, otpCode, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setStep(4); // Success step
      showToast(t('forgotPassword.successTitle'), 'success');
    } else {
      setGlobalError(res.message || 'Failed to reset password. Please verify the OTP code.');
    }
  };

  const passwordStrength = validators.getPasswordStrength(newPassword);

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-box">
        {/* Brand Logo */}
        <div className="auth-brand-logo-wrap">
          <Link to="/" className="auth-brand-logo-link" aria-label="TeluguBandham Home">
            <img
              src="/assets/branding/TeluguBandham_Logo_Primary.png"
              alt="TeluguBandham"
              className="auth-brand-logo-img"
              width="210"
              height="57"
              loading="eager"
              decoding="async"
            />
          </Link>
        </div>

        {/* ================= STEP 4: SUCCESS VIEW ================= */}
        {step === 4 ? (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="success-icon-wrap" style={{ margin: '1rem auto' }}>
              <div className="success-circle">
                <CheckCircle2 size={40} color="#059669" />
              </div>
            </div>

            <div className="auth-header-block">
              <h1 className="auth-main-title">{t('forgotPassword.successTitle')}</h1>
              <p className="auth-sub-title">
                {t('forgotPassword.successDesc')}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg w-full auth-submit-btn"
              onClick={() => navigate('/login')}
            >
              <span>{t('forgotPassword.backToLogin')} <ArrowRight size={16} /></span>
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="auth-header-block">
              <span className="auth-eyebrow">TELUGUBANDHAM ACCOUNT SECURITY</span>
              <h1 className="auth-main-title">{t('forgotPassword.title')}</h1>
              <p className="auth-sub-title">{t('forgotPassword.subtitle')}</p>
            </div>

            {/* Error Banner */}
            {globalError && (
              <div className="auth-alert-error" role="alert">
                <AlertCircle size={16} className="alert-icon" />
                <span>{globalError}</span>
              </div>
            )}

            {/* ================= STEP 1: MOBILE NUMBER ================= */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="auth-form-layout" noValidate>
                <div className="form-group-item">
                  <label htmlFor="fp-mobile" className="form-field-label">
                    {t('auth.mobileNumber')} <span className="req-star">*</span>
                  </label>
                  <div className="input-with-prefix-wrap">
                    <span className="input-country-code" aria-hidden="true">+91</span>
                    <input
                      id="fp-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      onBlur={() => setTouched((p) => ({ ...p, mobile: true }))}
                      placeholder={t('auth.mobilePlaceholder')}
                      className={`form-input-control ${errors.mobile && touched.mobile ? 'input-error' : ''}`}
                      autoComplete="tel-national"
                      disabled={isSubmitting}
                      autoFocus
                    />
                    {mobileNumber.length === 10 && validators.isValidIndianMobile(mobileNumber) && (
                      <CheckCircle2 size={18} className="input-valid-icon" />
                    )}
                  </div>
                  {errors.mobile && touched.mobile && (
                    <span className="field-error-msg" role="alert">{errors.mobile}</span>
                  )}
                  <span className="field-hint-text">{t('auth.mobileHint')}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full auth-submit-btn"
                  disabled={isSubmitting || mobileNumber.length !== 10}
                >
                  {isSubmitting ? (
                    <span className="btn-loading-content">
                      <span className="btn-spinner" aria-hidden="true"></span>
                      <span>{t('forgotPassword.sendingOtp')}</span>
                    </span>
                  ) : (
                    <span>{t('forgotPassword.sendOtpButton')} <ArrowRight size={16} /></span>
                  )}
                </button>

                <div className="auth-footer-prompt">
                  <Link to="/login" className="auth-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={15} /> {t('register.backBtn')} to {t('auth.memberLogin')}
                  </Link>
                </div>
              </form>
            )}

            {/* ================= STEP 2: OTP ENTRY ================= */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="auth-form-layout animate-fade-in" noValidate>
                <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
                  <div className="otp-icon-wrap" style={{ margin: '0 auto 0.5rem' }}>
                    <KeyRound size={26} color="#7A1635" />
                  </div>
                  <p className="auth-sub-title" style={{ fontSize: '0.875rem' }}>
                    {t('forgotPassword.step2Desc')} <strong>+91 {mobileNumber}</strong>
                  </p>
                </div>

                {/* Dev Code Notice */}
                {DEMO_MODE && devCode && (
                  <div
                    className="tb-otp-dev-pill"
                    onClick={handleQuickFillDevCode}
                    title="Click to automatically fill code"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickFillDevCode()}
                    style={{ margin: '0 auto 1rem' }}
                  >
                    <span>{t('otp.devCodeNotice') || 'Development Mode Code:'}</span>
                    <span className="tb-otp-dev-code-bold">{devCode}</span>
                    <span className="tb-otp-dev-pill-action">
                      {isCopiedDevCode ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopiedDevCode ? 'Filled!' : 'Quick Fill'}</span>
                    </span>
                  </div>
                )}

                {/* 6-Box Segmented Inputs */}
                <div className="tb-otp-inputs-wrapper">
                  <label className="tb-otp-input-label">
                    <span>{t('otp.enterOtp') || 'Enter 6-Digit OTP'}</span>
                    <span style={{ color: '#DC2626' }}>*</span>
                  </label>

                  <div className="tb-otp-digits-grid" onPaste={handleDigitPaste}>
                    {digits.map((digit, idx) => (
                      <input
                        key={`fp-otp-box-${idx}`}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className={`tb-otp-digit-cell ${digit ? 'is-filled' : ''} ${errors.otp ? 'is-error' : ''}`}
                        autoComplete="one-time-code"
                        aria-label={`Digit ${idx + 1}`}
                      />
                    ))}
                  </div>
                  {errors.otp && <span className="field-error-msg" style={{ textAlign: 'center', marginTop: '4px' }}>{errors.otp}</span>}
                </div>

                <div className="otp-timer-row">
                  {timer > 0 ? (
                    <span className="otp-timer-text">
                      {t('forgotPassword.resendCooldown')} {timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="resend-otp-btn"
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                    >
                      {t('forgotPassword.resendOtp')}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full auth-submit-btn"
                  disabled={digits.some((d) => !d)}
                >
                  <span>{t('register.continueBtn')} <ArrowRight size={16} /></span>
                </button>

                <div className="auth-footer-prompt" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    className="resend-otp-btn"
                    onClick={() => setStep(1)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    ← {t('forgotPassword.changeMobile')}
                  </button>
                  <Link to="/login" className="auth-footer-link" style={{ fontSize: '0.8rem' }}>
                    {t('register.cancelBtn')}
                  </Link>
                </div>
              </form>
            )}

            {/* ================= STEP 3: CREATE NEW PASSWORD ================= */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="auth-form-layout animate-fade-in" noValidate>
                {/* New Password */}
                <div className="form-group-item">
                  <label htmlFor="fp-new-pass" className="form-field-label">
                    {t('forgotPassword.newPassword')} <span className="req-star">*</span>
                  </label>
                  <div className="input-with-toggle-wrap">
                    <input
                      id="fp-new-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((p) => {
                          const n = { ...p };
                          delete n.newPassword;
                          return n;
                        });
                      }}
                      onBlur={() => setTouched((p) => ({ ...p, newPassword: true }))}
                      placeholder={t('forgotPassword.newPasswordPlaceholder')}
                      className={`form-input-control ${errors.newPassword && touched.newPassword ? 'input-error' : ''}`}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && touched.newPassword && (
                    <span className="field-error-msg">{errors.newPassword}</span>
                  )}

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="password-strength-container" style={{ marginTop: '0.5rem' }}>
                      <div className="strength-bar-track">
                        <div
                          className="strength-bar-fill"
                          style={{
                            width: `${passwordStrength.percent}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        Strength: {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  <span className="field-hint-text">{t('register.passwordHint')}</span>
                </div>

                {/* Confirm Password */}
                <div className="form-group-item">
                  <label htmlFor="fp-confirm-pass" className="form-field-label">
                    {t('forgotPassword.confirmNewPassword')} <span className="req-star">*</span>
                  </label>
                  <div className="input-with-toggle-wrap">
                    <input
                      id="fp-confirm-pass"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((p) => {
                          const n = { ...p };
                          delete n.confirmPassword;
                          return n;
                        });
                      }}
                      onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                      placeholder={t('forgotPassword.confirmNewPasswordPlaceholder')}
                      className={`form-input-control ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <span className="field-error-msg">{errors.confirmPassword}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading-content">
                      <span className="btn-spinner" aria-hidden="true"></span>
                      <span>{t('forgotPassword.resetting')}</span>
                    </span>
                  ) : (
                    <span>{t('forgotPassword.resetButton')} <ArrowRight size={16} /></span>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
