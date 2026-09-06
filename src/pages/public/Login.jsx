import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { validators } from '../../services/authService';
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import '../../styles/pages.css';

export default function Login() {
  const { t } = useTranslation();
  const { login, isAuthenticated, switchPersona } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const from = (location.state?.from?.pathname && location.state.from.pathname !== '/login' && location.state.from.pathname !== '/register')
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/dashboard';

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle mobile number input: numbers only, max 10 digits
  const handleMobileChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
    setAuthError('');

    if (touched.mobile) {
      validateField('mobile', digitsOnly);
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setAuthError('');

    if (touched.password) {
      validateField('password', val);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'mobile') validateField('mobile', mobileNumber);
    if (field === 'password') validateField('password', password);
  };

  const validateField = (field, value) => {
    let fieldErrors = { ...errors };

    if (field === 'mobile') {
      if (!value) {
        fieldErrors.mobile = t('validation.mobileRequired');
      } else if (!validators.isValidIndianMobile(value)) {
        fieldErrors.mobile = t('validation.mobileInvalid');
      } else {
        delete fieldErrors.mobile;
      }
    }

    if (field === 'password') {
      if (!value) {
        fieldErrors.password = t('validation.passwordRequired');
      } else {
        delete fieldErrors.password;
      }
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const validateAll = () => {
    const newErrors = {};

    if (!mobileNumber) {
      newErrors.mobile = t('validation.mobileRequired');
    } else if (!validators.isValidIndianMobile(mobileNumber)) {
      newErrors.mobile = t('validation.mobileInvalid');
    }

    if (!password) {
      newErrors.password = t('validation.passwordRequired');
    }

    setErrors(newErrors);
    setTouched({ mobile: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    const res = await login(mobileNumber, password, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`${t('auth.welcomeBack')}, ${res.user?.name || 'Member'}!`, 'success');
      navigate(from, { replace: true });
    } else {
      setAuthError(res.message || t('auth.loginGenericError'));
    }
  };

  const handleDemoLogin = (type) => {
    const switched = switchPersona(type);
    showToast(`${t('auth.welcomeBack')}, ${switched?.name || 'Member'}!`, 'success');
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page-wrapper login-page-wrapper">
      <div className="login-split-container">
        {/* Left Side: Brand Heritage Showcase - Floating directly on background */}
        <div className="login-hero-showcase animate-fade-in">
          <h1 className="login-hero-title">
            {t('auth.loginHeroTitle')}
          </h1>

          <div className="login-hero-divider">
            <span className="divider-line" />
            <span className="divider-knot">✦ ❖ ✦</span>
            <span className="divider-line" />
          </div>

          <p className="login-hero-subtitle">
            {t('auth.loginHeroSubtitle')}
          </p>
        </div>

        {/* Right Side: Clean White Login Card */}
        <div className="login-card-box animate-fade-in">
          {/* Mobile-only logo header if left side is hidden on small screens */}
          <div className="login-mobile-logo">
            <Link to="/" aria-label="TeluguBandham Home">
              <img
                src="/assets/branding/TeluguBandham_Logo_Primary.png"
                alt="TeluguBandham"
                width="200"
                height="54"
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Header Block */}
          <div className="login-card-header">
            <h2 className="login-card-title">{t('auth.welcomeBackTitle')}</h2>
            <div className="login-card-flourish">
              <span className="flourish-line" />
              <span className="flourish-symbol">❦</span>
              <span className="flourish-line" />
            </div>
            <p className="login-card-subtitle">{t('auth.welcomeBackSubtitle')}</p>
          </div>

          {/* Global Server/Auth Error Alert */}
          {authError && (
            <div className="auth-alert-error" role="alert">
              <AlertCircle size={16} className="alert-icon" />
              <span>{authError}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="login-form-inner" noValidate>
            {/* Mobile Number Field */}
            <div className="login-form-group">
              <label htmlFor="login-mobile" className="login-field-label">
                {t('auth.mobileNumber')}
              </label>
              <div className={`login-input-prefix-wrap ${errors.mobile && touched.mobile ? 'has-error' : ''}`}>
                <span className="login-country-prefix">+91</span>
                <input
                  id="login-mobile"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  onBlur={() => handleBlur('mobile')}
                  placeholder={t('auth.mobilePlaceholder')}
                  className="login-input-field"
                  autoComplete="tel-national"
                  aria-invalid={!!errors.mobile && touched.mobile}
                  disabled={isSubmitting}
                />
              </div>
              {errors.mobile && touched.mobile && (
                <span className="login-field-error" role="alert">
                  {errors.mobile}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-field-label">
                  {t('auth.password')}
                </label>
                <Link to="/forgot-password" className="login-forgot-link">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className={`login-input-toggle-wrap ${errors.password && touched.password ? 'has-error' : ''}`}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="login-input-field"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password && touched.password}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <span className="login-field-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="login-remember-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox"
                />
                <span>{t('auth.rememberMe')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>{t('auth.loggingIn')}</span>
              ) : (
                <>
                  <span>{t('auth.loginButton')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="login-or-divider">
            <span className="or-line" />
            <span className="or-text">{t('auth.or')}</span>
            <span className="or-line" />
          </div>

          {/* Quick Login (Demo) */}
          <div className="login-demo-section">
            <span className="demo-section-title">{t('auth.quickLoginDemo')}</span>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="demo-persona-btn"
                onClick={() => handleDemoLogin('male')}
              >
                {t('auth.groomDemo')}
              </button>
              <button
                type="button"
                className="demo-persona-btn"
                onClick={() => handleDemoLogin('female')}
              >
                {t('auth.brideDemo')}
              </button>
            </div>
          </div>

          {/* Bottom Prompt */}
          <div className="login-footer-row">
            <span>{t('auth.newToBrand')} </span>
            <Link to="/register" state={location.state} className="login-register-link">
              {t('auth.createYourProfile')}
            </Link>
          </div>

          {/* Admin Login Option */}
          <div className="login-admin-row">
            <Link
              to="/admin/login"
              className="login-admin-link"
              aria-label="Admin Login Portal"
            >
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
