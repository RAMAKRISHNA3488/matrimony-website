import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { RegistrationProvider, useRegistration } from '../../context/RegistrationContext';
import { validators } from '../../services/authService';
import {
  PROFILE_FOR_OPTIONS,
  TELUGU_COMMUNITIES,
  MARITAL_STATUS_OPTIONS,
  HEIGHT_OPTIONS,
  EDUCATION_OPTIONS,
  PROFESSION_OPTIONS,
  INCOME_OPTIONS,
  TELUGU_RAASIS,
  TELUGU_NAKSHATRAMS
} from '../../services/registrationService';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  Check,
  Edit3,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import '../../styles/pages.css';
import OtpModal from '../../components/common/OtpModal';
import DobDatePicker from '../../components/common/DobDatePicker';

function RegisterForm() {
  const { t, i18n } = useTranslation();
  const isTelugu = i18n.language === 'te';
  const { register, requestOtp, isAuthenticated } = useAuth();

  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { step: routeStep } = useParams();

  const {
    formData,
    updateField,
    currentStep,
    setCurrentStep,
    goToStep,
    nextStep,
    prevStep,
    errors,
    setErrors,
    touched,
    markTouched,
    validateStep,
    isSubmitting,
    setIsSubmitting,
    registeredUser,
    setRegisteredUser
  } = useRegistration();


  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Modal states
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [devCode, setDevCode] = useState('');

  // Sync route param with step on initial mount only
  useEffect(() => {
    if (routeStep === 'basic') setCurrentStep(1);
    else if (routeStep === 'profile') setCurrentStep(2);
    else if (routeStep === 'family') setCurrentStep(3);
    else if (routeStep === 'security') setCurrentStep(4);
    else if (routeStep === 'review') setCurrentStep(5);
    else if (routeStep === 'success') setCurrentStep(6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If already authenticated and not on success screen, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && currentStep !== 6 && !registeredUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentStep, registeredUser, navigate]);

  // OTP Timer countdown
  useEffect(() => {
    let interval = null;
    if (isOtpModalOpen && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpModalOpen, otpTimer]);

  // Handle Field Blur
  const handleBlur = (field) => {
    markTouched(field);
    validateField(field);
  };

  // Inline single field validation
  const validateField = (field) => {
    const newErrors = { ...errors };

    if (field === 'name') {
      if (!formData.name.trim()) {
        newErrors.name = t('validation.nameRequired');
      } else if (!validators.isValidFullName(formData.name)) {
        newErrors.name = t('validation.nameInvalid');
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'dob') {
      if (!formData.dob) {
        newErrors.dob = t('register.dobRequired') || t('validation.dobRequired') || 'Date of birth is required.';
      } else if (!validators.isAtLeast18(formData.dob)) {
        newErrors.dob = t('register.ageInvalid') || t('validation.ageUnder18') || 'You must be at least 18 years old to create a matrimonial profile.';
      } else {
        delete newErrors.dob;
      }
    }

    if (field === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = t('validation.emailRequired');
      } else if (!validators.isValidEmail(formData.email)) {
        newErrors.email = t('validation.emailInvalid');
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'phone') {
      if (!formData.phone.trim()) {
        newErrors.phone = t('validation.mobileRequired');
      } else if (!validators.isValidIndianMobile(formData.phone)) {
        newErrors.phone = t('validation.mobileInvalid');
      } else {
        delete newErrors.phone;
      }
    }

    if (field === 'community') {
      if (!formData.community) {
        newErrors.community = t('validation.communityRequired') || 'Please select your community.';
      } else {
        delete newErrors.community;
      }
    }

    if (field === 'education') {
      if (!formData.education) {
        newErrors.education = t('validation.educationRequired') || 'Please select education.';
      } else {
        delete newErrors.education;
      }
    }

    if (field === 'profession') {
      if (!formData.profession) {
        newErrors.profession = t('validation.professionRequired') || 'Please select profession.';
      } else {
        delete newErrors.profession;
      }
    }

    if (field === 'city') {
      if (!formData.city || !formData.city.trim()) {
        newErrors.city = t('validation.cityRequired') || 'City is required.';
      } else {
        delete newErrors.city;
      }
    }

    if (field === 'password') {
      if (!formData.password) {
        newErrors.password = t('validation.passwordRequired');
      } else if (!validators.isStrongPassword(formData.password)) {
        newErrors.password = t('validation.passwordStrong');
      } else {
        delete newErrors.password;
      }
    }

    if (field === 'confirmPassword') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('validation.confirmPasswordRequired');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('validation.passwordMismatch');
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  // Open OTP verification modal
  const handleOpenOtpModal = async () => {
    if (!formData.phone || !validators.isValidIndianMobile(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: t('validation.mobileInvalid') }));
      markTouched('phone');
      return;
    }

    setIsSendingOtp(true);
    const res = await requestOtp(formData.phone, 'registration');
    setIsSendingOtp(false);

    if (res.success) {
      setDevCode(res.demoCode || '123456');
      setIsOtpModalOpen(true);
      setOtpTimer(res.cooldownSeconds || 60);
      showToast(`OTP sent to +91 ${formData.phone}`, 'success');
    } else {
      setGlobalError(res.message);
      showToast(res.message, 'warning');
    }
  };

  // Handle Next button click
  const handleNext = () => {
    setGlobalError('');
    const isValid = validateStep(currentStep);

    if (!isValid) {
      if (currentStep === 1) {
        markTouched('name');
        markTouched('profileFor');
        markTouched('gender');
        markTouched('dob');
        markTouched('email');
        markTouched('phone');
      } else if (currentStep === 2) {
        markTouched('community');
        markTouched('education');
        markTouched('profession');
        markTouched('city');
      } else if (currentStep === 4) {
        markTouched('password');
        markTouched('confirmPassword');
        markTouched('agreeTerms');
        markTouched('confirmAccurate');
      }
      showToast('Please complete the required details before proceeding', 'warning');
      return;
    }

    nextStep();
  };

  // Interactive Step Indicator Click Handler
  const handleStepClick = (targetStep) => {
    if (targetStep === currentStep) return;

    // Moving backwards is always allowed
    if (targetStep < currentStep) {
      goToStep(targetStep);
      return;
    }

    // Moving forward: validate current and intervening steps
    let canProceed = true;
    for (let s = currentStep; s < targetStep; s++) {
      if (!validateStep(s)) {
        canProceed = false;
        if (s === 1) {
          markTouched('name');
          markTouched('profileFor');
          markTouched('gender');
          markTouched('dob');
          markTouched('email');
          markTouched('phone');
        } else if (s === 2) {
          markTouched('community');
          markTouched('education');
          markTouched('profession');
          markTouched('city');
        } else if (s === 4) {
          markTouched('password');
          markTouched('confirmPassword');
          markTouched('agreeTerms');
          markTouched('confirmAccurate');
        }
        showToast(`Please complete the required details on Step ${s} before proceeding`, 'warning');
        break;
      }
    }

    if (canProceed) {
      goToStep(targetStep);
    }
  };


  // Final Form Submission from Review Step
  const handleFinalSubmit = async () => {
    setGlobalError('');

    // Re-verify all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setGlobalError('Please complete all required fields in earlier steps.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(formData);
    setIsSubmitting(false);

    if (res.success) {
      setRegisteredUser(res.user);
      setCurrentStep(6); // Success Step
      showToast(t('register.successTitle') + ' 🎉', 'success');
    } else {
      setGlobalError(res.message || 'Registration failed. Please review your information.');
    }
  };

  const passwordStrength = validators.getPasswordStrength(formData.password);

  // ================= STEP 6: SUCCESS VIEW =================
  if (currentStep === 6 && registeredUser) {
    const memberName = registeredUser.name || formData.name || 'Member';
    const memberId = registeredUser.id || 'TB-1002';
    const memberCommunity = registeredUser.community || formData.community || 'Telugu Community';
    const memberPhone = registeredUser.phone || (formData.phone ? `+91 ${formData.phone}` : '+91 9876543210');
    const memberGender = registeredUser.gender || formData.gender || 'profile';

    return (
      <div className="auth-page-wrapper register-success-page">
        <div className="auth-card-box auth-success-card animate-scale-up">
          {/* Brand Logo Header */}
          <div className="auth-brand-logo-wrap">
            <Link to="/" className="auth-brand-logo-link" aria-label="TeluguBandham Home">
              <img
                src="/assets/branding/TeluguBandham_Logo_Primary.png"
                alt="TeluguBandham"
                className="auth-brand-logo-img"
                width="190"
                height="51"
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Celebratory Hero Icon & Badge */}
          <div className="success-celebration-hero">
            <div className="success-badge-glow-ring">
              <div className="success-badge-inner-circle">
                <CheckCircle2 size={36} className="success-badge-icon" />
              </div>
            </div>
            <div className="success-pill-tag">
              <span>{t('register.successBadge')}</span>
            </div>
          </div>

          {/* Header Typography & Auspicious Knot */}
          <div className="success-header-block">
            <h1 className="success-main-title">{t('register.successTitle')}</h1>
            <div className="success-card-flourish">
              <span className="flourish-line" />
              <span className="flourish-symbol">❦ ✦ ❦</span>
              <span className="flourish-line" />
            </div>
            <p className="success-sub-title">
              {t('register.successSubtitle')}
            </p>
          </div>

          {/* Member Matrimony ID & Profile Pass Card */}
          <div className="success-id-pass-card">
            {/* Top Pass Header */}
            <div className="id-pass-header">
              <div className="id-pass-meta">
                <span className="id-pass-label">{t('register.matrimonyIdLabel')}</span>
                <span className="id-pass-number">{memberId}</span>
              </div>
              <button
                type="button"
                className="id-copy-btn"
                onClick={() => {
                  if (memberId && navigator.clipboard) {
                    navigator.clipboard.writeText(memberId);
                    showToast('Matrimony ID copied to clipboard!', 'success');
                  }
                }}
                title="Copy Matrimony ID"
                aria-label="Copy Matrimony ID"
              >
                <Copy size={13} />
                <span>Copy ID</span>
              </button>
            </div>

            {/* Member Identity Details */}
            <div className="id-pass-body">
              <div className="id-pass-user-row">
                <div className={`id-pass-avatar ${memberGender === 'female' ? 'avatar-female' : 'avatar-male'}`}>
                  {memberName.charAt(0).toUpperCase()}
                </div>
                <div className="id-pass-user-info">
                  <div className="id-pass-name">{memberName}</div>
                  <div className="id-pass-community">
                    <Users size={13} />
                    <span>{memberCommunity}</span>
                  </div>
                </div>
              </div>

              <div className="id-pass-divider" />

              <div className="id-pass-details-grid">
                <div className="id-detail-item">
                  <span className="id-detail-label">{t('register.mobileVerifiedLabel')}</span>
                  <span className="id-detail-val verified">
                    <ShieldCheck size={14} />
                    <span>{memberPhone}</span>
                  </span>
                </div>
                <div className="id-detail-item">
                  <span className="id-detail-label">Profile Status</span>
                  <span className="id-detail-val active-status">
                    <span className="status-indicator-dot" />
                    <span>Active and Verified</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Membership Highlight */}
            <div className="id-pass-footer">
              <span>Free Membership active · Ready for matches and interests</span>
            </div>
          </div>

          {/* Action Button Group */}
          <div className="success-action-group">
            {location.state?.from ? (
              <button
                type="button"
                className="success-btn-primary"
                onClick={() => {
                  const target = `${location.state.from.pathname}${location.state.from.search || ''}`;
                  navigate(target, { replace: true });
                }}
              >
                <span>Continue to Membership</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="success-btn-primary"
                onClick={() => navigate('/dashboard', { replace: true })}
              >
                <span>{t('register.goToDashboard')}</span>
                <ArrowRight size={18} />
              </button>
            )}
            <button
              type="button"
              className="success-btn-secondary"
              onClick={() => navigate(location.state?.from ? '/dashboard' : '/profile/edit', { replace: true })}
            >
              <span>{location.state?.from ? t('register.goToDashboard') : t('register.completeProfile')}</span>
            </button>
          </div>

          {/* Trust Assurance Footer */}
          <div className="success-trust-footer">
            <ShieldCheck size={14} className="trust-shield-icon" />
            <span>100% Privacy Protected · Authentic Telugu Matrimony</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-box auth-reg-box">
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

        <div className="auth-header-block">
          <span className="auth-eyebrow">{t('register.eyebrow')}</span>
          <h1 className="auth-main-title">{t('register.mainTitle')}</h1>
          <p className="auth-sub-title">{t('register.subTitle')}</p>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="step-progress-wrapper" aria-label="Registration Steps">
          <div className="step-track">
            {[1, 2, 3, 4].map((stepNum) => {
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              const stepName =
                stepNum === 1 ? t('register.step1') :
                stepNum === 2 ? t('register.step2') :
                stepNum === 3 ? t('register.step3') :
                t('register.step4');

              return (
                <button
                  key={`step-${stepNum}`}
                  type="button"
                  className={`step-item-btn ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleStepClick(stepNum)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${stepNum}: ${stepName}`}
                  title={`Navigate to Step ${stepNum}: ${stepName}`}
                >
                  <div className={`step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                    {isCompleted ? <Check size={14} /> : `0${stepNum}`}
                  </div>
                  <span className={`step-label-text ${isCurrent ? 'active' : ''}`}>
                    {stepName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact single-line representation below 400px to prevent fragmented multi-line text */}
          <div className="mobile-active-step-indicator" aria-live="polite">
            <span className="mobile-step-badge">Step {currentStep} of 4</span>
            <span className="mobile-step-sep" style={{ color: '#C9A24A', fontWeight: 700 }}>—</span>
            <span className="mobile-step-name">
              {currentStep === 1 ? (isTelugu ? 'ప్రాథమిక వివరాలు' : 'Basic Details') :
               currentStep === 2 ? (isTelugu ? 'విద్య & ఉద్యోగం' : 'Education & Career') :
               currentStep === 3 ? (isTelugu ? 'కుటుంబం & జాతకం' : 'Family Details') :
               (isTelugu ? 'భద్రత & పాస్‌వర్డ్' : 'Account Security')}
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={16} className="alert-icon" />
            <span>{globalError}</span>
          </div>
        )}

        {/* ================= STEP 1: BASIC INFORMATION ================= */}
        {currentStep === 1 && (
          <div className="step-pane animate-fade-in">
            <h2 className="step-section-heading">
              <User size={18} className="text-burgundy" /> {t('register.basicHeading')}
            </h2>

            <div className="form-grid-2col">
              {/* Full Name */}
              <div className="form-group-item">
                <label htmlFor="reg-name" className="form-field-label">
                  {t('register.fullName')} <span className="req-star">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder={t('register.fullNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`form-input-control ${errors.name && touched.name ? 'input-error' : ''}`}
                  autoComplete="name"
                  maxLength={60}
                />
                {errors.name && touched.name && <span className="field-error-msg">{errors.name}</span>}
              </div>

              {/* Profile For */}
              <div className="form-group-item">
                <label htmlFor="reg-profile-for" className="form-field-label">
                  {t('register.profileFor')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-profile-for"
                  value={formData.profileFor}
                  onChange={(e) => updateField('profileFor', e.target.value)}
                  className="form-select-control"
                >
                  {PROFILE_FOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isTelugu ? opt.labelTe : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="form-group-item">
                <label htmlFor="reg-gender" className="form-field-label">
                  {t('register.gender')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-gender"
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  onBlur={() => handleBlur('gender')}
                  className={`form-select-control ${errors.gender && touched.gender ? 'input-error' : ''}`}
                  disabled={
                    formData.profileFor === 'Son' ||
                    formData.profileFor === 'Brother' ||
                    formData.profileFor === 'Daughter' ||
                    formData.profileFor === 'Sister'
                  }
                >
                  <option value="">{t('register.selectGender')}</option>
                  <option value="female">{t('register.female')}</option>
                  <option value="male">{t('register.male')}</option>
                </select>
                {errors.gender && touched.gender && <span className="field-error-msg">{errors.gender}</span>}
              </div>

              {/* Date of Birth */}
              <div className="form-group-item">
                <label htmlFor="reg-dob" className="form-field-label">
                  {t('register.dob')} <span className="req-star">*</span>
                </label>
                <DobDatePicker
                  id="reg-dob"
                  name="dob"
                  value={formData.dob}
                  onChange={(val) => updateField('dob', val)}
                  onBlur={() => handleBlur('dob')}
                  error={errors.dob && touched.dob ? errors.dob : ''}
                  placeholder={t('register.dobPlaceholder') || 'YYYY-MM-DD'}
                />
                {errors.dob && touched.dob ? (
                  <span className="field-error-msg">{errors.dob}</span>
                ) : (
                  <span className="field-hint-text">{t('register.dobHint')}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group-item">
                <label htmlFor="reg-email" className="form-field-label">
                  {t('register.email')} <span className="req-star">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`form-input-control ${errors.email && touched.email ? 'input-error' : ''}`}
                  autoComplete="email"
                />
                {errors.email && touched.email && <span className="field-error-msg">{errors.email}</span>}
              </div>

              {/* Mobile Number with OTP Verification */}
              <div className="form-group-item">
                <label htmlFor="reg-phone" className="form-field-label">
                  {t('register.phone')} <span className="req-star">*</span>
                </label>
                <div className="input-with-action-group">
                  <div className="input-with-prefix-wrap flex-1">
                    <span className="input-country-code">+91</span>
                    <input
                      id="reg-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder={t('auth.mobilePlaceholder')}
                      value={formData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        updateField('phone', digits);
                      }}
                      onBlur={() => handleBlur('phone')}
                      className={`form-input-control ${errors.phone && touched.phone ? 'input-error' : ''}`}
                      autoComplete="tel-national"
                    />
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${formData.isMobileVerified ? 'btn-success-tag' : 'btn-secondary'}`}
                    onClick={handleOpenOtpModal}
                    disabled={isSendingOtp || formData.isMobileVerified || formData.phone.length !== 10}
                  >
                    {formData.isMobileVerified ? (
                      <span><Check size={14} /> {t('register.mobileVerified')}</span>
                    ) : isSendingOtp ? (
                      t('register.sendingOtp')
                    ) : (
                      t('register.verifyViaOtp')
                    )}
                  </button>
                </div>
                {errors.phone && touched.phone ? (
                  <span className="field-error-msg">{errors.phone}</span>
                ) : (
                  <span className="field-hint-text">{t('register.phoneHint')}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="step-actions-row step-actions-end">
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {t('register.continueToProfile')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PROFILE DETAILS ================= */}
        {currentStep === 2 && (
          <div className="step-pane animate-fade-in">
            <h2 className="step-section-heading">
              <Briefcase size={18} className="text-burgundy" /> {t('register.profileHeading')}
            </h2>

            <div className="form-grid-2col">
              {/* Telugu Community / Caste */}
              <div className="form-group-item">
                <label htmlFor="reg-community" className="form-field-label">
                  {t('register.community')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-community"
                  value={formData.community}
                  onChange={(e) => updateField('community', e.target.value)}
                  onBlur={() => handleBlur('community')}
                  className={`form-select-control ${errors.community && touched.community ? 'input-error' : ''}`}
                >
                  <option value="">{t('register.selectCommunity')}</option>
                  {TELUGU_COMMUNITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.community && touched.community && (
                  <span className="field-error-msg">{errors.community}</span>
                )}
              </div>

              {/* Sub-Caste */}
              <div className="form-group-item">
                <label htmlFor="reg-subcaste" className="form-field-label">
                  {t('register.subCaste')}
                </label>
                <input
                  id="reg-subcaste"
                  type="text"
                  placeholder="Enter Sub-Caste or Shakha"
                  value={formData.subCaste}
                  onChange={(e) => updateField('subCaste', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Height */}
              <div className="form-group-item">
                <label htmlFor="reg-height" className="form-field-label">
                  {t('register.height')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-height"
                  value={formData.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  className="form-select-control"
                >
                  {HEIGHT_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>

              {/* Marital Status */}
              <div className="form-group-item">
                <label htmlFor="reg-marital-status" className="form-field-label">
                  {t('register.maritalStatus')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-marital-status"
                  value={formData.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  className="form-select-control"
                >
                  {MARITAL_STATUS_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Highest Education */}
              <div className="form-group-item">
                <label htmlFor="reg-education" className="form-field-label">
                  {t('register.education')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-education"
                  value={formData.education}
                  onChange={(e) => updateField('education', e.target.value)}
                  onBlur={() => handleBlur('education')}
                  className={`form-select-control ${errors.education && touched.education ? 'input-error' : ''}`}
                >
                  <option value="">{t('register.selectEducation')}</option>
                  {EDUCATION_OPTIONS.map((edu) => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                </select>
                {errors.education && touched.education && (
                  <span className="field-error-msg">{errors.education}</span>
                )}
              </div>

              {/* Profession */}
              <div className="form-group-item">
                <label htmlFor="reg-profession" className="form-field-label">
                  {t('register.profession')} <span className="req-star">*</span>
                </label>
                <select
                  id="reg-profession"
                  value={formData.profession}
                  onChange={(e) => updateField('profession', e.target.value)}
                  onBlur={() => handleBlur('profession')}
                  className={`form-select-control ${errors.profession && touched.profession ? 'input-error' : ''}`}
                >
                  <option value="">{t('register.selectProfession')}</option>
                  {PROFESSION_OPTIONS.map((prof) => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
                {errors.profession && touched.profession && (
                  <span className="field-error-msg">{errors.profession}</span>
                )}
              </div>

              {/* Company / Work */}
              <div className="form-group-item">
                <label htmlFor="reg-company" className="form-field-label">
                  {t('register.company')}
                </label>
                <input
                  id="reg-company"
                  type="text"
                  placeholder={t('register.companyPlaceholder')}
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Annual Income */}
              <div className="form-group-item">
                <label htmlFor="reg-income" className="form-field-label">
                  {t('register.income')}
                </label>
                <select
                  id="reg-income"
                  value={formData.income}
                  onChange={(e) => updateField('income', e.target.value)}
                  className="form-select-control"
                >
                  {INCOME_OPTIONS.map((inc) => (
                    <option key={inc} value={inc}>{inc}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div className="form-group-item">
                <label htmlFor="reg-country" className="form-field-label">
                  {t('register.country')}
                </label>
                <select
                  id="reg-country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="form-select-control"
                >
                  <option value="India">India</option>
                  <option value="USA">United States (USA)</option>
                  <option value="UK">United Kingdom (UK)</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">United Arab Emirates (UAE)</option>
                  <option value="Other">Other Country</option>
                </select>
              </div>

              {/* City */}
              <div className="form-group-item">
                <label htmlFor="reg-city" className="form-field-label">
                  {t('register.city')} <span className="req-star">*</span>
                </label>
                <input
                  id="reg-city"
                  type="text"
                  placeholder={t('register.cityPlaceholder')}
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  className={`form-input-control ${errors.city && touched.city ? 'input-error' : ''}`}
                />
                {errors.city && touched.city && <span className="field-error-msg">{errors.city}</span>}
              </div>

              {/* About Me */}
              <div className="form-group-item full-width-span">
                <label htmlFor="reg-about-me" className="form-field-label">
                  {t('register.aboutMe')}
                </label>
                <textarea
                  id="reg-about-me"
                  rows={3}
                  placeholder={t('register.aboutMePlaceholder')}
                  value={formData.aboutMe}
                  onChange={(e) => updateField('aboutMe', e.target.value)}
                  className="form-textarea-control"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="step-actions-row">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <ArrowLeft size={16} /> {t('register.backBtn')}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {t('register.continueToFamily')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: FAMILY INFORMATION ================= */}
        {currentStep === 3 && (
          <div className="step-pane animate-fade-in">
            <h2 className="step-section-heading">
              <Users size={18} className="text-burgundy" /> {t('register.familyHeading')}
            </h2>

            <div className="form-grid-2col">
              {/* Father's Occupation */}
              <div className="form-group-item">
                <label htmlFor="reg-father" className="form-field-label">
                  {t('register.fatherOccupation')}
                </label>
                <input
                  id="reg-father"
                  type="text"
                  placeholder="Father's profession or occupation"
                  value={formData.fatherOccupation}
                  onChange={(e) => updateField('fatherOccupation', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Mother's Occupation */}
              <div className="form-group-item">
                <label htmlFor="reg-mother" className="form-field-label">
                  {t('register.motherOccupation')}
                </label>
                <input
                  id="reg-mother"
                  type="text"
                  placeholder="Mother's profession or occupation"
                  value={formData.motherOccupation}
                  onChange={(e) => updateField('motherOccupation', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Siblings */}
              <div className="form-group-item">
                <label htmlFor="reg-siblings" className="form-field-label">
                  {t('register.siblings')}
                </label>
                <input
                  id="reg-siblings"
                  type="text"
                  placeholder="Brothers and sisters details"
                  value={formData.siblings}
                  onChange={(e) => updateField('siblings', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Family Type */}
              <div className="form-group-item">
                <label htmlFor="reg-family-type" className="form-field-label">
                  {t('register.familyType')}
                </label>
                <select
                  id="reg-family-type"
                  value={formData.familyType}
                  onChange={(e) => updateField('familyType', e.target.value)}
                  className="form-select-control"
                >
                  <option value="Nuclear">Nuclear Family</option>
                  <option value="Joint">Joint Family</option>
                </select>
              </div>

              {/* Family Values */}
              <div className="form-group-item">
                <label htmlFor="reg-family-values" className="form-field-label">
                  {t('register.familyValues')}
                </label>
                <select
                  id="reg-family-values"
                  value={formData.familyValues}
                  onChange={(e) => updateField('familyValues', e.target.value)}
                  className="form-select-control"
                >
                  <option value="Traditional">Traditional</option>
                  <option value="Moderate">Moderate / Blend of Modern and Cultural</option>
                  <option value="Liberal">Liberal / Modern</option>
                </select>
              </div>

              {/* Native Place */}
              <div className="form-group-item">
                <label htmlFor="reg-native" className="form-field-label">
                  {t('register.nativePlace')}
                </label>
                <input
                  id="reg-native"
                  type="text"
                  placeholder={t('register.nativePlacePlaceholder')}
                  value={formData.nativePlace}
                  onChange={(e) => updateField('nativePlace', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Gothram */}
              <div className="form-group-item">
                <label htmlFor="reg-gothram" className="form-field-label">
                  {t('register.gothram')}
                </label>
                <input
                  id="reg-gothram"
                  type="text"
                  placeholder="Family Gothram"
                  value={formData.gothram}
                  onChange={(e) => updateField('gothram', e.target.value)}
                  className="form-input-control"
                />
              </div>

              {/* Raasi */}
              <div className="form-group-item">
                <label htmlFor="reg-raasi" className="form-field-label">
                  {t('register.raasi')}
                </label>
                <select
                  id="reg-raasi"
                  value={formData.raasi}
                  onChange={(e) => updateField('raasi', e.target.value)}
                  className="form-select-control"
                >
                  <option value="">{t('register.selectRaasi')}</option>
                  {TELUGU_RAASIS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Nakshatram */}
              <div className="form-group-item">
                <label htmlFor="reg-nakshatram" className="form-field-label">
                  {t('register.nakshatram')}
                </label>
                <select
                  id="reg-nakshatram"
                  value={formData.nakshatram}
                  onChange={(e) => updateField('nakshatram', e.target.value)}
                  className="form-select-control"
                >
                  <option value="">{t('register.selectNakshatram')}</option>
                  {TELUGU_NAKSHATRAMS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* About Family */}
              <div className="form-group-item full-width-span">
                <label htmlFor="reg-about-family" className="form-field-label">
                  {t('register.aboutFamily')}
                </label>
                <textarea
                  id="reg-about-family"
                  rows={2}
                  placeholder={t('register.aboutFamilyPlaceholder')}
                  value={formData.aboutFamily}
                  onChange={(e) => updateField('aboutFamily', e.target.value)}
                  className="form-textarea-control"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="step-actions-row">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <ArrowLeft size={16} /> {t('register.backBtn')}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {t('register.continueToSecurity')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SECURITY & ACCOUNT ================= */}
        {currentStep === 4 && (
          <div className="step-pane animate-fade-in">
            <h2 className="step-section-heading">
              <Lock size={18} className="text-burgundy" /> {t('register.securityHeading')}
            </h2>

            <div className="form-grid-2col">
              {/* Password */}
              <div className="form-group-item">
                <label htmlFor="reg-password" className="form-field-label">
                  {t('register.createPassword')} <span className="req-star">*</span>
                </label>
                <div className="input-with-toggle-wrap">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars with uppercase, number and symbol"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`form-input-control ${errors.password && touched.password ? 'input-error' : ''}`}
                    autoComplete="new-password"
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
                {errors.password && touched.password && (
                  <span className="field-error-msg">{errors.password}</span>
                )}

                {/* Password Strength Meter */}
                {formData.password && (
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
                <label htmlFor="reg-confirm-password" className="form-field-label">
                  {t('register.confirmPassword')} <span className="req-star">*</span>
                </label>
                <div className="input-with-toggle-wrap">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
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

              {/* Terms of Service Checkbox */}
              <div className="form-group-item full-width-span" style={{ marginTop: '0.5rem' }}>
                <label className="checkbox-control-label">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => updateField('agreeTerms', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>
                    {t('register.agreeTermsText')}{' '}
                    <Link to="/terms" className="text-burgundy font-bold" target="_blank">
                      Terms
                    </Link>{' '}
                    &amp;{' '}
                    <Link to="/privacy" className="text-burgundy font-bold" target="_blank">
                      Privacy
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && <span className="field-error-msg">{errors.agreeTerms}</span>}
              </div>

              {/* Accuracy Confirmation Checkbox */}
              <div className="form-group-item full-width-span">
                <label className="checkbox-control-label">
                  <input
                    type="checkbox"
                    checked={formData.confirmAccurate}
                    onChange={(e) => updateField('confirmAccurate', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>{t('register.confirmAccurateText')}</span>
                </label>
                {errors.confirmAccurate && <span className="field-error-msg">{errors.confirmAccurate}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="step-actions-row">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <ArrowLeft size={16} /> {t('register.backBtn')}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {t('register.continueToReview')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW YOUR PROFILE ================= */}
        {currentStep === 5 && (
          <div className="step-pane animate-fade-in">
            <h2 className="step-section-heading">
              <ShieldCheck size={18} className="text-burgundy" /> {t('register.reviewHeading')}
            </h2>

            <p className="auth-sub-title" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              Please review your details before creating your profile. You can click Edit on any section to make changes.
            </p>

            <div className="review-cards-list">
              {/* 1. Basic Information Section */}
              <div className="review-section-card">
                <div className="review-card-header">
                  <h3 className="review-card-title">
                    <User size={16} /> {t('register.basicHeading')}
                  </h3>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(1)}>
                    <Edit3 size={13} /> {t('register.editSection')}
                  </button>
                </div>
                <div className="review-grid-2col">
                  <div><strong>{t('register.fullName')}:</strong> {formData.name}</div>
                  <div><strong>{t('register.profileFor')}:</strong> {formData.profileFor}</div>
                  <div><strong>{t('register.gender')}:</strong> {formData.gender === 'female' ? t('register.female') : t('register.male')}</div>
                  <div><strong>{t('register.dob')}:</strong> {formData.dob} ({validators.calculateAge(formData.dob)} yrs)</div>
                  <div><strong>{t('register.email')}:</strong> {formData.email}</div>
                  <div><strong>{t('register.phone')}:</strong> +91 {formData.phone} <span style={{ color: '#059669', fontWeight: 'bold' }}>✓</span></div>
                </div>
              </div>

              {/* 2. Profile Details Section */}
              <div className="review-section-card">
                <div className="review-card-header">
                  <h3 className="review-card-title">
                    <Briefcase size={16} /> {t('register.profileHeading')}
                  </h3>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(2)}>
                    <Edit3 size={13} /> {t('register.editSection')}
                  </button>
                </div>
                <div className="review-grid-2col">
                  <div><strong>{t('register.community')}:</strong> {formData.community} {formData.subCaste ? `(${formData.subCaste})` : ''}</div>
                  <div><strong>{t('register.height')}:</strong> {formData.height}</div>
                  <div><strong>{t('register.maritalStatus')}:</strong> {formData.maritalStatus}</div>
                  <div><strong>{t('register.education')}:</strong> {formData.education}</div>
                  <div><strong>{t('register.profession')}:</strong> {formData.profession}</div>
                  <div><strong>{t('register.income')}:</strong> {formData.income}</div>
                  <div><strong>{t('register.city')}:</strong> {formData.city}, {formData.country}</div>
                  {formData.company && <div><strong>{t('register.company')}:</strong> {formData.company}</div>}
                </div>
              </div>

              {/* 3. Family & Astrology Section */}
              <div className="review-section-card">
                <div className="review-card-header">
                  <h3 className="review-card-title">
                    <Users size={16} /> {t('register.familyHeading')}
                  </h3>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(3)}>
                    <Edit3 size={13} /> {t('register.editSection')}
                  </button>
                </div>
                <div className="review-grid-2col">
                  <div><strong>{t('register.familyType')}:</strong> {formData.familyType}</div>
                  <div><strong>{t('register.familyValues')}:</strong> {formData.familyValues}</div>
                  {formData.fatherOccupation && <div><strong>{t('register.fatherOccupation')}:</strong> {formData.fatherOccupation}</div>}
                  {formData.motherOccupation && <div><strong>{t('register.motherOccupation')}:</strong> {formData.motherOccupation}</div>}
                  {formData.gothram && <div><strong>{t('register.gothram')}:</strong> {formData.gothram}</div>}
                  {formData.raasi && <div><strong>{t('register.raasi')}:</strong> {formData.raasi}</div>}
                </div>
              </div>

              {/* 4. Account Security Section */}
              <div className="review-section-card">
                <div className="review-card-header">
                  <h3 className="review-card-title">
                    <Lock size={16} /> {t('register.securityHeading')}
                  </h3>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(4)}>
                    <Edit3 size={13} /> {t('register.editSection')}
                  </button>
                </div>
                <div className="review-grid-2col">
                  <div><strong>{t('auth.password')}:</strong> •••••••••••• (Protected)</div>
                  <div><strong>Terms Agreed:</strong> Yes ✓</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="step-actions-row">
              <button type="button" className="btn btn-secondary" onClick={() => goToStep(4)} disabled={isSubmitting}>
                <ArrowLeft size={16} /> {t('register.backBtn')}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg auth-submit-btn"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="btn-loading-content">
                    <span className="btn-spinner" aria-hidden="true"></span>
                    <span>{t('register.creatingProfile')}</span>
                  </span>
                ) : (
                  <span>{t('register.createProfileBtn')} <ArrowRight size={16} /></span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Existing Member Footer */}
        {currentStep !== 6 && (
          <div className="auth-footer-prompt">
            <span>{t('register.alreadyRegisteredPrompt')} </span>
            <Link to="/login" state={location.state} className="auth-footer-link">
              {t('register.loginHere')}
            </Link>
          </div>
        )}
      </div>

      {/* ================= OTP VERIFICATION MODAL ================= */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        phoneNumber={formData.phone}
        purpose="registration"
        devCode={devCode}
        timer={otpTimer}
        onResendOtp={handleOpenOtpModal}
        isSendingOtp={isSendingOtp}
        onVerified={() => {
          updateField('isMobileVerified', true);
          setIsOtpModalOpen(false);
          showToast(t('register.mobileVerified') + ' ✓', 'success');
        }}
      />

    </div>
  );
}

export default function Register() {
  return (
    <RegistrationProvider>
      <RegisterForm />
    </RegistrationProvider>
  );
}
