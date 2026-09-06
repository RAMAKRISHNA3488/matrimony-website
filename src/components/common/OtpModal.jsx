import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { DEMO_MODE } from '../../config/appConfig';
import confetti from 'canvas-confetti';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCw,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import '../../styles/otp-modal.css';

export default function OtpModal({
  isOpen,
  onClose,
  phoneNumber,
  purpose = 'registration',
  onVerified,
  devCode = '123456',
  timer = 60,
  onResendOtp,
  isSendingOtp = false
}) {
  const { t } = useTranslation();
  const { verifyOtp } = useAuth();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isCopiedDevCode, setIsCopiedDevCode] = useState(false);

  const inputRefs = useRef([]);

  const handleSmoothClose = useCallback(() => {
    if (isVerifying || isSuccess) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
  }, [isVerifying, isSuccess, onClose]);

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsSuccess(false);
      setErrorMessage('');
      setIsCopiedDevCode(false);

      if (DEMO_MODE && devCode && devCode.length === 6) {
        setDigits(devCode.split(''));
      } else {
        setDigits(['', '', '', '', '', '']);
      }

      // Auto-focus first input box after animation
      const timerId = setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
          if (DEMO_MODE && devCode && inputRefs.current[5]) {
            inputRefs.current[5].focus();
          }
        }
      }, 120);

      return () => clearTimeout(timerId);
    }
  }, [isOpen, devCode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isVerifying && !isSuccess) {
        handleSmoothClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isVerifying, isSuccess, handleSmoothClose]);

  if (!isOpen && !isClosing) return null;


  // Handle Digit Change
  const handleChange = (index, value) => {
    const numericChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = numericChar;
    setDigits(newDigits);
    setErrorMessage('');

    // If a digit was entered, auto-advance to next box
    if (numericChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace & Navigation keys
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  // Handle Full Paste (e.g. user copies "123456")
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    setErrorMessage('');

    // Focus last filled box
    const lastIndex = Math.min(pastedData.length - 1, 5);
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
  };

  // Quick 1-Click Dev Fill
  const handleQuickFillDevCode = () => {
    if (!devCode) return;
    const codeDigits = devCode.replace(/\D/g, '').slice(0, 6).split('');
    setDigits(codeDigits);
    setErrorMessage('');
    setIsCopiedDevCode(true);
    setTimeout(() => setIsCopiedDevCode(false), 2000);

    inputRefs.current[5]?.focus();
  };

  // Verify OTP submission
  const handleVerify = async () => {
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage(t('otp.enterOtp') || 'Please enter all 6 digits of the verification code.');
      // Focus first empty box
      const firstEmpty = digits.findIndex((d) => !d);
      if (firstEmpty !== -1) {
        inputRefs.current[firstEmpty]?.focus();
      }
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await verifyOtp(phoneNumber, fullCode, purpose);
      setIsVerifying(false);

      if (res.success) {
        setIsSuccess(true);

        // Confetti celebration
        try {
          confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#7A1635', '#C9A24A', '#10B981', '#F59E0B']
          });
        } catch (e) {
          // ignore if canvas not supported
        }

        // Wait 400ms for user feedback then transition smoothly
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => {
            setIsClosing(false);
            if (onVerified) onVerified(res);
          }, 200);
        }, 450);
      } else {
        setErrorMessage(res.message || 'Invalid verification code. Please check and try again.');
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setIsVerifying(false);
      setErrorMessage('Network error during verification. Please try again.');
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div
      className={`tb-otp-backdrop ${isClosing ? 'tb-otp-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tb-otp-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isVerifying && !isSuccess) {
          handleSmoothClose();
        }
      }}
    >
      <div className="tb-otp-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="tb-otp-close-btn"
          onClick={handleSmoothClose}
          disabled={isVerifying || isSuccess}
          aria-label={t('otp.close') || 'Close OTP verification'}
        >
          <X size={17} />
        </button>

        {/* Modal Header */}
        <div className="tb-otp-header">
          <div className={`tb-otp-icon-glow ${isSuccess ? 'is-success' : ''}`}>
            {isSuccess ? (
              <CheckCircle2 size={32} color="#059669" />
            ) : (
              <KeyRound size={28} color="#7A1635" />
            )}
          </div>
          <h2 id="tb-otp-title" className="tb-otp-title">
            {isSuccess ? (t('register.mobileVerified') || 'Mobile Verified!') : (t('otp.modalTitle') || 'Verify Your Mobile Number')}
          </h2>
          <p className="tb-otp-desc">
            {isSuccess ? (
              <span>Your phone number is successfully verified.</span>
            ) : (
              <>
                {t('otp.modalDesc') || 'We sent a 6-digit verification code to'}{' '}
                <span className="tb-otp-phone-highlight">+91 {phoneNumber}</span>.
              </>
            )}
          </p>
        </div>

        {/* 1-Click Dev Code Pill */}
        {DEMO_MODE && devCode && !isSuccess && (
          <div
            className="tb-otp-dev-pill"
            onClick={handleQuickFillDevCode}
            title="Click to automatically fill code"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickFillDevCode()}
          >
            <span>{t('otp.devCodeNotice') || 'Development Mode Code:'}</span>
            <span className="tb-otp-dev-code-bold">{devCode}</span>
            <span className="tb-otp-dev-pill-action">
              {isCopiedDevCode ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCopiedDevCode ? 'Filled!' : 'Quick Fill'}</span>
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="tb-otp-error-alert" role="alert">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6-Box Segmented Inputs */}
        <div className="tb-otp-inputs-wrapper">
          <label className="tb-otp-input-label">
            <span>{t('otp.enterOtp') || 'Enter 6-Digit OTP'}</span>
            <span style={{ color: '#DC2626' }}>*</span>
          </label>

          <div className="tb-otp-digits-grid" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={`otp-box-${idx}`}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`tb-otp-digit-cell ${digit ? 'is-filled' : ''} ${errorMessage ? 'is-error' : ''} ${isSuccess ? 'is-verified-pulse' : ''}`}
                disabled={isVerifying || isSuccess}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Timer & Resend Row */}
        {!isSuccess && (
          <div className="tb-otp-timer-row">
            {timer > 0 ? (
              <span>
                {t('otp.resendIn') || 'Resend code in'} <strong>{timer}s</strong>
              </span>
            ) : (
              <button
                type="button"
                className="tb-otp-resend-btn"
                onClick={onResendOtp}
                disabled={isSendingOtp}
              >
                <RotateCw size={13} className={isSendingOtp ? 'animate-spin' : ''} />
                <span>{isSendingOtp ? 'Sending code...' : (t('otp.resendBtn') || 'Resend OTP Code')}</span>
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          className={`tb-otp-submit-btn ${isSuccess ? 'is-success-btn' : ''}`}
          onClick={handleVerify}
          disabled={isVerifying || (!isComplete && !isSuccess)}
        >
          {isSuccess ? (
            <>
              <Check size={18} />
              <span>Verified Successfully!</span>
            </>
          ) : isVerifying ? (
            <>
              <div className="tb-otp-spinner" />
              <span>{t('otp.verifying') || 'Verifying Mobile...'}</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>{t('otp.verifyBtn') || 'Verify Mobile Number'}</span>
            </>
          )}
        </button>

        {/* Trust Note */}
        <div className="tb-otp-trust-note">
          <ShieldCheck size={13} color="#C9A24A" />
          <span>TeluguBandham 100% Verified Match Guarantee</span>
        </div>
      </div>
    </div>
  );
}
