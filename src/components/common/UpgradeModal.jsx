import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Crown, Check, Zap, Tag, CheckCircle2, Lock, ChevronDown, ChevronUp, ArrowRight,
  ArrowLeft, CreditCard, Smartphone, QrCode, RefreshCw, ShieldCheck
} from 'lucide-react';
import { SiPhonepe } from 'react-icons/si';
import confetti from 'canvas-confetti';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createMembershipTransaction } from '../../services/database/index.js';

// SVG Assets
import upiSvg from '../../assets/payment/upi.svg';
import googlePaySvg from '../../assets/payment/google-pay.svg';
import paytmSvg from '../../assets/payment/paytm.svg';
import visaSvg from '../../assets/payment/visa.svg';
import mastercardSvg from '../../assets/payment/mastercard.svg';
import rupaySvg from '../../assets/payment/rupay.svg';

import '../../styles/upgrade-modal.css';

// Official NPCI BHIM Vector Logo Component
function BhimOfficialLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" width="22" height="22" className={className} aria-label="BHIM UPI">
      <rect width="36" height="36" rx="8" fill="#00796B" />
      <polygon points="6,7 16,18 6,29 11.5,29 21.5,18 11.5,7" fill="#F47920" />
      <polygon points="11.5,7 21.5,18 11.5,29 15.5,29 25.5,18 15.5,7" fill="#FFFFFF" />
      <polygon points="16.5,7 26.5,18 16.5,29 21,29 31,18 21,7" fill="#00A859" />
      <text x="18" y="33.5" fill="#FFFFFF" fontSize="5.5" fontWeight="900" fontStyle="italic" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.4">BHIM</text>
    </svg>
  );
}

// Preset Demo Cards for convenient testing
const DEMO_TEST_CARDS = {
  visa: {
    name: 'Visa Test',
    number: '4532 8901 2345 6789',
    expiry: '12/28',
    cvv: '842',
    holder: 'Telugu Member'
  },
  mastercard: {
    name: 'Mastercard',
    number: '5425 7812 3456 7890',
    expiry: '09/27',
    cvv: '519',
    holder: 'Telugu Member'
  },
  rupay: {
    name: 'RuPay',
    number: '6071 5201 8934 1122',
    expiry: '06/29',
    cvv: '327',
    holder: 'Telugu Member'
  }
};

export default function UpgradeModal({ isOpen, onClose, selectedPlanId = null }) {
  const navigate = useNavigate();
  const { showToast, refreshState } = useApp();
  const { user, updateProfile } = useAuth();
  
  // Multi-step state: 'plan' | 'payment' | 'processing' | 'success' | 'failed'
  const [step, setStep] = useState('plan');

  // Plans data
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(selectedPlanId || 'plan_gold');
  
  // Features collapse toggle for compact vertical footprint
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Payment Channel State
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'bhim'
  const [upiSubMode, setUpiSubMode] = useState('apps'); // 'apps' | 'id'
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiError, setUpiError] = useState('');

  // Card State
  const [cardNumber, setCardNumber] = useState(DEMO_TEST_CARDS.visa.number);
  const [cardExpiry, setCardExpiry] = useState(DEMO_TEST_CARDS.visa.expiry);
  const [cardCvv, setCardCvv] = useState(DEMO_TEST_CARDS.visa.cvv);
  const [cardHolder, setCardHolder] = useState(user?.name || DEMO_TEST_CARDS.visa.holder);
  const [cardErrors, setCardErrors] = useState({});

  // 3D Secure OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']);
  const [otpError, setOtpError] = useState('');

  // Simulation test switch: test failure flow
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Result Receipt & Processing Details
  const [orderId, setOrderId] = useState('');
  const [processingStep, setProcessingStep] = useState('Initializing simulated gateway...');
  const [transactionResult, setTransactionResult] = useState(null);

  // QR Countdown timer
  const [qrTimerSeconds, setQrTimerSeconds] = useState(300);

  // Fallback plans if none from DB
  const defaultPlans = useMemo(() => [
    {
      id: 'plan_gold',
      name: 'Gold Member',
      period: '3 Months',
      price: 3499,
      originalPrice: 5999,
      badge: 'MOST POPULAR',
      badgeClass: 'tb-badge-gold',
      features: [
        'All Free Member features included',
        'View 50 Verified Contact Numbers and Kundali',
        'Instant Real-time Chat with any accepted match',
        '3x Profile Visibility Boost in search results',
        'Full Detailed Gothram and Nakshatram matching report',
        'SMS and WhatsApp alerts for match updates',
        'Priority customer support assistance'
      ]
    },
    {
      id: 'plan_diamond',
      name: 'Diamond Member',
      period: '6 Months',
      price: 5999,
      originalPrice: 9999,
      badge: 'BEST VALUE',
      badgeClass: 'tb-badge-diamond',
      features: [
        'All Gold Member features included',
        'View 120 Verified Contact Numbers',
        'Unlimited Messaging and Voice/Video Call requests',
        'Top 1st Page Guaranteed Search Placement',
        'Spotlight badge on profile card',
        'Exclusive Access to USA and Global Telugu NRI matches',
        'Dedicated Relationship Advisor onboarding'
      ]
    },
    {
      id: 'plan_elite',
      name: 'Telugu Elite VIP',
      period: '12 Months',
      price: 14999,
      originalPrice: 24999,
      badge: 'VIP CONCIERGE',
      badgeClass: 'tb-badge-elite',
      features: [
        'Personal Handpicked Matches by Senior Matchmaker',
        'Unlimited Contact Views with zero restrictions',
        'Confidential Stealth Mode and Privacy Shield',
        'Arranged Family Meetings and Video Introductions',
        'Astrological consultation by certified Vedic Pundit',
        'Direct WhatsApp concierge support 7 days a week',
        '24/7 Dedicated Senior Relationship Manager'
      ]
    }
  ], []);

  // Real-time synchronization for plans in modal
  useEffect(() => {
    const handlePlansUpdate = () => {
      const rawPlans = mockDb.getPlans() || [];
      const paidPlans = rawPlans.filter((p) => p && p.price > 0);
      setPlans(paidPlans.length > 0 ? paidPlans : defaultPlans);
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'plans' || type === 'storage_sync') {
        handlePlansUpdate();
      }
    });

    window.addEventListener('telugubandham_content_updated', handlePlansUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_content_updated', handlePlansUpdate);
    };
  }, [defaultPlans]);

  // Initialize plans and sync selectedPlanId when opened
  useEffect(() => {
    const rawPlans = mockDb.getPlans() || [];
    const paidPlans = rawPlans.filter((p) => p && p.price > 0);
    setPlans(paidPlans.length > 0 ? paidPlans : defaultPlans);

    if (isOpen) {
      const initialId = selectedPlanId || (paidPlans.length > 0 ? paidPlans[0].id : 'plan_gold');
      setCurrentPlanId(initialId);
      setStep('plan');
      setCouponCode('');
      setAppliedCoupon(null);
      setDiscountPercent(0);
      setCouponError('');
      setIsFeaturesExpanded(false);
      setActiveTab('upi');
      setUpiSubMode('apps');
      setSelectedUpiApp('gpay');
      setUpiId('');
      setIsUpiVerified(false);
      setIsVerifyingUpi(false);
      setUpiError('');
      setCardNumber(DEMO_TEST_CARDS.visa.number);
      setCardExpiry(DEMO_TEST_CARDS.visa.expiry);
      setCardCvv(DEMO_TEST_CARDS.visa.cvv);
      setCardHolder(user?.name || DEMO_TEST_CARDS.visa.holder);
      setCardErrors({});
      setIsOtpModalOpen(false);
      setSimulateFailure(false);
      setTransactionResult(null);
      setOrderId(`ORD-TB-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen, selectedPlanId, defaultPlans, user]);

  // QR countdown timer
  useEffect(() => {
    if (!isOpen || step !== 'payment' || activeTab !== 'qr') return;
    setQrTimerSeconds(300);
    const interval = setInterval(() => {
      setQrTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step, activeTab]);

  // Lock background page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleModalClose = React.useCallback(() => {
    setStep('plan');
    onClose();
  }, [onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (isOpen && e.key === 'Escape') {
        handleModalClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleModalClose]);

  if (!isOpen) return null;

  const activePlansList = plans.length > 0 ? plans : defaultPlans;
  const currentPlan = activePlansList.find((p) => p.id === currentPlanId) || activePlansList[0] || defaultPlans[0];

  const planPrice = currentPlan?.price || 3499;
  const planOriginalPrice = currentPlan?.originalPrice || Math.round(planPrice * 1.6);
  const discountAmount = Math.round(planPrice * (discountPercent / 100));
  const finalPrice = Math.max(0, planPrice - discountAmount);

  // Format QR time display
  const qrMinutes = Math.floor(qrTimerSeconds / 60);
  const qrSeconds = qrTimerSeconds % 60;
  const formattedQrTime = `${String(qrMinutes).padStart(2, '0')}:${String(qrSeconds).padStart(2, '0')}`;

  // Card network brand detector
  const detectedCardNetwork = (() => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return 'mastercard';
    if (/^(60|65|81|82|508)/.test(raw)) return 'rupay';
    return 'card';
  })();

  // Card network brand detector

  // Coupon code handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const cleanCode = (couponCode || '').trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (cleanCode === 'TELUGU50') {
      setAppliedCoupon('TELUGU50');
      setDiscountPercent(50);
      setCouponError('');
      showToast("🎉 Coupon TELUGU50 applied: 50% discount activated!", 'success');
    } else if (cleanCode === 'BANDHAM20' || cleanCode === 'FIRST20') {
      setAppliedCoupon(cleanCode);
      setDiscountPercent(20);
      setCouponError('');
      showToast(`🎉 Coupon ${cleanCode} applied: 20% discount activated!`, 'success');
    } else if (cleanCode === 'FESTIVE30' || cleanCode === 'UGADI30') {
      setAppliedCoupon(cleanCode);
      setDiscountPercent(30);
      setCouponError('');
      showToast(`🎉 Coupon ${cleanCode} applied: 30% discount activated!`, 'success');
    } else {
      setCouponError("Invalid coupon code. Try 'TELUGU50' or 'BANDHAM20'.");
    }
  };

  const handleQuickApplyCoupon = (code) => {
    const uppercaseCode = code.toUpperCase();
    setCouponCode(uppercaseCode);
    setAppliedCoupon(uppercaseCode);
    const pct = uppercaseCode === 'TELUGU50' ? 50 : 20;
    setDiscountPercent(pct);
    setCouponError('');
    showToast(`🎉 Coupon ${uppercaseCode} applied: ${pct}% discount activated!`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    setCouponCode('');
    setCouponError('');
    showToast("Coupon removed.", "info");
  };

  // Step 1 -> Step 2 transition
  const handleProceedToPayment = () => {
    if (!currentPlan) {
      showToast("Please choose a membership plan to proceed.", "warning");
      return;
    }
    setStep('payment');
  };

  // UPI Handlers
  const handleVerifyUpi = () => {
    setUpiError('');
    if (!upiId.trim()) {
      setUpiError('Please enter a UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId.trim())) {
      setUpiError('Invalid UPI ID format. (e.g. username@bank)');
      return;
    }

    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
      showToast("✓ UPI ID verified successfully!", "success");
    }, 600);
  };

  // Card Formatters & Presets
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    if (cardErrors.number) setCardErrors((prev) => ({ ...prev, number: '' }));
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    if (cardErrors.expiry) setCardErrors((prev) => ({ ...prev, expiry: '' }));
  };

  const handleApplyCardPreset = (type) => {
    const preset = DEMO_TEST_CARDS[type];
    if (preset) {
      setCardNumber(preset.number);
      setCardExpiry(preset.expiry);
      setCardCvv(preset.cvv);
      setCardHolder(user?.name || preset.holder);
      setCardErrors({});
      showToast(`Filled ${preset.name} test credentials`, 'info');
    }
  };

  const validateCardForm = () => {
    const errors = {};
    const rawNum = cardNumber.replace(/\s/g, '');
    if (!rawNum || rawNum.length < 15) {
      errors.number = 'Enter 16-digit card number.';
    }

    if (!cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      errors.expiry = 'Invalid expiry (MM/YY).';
    } else {
      const [month, yearStr] = cardExpiry.split('/');
      const expYear = 2000 + parseInt(yearStr, 10);
      const expMonth = parseInt(month, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errors.expiry = 'Card is expired.';
      }
    }

    if (!cardCvv || cardCvv.length < 3) {
      errors.cvv = 'Enter 3-digit CVV.';
    }

    if (!cardHolder.trim() || cardHolder.trim().length < 2) {
      errors.holder = 'Enter cardholder name.';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Execute Simulated Payment & Session Tier Upgrade
  const executePaymentSimulation = (paymentChannelName) => {
    setStep('processing');
    setProcessingStep('Connecting to Simulated Payment Gateway...');

    const timer1 = setTimeout(() => {
      setProcessingStep('Authorizing matrimonial upgrade transaction with bank...');
    }, 600);

    const timer2 = setTimeout(() => {
      setProcessingStep('Generating verified TeluguBandham transaction token...');
    }, 1200);

    const timer3 = setTimeout(async () => {
      if (simulateFailure) {
        setStep('failed');
        showToast("⚠️ Demo payment was declined in simulated failure mode.", "error");
        return;
      }

      const generatedTxId = `TXN-TB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const upgradedPlanName = currentPlan.name || 'Gold Member';
      const durationDays = currentPlan.period?.includes('12') ? 365 : currentPlan.period?.includes('6') ? 180 : 90;
      const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const resultPayload = {
        txId: generatedTxId,
        orderId,
        amount: finalPrice,
        planName: upgradedPlanName,
        duration: currentPlan.period || '3 Months',
        paymentMethod: paymentChannelName,
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Membership Activated'
      };

      // Update user in AuthContext & session storage
      const updatedUser = {
        ...(user || {}),
        membershipTier: upgradedPlanName,
        isPremium: true,
        membershipExpiry: expiryDate
      };

      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('telugubandham_auth_user', JSON.stringify(updatedUser));
        }
        if (typeof updateProfile === 'function') {
          await updateProfile(updatedUser);
        } else if (mockDb && typeof mockDb.setCurrentUser === 'function') {
          mockDb.setCurrentUser(updatedUser);
        }
        if (user?.id) {
          await createMembershipTransaction(user.id, currentPlan, paymentChannelName);
        }
      } catch (err) {
        console.warn("Failed to persist upgrade in background IndexedDB:", err);
      }

      setTransactionResult(resultPayload);
      setStep('success');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.55 }
        });
      } catch (e) {
        // ignore confetti errors
      }

      if (refreshState) refreshState();
      showToast(`🎉 Payment successful! ${upgradedPlanName} is now active.`, 'success');
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Payment Submission Trigger
  const handleInitiatePayment = () => {
    if (activeTab === 'upi') {
      if (upiSubMode === 'id') {
        if (!isUpiVerified) {
          handleVerifyUpi();
          return;
        }
        executePaymentSimulation(`UPI ID (${upiId})`);
      } else {
        const upiAppNames = {
          gpay: 'Google Pay UPI',
          phonepe: 'PhonePe UPI',
          paytm: 'Paytm UPI',
          bhim: 'BHIM UPI'
        };
        executePaymentSimulation(upiAppNames[selectedUpiApp] || 'Instant UPI App');
      }
    } else if (activeTab === 'card') {
      if (!validateCardForm()) {
        showToast("Please correct the card details before proceeding.", "warning");
        return;
      }
      setIsOtpModalOpen(true);
    } else if (activeTab === 'qr') {
      executePaymentSimulation('Dynamic UPI QR Scan');
    }
  };

  // OTP handlers
  const handleOtpDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(0, 1);
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);
    if (otpError) setOtpError('');

    if (clean && index < 5) {
      const nextInput = document.getElementById(`demo-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleConfirmCardOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the test OTP code.');
      return;
    }
    setIsOtpModalOpen(false);
    const networkName = detectedCardNetwork.toUpperCase();
    executePaymentSimulation(`${networkName} Card ending in ${cardNumber.slice(-4)}`);
  };

  // Success Exploration CTA
  const handleSuccessExplore = () => {
    handleModalClose();
    navigate('/matches');
  };

  const isSubmitDisabled = activeTab === 'upi' && upiSubMode === 'id' && !isUpiVerified;

  const visibleFeatures = isFeaturesExpanded 
    ? (currentPlan?.features || []) 
    : (currentPlan?.features || []).slice(0, 4);

  const hasMoreFeatures = (currentPlan?.features || []).length > 4;

  return (
    <div className="tb-upgrade-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tb-modal-heading">
      <div className="tb-upgrade-modal-card">
        
        {/* =========================================================================
            HEADER: STEP 1 (PLAN SELECTION) vs STEP 2 (DEMO PAYMENT)
            ========================================================================= */}
        {step === 'plan' ? (
          /* STEP 1 HEADER - EXACT FIRST WINDOW */
          <header className="tb-upgrade-modal-header">
            <div className="tb-upgrade-header-left">
              <div className="tb-upgrade-crown-icon-wrap" aria-hidden="true">
                <Crown size={20} />
              </div>
              <div className="tb-upgrade-header-text">
                <h2 id="tb-modal-heading" className="tb-upgrade-modal-title">Upgrade to Premium</h2>
                <p className="tb-upgrade-modal-subtitle">
                  Unlock more ways to connect with compatible matches.
                </p>
              </div>
            </div>

            <button 
              type="button" 
              className="tb-upgrade-modal-close-btn" 
              onClick={handleModalClose}
              aria-label="Close Upgrade Modal (Press Escape)"
            >
              <X size={18} />
            </button>
          </header>
        ) : (
          /* STEP 2+ REFINED HEADER */
          <header className="tb-upgrade-modal-header tb-step2-header">
            <div className="tb-upgrade-header-left">
              <div className="tb-upgrade-crown-icon-wrap" aria-hidden="true">
                <Crown size={20} />
              </div>

              <div className="tb-upgrade-header-text">
                <div className="tb-step-title-row">
                  <h2 id="tb-modal-heading" className="tb-upgrade-modal-title">
                    {step === 'payment' && 'Complete Your Upgrade'}
                    {step === 'processing' && 'Processing Demo Payment'}
                    {step === 'success' && 'Membership Activated'}
                    {step === 'failed' && 'Payment Declined (Test)'}
                  </h2>
                </div>
                <p className="tb-upgrade-modal-subtitle">
                  {step === 'payment' && 'Select your simulated payment channel to complete membership activation.'}
                  {step === 'processing' && 'Secure 256-Bit simulated payment verification in progress.'}
                  {step === 'success' && 'Your premium matrimonial privileges have been unlocked.'}
                  {step === 'failed' && 'Simulation completed in declined test mode.'}
                </p>
              </div>
            </div>

            <div className="tb-header-right-group">
              <div className="tb-gateway-badge">
                <span className="tb-live-dot"></span>
                <span>DEMO GATEWAY</span>
              </div>
              <button 
                type="button" 
                className="tb-upgrade-modal-close-btn" 
                onClick={handleModalClose}
                aria-label="Close Modal"
              >
                <X size={18} />
              </button>
            </div>
          </header>
        )}

        {/* =========================================================================
            BODY: STEP 1 (PLAN SELECTION) - PRESERVED EXACTLY
            ========================================================================= */}
        {step === 'plan' && (
          <div className="tb-upgrade-modal-body">
            
            {/* STEP 1: CHOOSE YOUR PLAN */}
            <section className="tb-modal-section" aria-labelledby="tb-step1-heading">
              <div className="tb-section-header-row">
                <h3 id="tb-step1-heading" className="tb-upgrade-section-title">
                  Choose Your Plan
                </h3>
                <span className="tb-step-tagline">100% Verified Profiles and Privacy Protection</span>
              </div>

              <div className="tb-upgrade-plans-grid" role="radiogroup" aria-label="Membership Plans">
                {activePlansList.map((plan) => {
                  const isSelected = plan.id === currentPlanId;
                  const isGold = plan.id === 'plan_gold';
                  const isDiamond = plan.id === 'plan_diamond';
                  const isElite = plan.id === 'plan_elite' || plan.id === 'plan_vip';
                  
                  const planCardVariant = isGold
                    ? 'tb-plan-card-gold'
                    : isDiamond
                    ? 'tb-plan-card-diamond'
                    : isElite
                    ? 'tb-plan-card-elite'
                    : '';

                  const planBadgeVariant = isGold
                    ? 'tb-badge-gold'
                    : isDiamond
                    ? 'tb-badge-diamond'
                    : isElite
                    ? 'tb-badge-elite'
                    : (plan.badgeClass || 'tb-badge-gold');

                  const original = plan.originalPrice || Math.round(plan.price * 1.6);
                  const discountPct = Math.round(((original - plan.price) / original) * 100);

                  return (
                    <div
                      key={plan.id}
                      className={`tb-upgrade-plan-card ${planCardVariant} ${isSelected ? 'selected' : ''}`}
                      onClick={() => setCurrentPlanId(plan.id)}
                      role="radio"
                      tabIndex={0}
                      aria-checked={isSelected}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setCurrentPlanId(plan.id);
                        }
                      }}
                    >
                      {/* Floating Badge */}
                      {plan.badge && (
                        <span className={`tb-plan-badge ${planBadgeVariant}`}>
                          {plan.badge}
                        </span>
                      )}

                      {/* Radio Indicator */}
                      <div className="tb-plan-card-radio-wrap" aria-hidden="true">
                        <div className={`tb-custom-radio ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <div className="tb-custom-radio-inner" />}
                        </div>
                      </div>

                      <div className="tb-plan-card-header">
                        <h4 className="tb-plan-card-name">{plan.name}</h4>
                        <span className="tb-plan-card-period">{plan.period || 'Duration'}</span>
                      </div>

                      <div className="tb-plan-card-pricing-block">
                        <div className="tb-plan-card-price">
                          ₹{plan.price.toLocaleString('en-IN')}
                        </div>
                        
                        <div className="tb-plan-card-orig-row">
                          <span className="tb-plan-card-orig-price">
                            ₹{original.toLocaleString('en-IN')}
                          </span>
                          {discountPct > 0 && (
                            <span className="tb-plan-save-pill">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* WHAT'S INCLUDED (FEATURES SUMMARY) */}
            <section className="tb-modal-section tb-features-section" aria-labelledby="tb-features-heading">
              <div className="tb-upgrade-features-box">
                <div className="tb-features-box-header">
                  <div className="tb-features-title-wrap">
                    <h4 id="tb-features-heading" className="tb-features-box-title">
                      What's Included in {currentPlan.name}
                    </h4>
                    <span className="tb-features-badge">{currentPlan.period} Premium Access</span>
                  </div>

                  {hasMoreFeatures && (
                    <button
                      type="button"
                      className="tb-features-toggle-btn"
                      onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
                      aria-expanded={isFeaturesExpanded}
                    >
                      <span>{isFeaturesExpanded ? 'Show less' : `View all features (${currentPlan.features?.length})`}</span>
                      {isFeaturesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                <ul className="tb-upgrade-features-list">
                  {visibleFeatures.map((feat, idx) => (
                    <li key={idx} className="tb-upgrade-feature-item">
                      <span className="tb-feature-check-circle" aria-hidden="true">
                        <Check size={13} strokeWidth={2.8} />
                      </span>
                      <span className="tb-feature-text">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* COUPON ROW */}
            <section className="tb-modal-section tb-coupon-section" aria-label="Coupon Discount">
              <div className="tb-coupon-box">
                <div className="tb-coupon-label-row">
                  <label htmlFor="tb-coupon-input" className="tb-coupon-label">
                    <Tag size={14} className="tb-coupon-label-icon" />
                    <span>Have a coupon?</span>
                  </label>
                  {!appliedCoupon && (
                    <span 
                      className="tb-coupon-hint"
                      onClick={() => handleQuickApplyCoupon('TELUGU50')}
                      title="Click to apply TELUGU50"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleQuickApplyCoupon('TELUGU50');
                        }
                      }}
                    >
                      Use code <strong>TELUGU50</strong> for 50% OFF
                    </span>
                  )}
                </div>

                {!appliedCoupon ? (
                  <div>
                    <form onSubmit={handleApplyCoupon} className="tb-promo-form">
                      <div className="tb-promo-input-wrapper">
                        <input
                          id="tb-coupon-input"
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            if (couponError) setCouponError('');
                          }}
                          className={`tb-promo-input ${couponError ? 'has-error' : ''}`}
                          autoComplete="off"
                          spellCheck="false"
                        />
                      </div>

                      <button type="submit" className="tb-promo-apply-btn">
                        Apply
                      </button>
                    </form>

                    {couponError && (
                      <div className="tb-coupon-inline-error" role="alert">
                        {couponError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="tb-coupon-success-strip">
                    <div className="tb-coupon-success-left">
                      <CheckCircle2 size={16} className="tb-coupon-success-icon" />
                      <div>
                        <strong className="tb-coupon-code-tag">{appliedCoupon}</strong> applied
                        <span className="tb-coupon-savings-text"> — You saved ₹{discountAmount.toLocaleString('en-IN')} ({discountPercent}% OFF)</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="tb-coupon-remove-btn"
                      onClick={handleRemoveCoupon}
                      aria-label="Remove applied coupon"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </section>

          </div>
        )}

        {/* =========================================================================
            BODY: STEP 2 (REFINED COMPACT DEMO PAYMENT GATEWAY)
            ========================================================================= */}
        {step === 'payment' && (
          <div className="tb-upgrade-modal-body tb-step2-refined-body">
            
            {/* Compact Notice Alert */}
            <div className="tb-compact-notice-bar" role="status">
              <Lock size={12} className="tb-compact-notice-icon" />
              <span><strong>Demo Simulator:</strong> Interactive simulation environment. No real cards or bank accounts are charged.</span>
            </div>

            {/* Clean 2-Column Layout */}
            <div className="tb-step2-grid">

              {/* LEFT COLUMN: METHOD SELECTOR & PAYMENT INPUTS */}
              <div className="tb-payment-options-col">
                
                {/* 3 Payment Tabs */}
                <div className="tb-compact-tabs" role="tablist">
                  <button
                    type="button"
                    className={`tb-compact-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upi')}
                    role="tab"
                    aria-selected={activeTab === 'upi'}
                  >
                    <span className="tb-tab-fast-badge">FAST</span>
                    <img src={upiSvg} alt="UPI" className="tb-tab-upi-img" />
                    <span>UPI Pay</span>
                  </button>

                  <button
                    type="button"
                    className={`tb-compact-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                    onClick={() => setActiveTab('card')}
                    role="tab"
                    aria-selected={activeTab === 'card'}
                  >
                    <CreditCard size={16} />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    className={`tb-compact-tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
                    onClick={() => setActiveTab('qr')}
                    role="tab"
                    aria-selected={activeTab === 'qr'}
                  >
                    <QrCode size={16} />
                    <span>Scan QR Code</span>
                  </button>
                </div>

                {/* TAB 1: UPI CONTENT */}
                {activeTab === 'upi' && (
                  <div className="tb-method-panel">
                    <div className="tb-submode-toggle">
                      <button
                        type="button"
                        className={`tb-submode-btn ${upiSubMode === 'apps' ? 'active' : ''}`}
                        onClick={() => setUpiSubMode('apps')}
                      >
                        <Smartphone size={12} /> Quick UPI Apps
                      </button>
                      <button
                        type="button"
                        className={`tb-submode-btn ${upiSubMode === 'id' ? 'active' : ''}`}
                        onClick={() => setUpiSubMode('id')}
                      >
                        <CheckCircle2 size={12} /> Enter UPI ID
                      </button>
                    </div>

                    {upiSubMode === 'apps' ? (
                      <div className="tb-upi-grid-2x2">
                        {/* Google Pay */}
                        <div
                          className={`tb-app-tile ${selectedUpiApp === 'gpay' ? 'selected' : ''}`}
                          onClick={() => setSelectedUpiApp('gpay')}
                          tabIndex={0}
                          role="radio"
                          aria-checked={selectedUpiApp === 'gpay'}
                        >
                          <div className="tb-app-icon-wrap">
                            <img src={googlePaySvg} alt="Google Pay" />
                          </div>
                          <div className="tb-app-text">
                            <strong>Google Pay</strong>
                            <span>Instant 1-Click Pay</span>
                          </div>
                          <div className={`tb-app-radio ${selectedUpiApp === 'gpay' ? 'checked' : ''}`}>
                            {selectedUpiApp === 'gpay' && <div className="tb-radio-dot" />}
                          </div>
                        </div>

                        {/* PhonePe */}
                        <div
                          className={`tb-app-tile ${selectedUpiApp === 'phonepe' ? 'selected' : ''}`}
                          onClick={() => setSelectedUpiApp('phonepe')}
                          tabIndex={0}
                          role="radio"
                          aria-checked={selectedUpiApp === 'phonepe'}
                        >
                          <div className="tb-app-icon-wrap" style={{ background: '#5F259F', color: '#FFF' }}>
                            <SiPhonepe size={16} />
                          </div>
                          <div className="tb-app-text">
                            <strong>PhonePe</strong>
                            <span>UPI Authorization</span>
                          </div>
                          <div className={`tb-app-radio ${selectedUpiApp === 'phonepe' ? 'checked' : ''}`}>
                            {selectedUpiApp === 'phonepe' && <div className="tb-radio-dot" />}
                          </div>
                        </div>

                        {/* Paytm */}
                        <div
                          className={`tb-app-tile ${selectedUpiApp === 'paytm' ? 'selected' : ''}`}
                          onClick={() => setSelectedUpiApp('paytm')}
                          tabIndex={0}
                          role="radio"
                          aria-checked={selectedUpiApp === 'paytm'}
                        >
                          <div className="tb-app-icon-wrap">
                            <img src={paytmSvg} alt="Paytm" />
                          </div>
                          <div className="tb-app-text">
                            <strong>Paytm UPI</strong>
                            <span>Instant Transfer</span>
                          </div>
                          <div className={`tb-app-radio ${selectedUpiApp === 'paytm' ? 'checked' : ''}`}>
                            {selectedUpiApp === 'paytm' && <div className="tb-radio-dot" />}
                          </div>
                        </div>

                        {/* BHIM UPI */}
                        <div
                          className={`tb-app-tile ${selectedUpiApp === 'bhim' ? 'selected' : ''}`}
                          onClick={() => setSelectedUpiApp('bhim')}
                          tabIndex={0}
                          role="radio"
                          aria-checked={selectedUpiApp === 'bhim'}
                        >
                          <div className="tb-app-icon-wrap" style={{ padding: 0 }}>
                            <BhimOfficialLogo />
                          </div>
                          <div className="tb-app-text">
                            <strong>BHIM UPI</strong>
                            <span>NPCI Network</span>
                          </div>
                          <div className={`tb-app-radio ${selectedUpiApp === 'bhim' ? 'checked' : ''}`}>
                            {selectedUpiApp === 'bhim' && <div className="tb-radio-dot" />}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ENTER UPI ID */
                      <div className="tb-field-group">
                        <label className="tb-field-label">Virtual Payment Address (UPI ID)</label>
                        <div className="tb-input-with-button">
                          <input
                            type="text"
                            placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setIsUpiVerified(false);
                              if (upiError) setUpiError('');
                            }}
                            className={`tb-compact-input ${upiError ? 'has-error' : ''} ${isUpiVerified ? 'is-verified' : ''}`}
                          />
                          <button
                            type="button"
                            className="tb-input-action-btn"
                            onClick={handleVerifyUpi}
                            disabled={isVerifyingUpi || isUpiVerified}
                          >
                            {isVerifyingUpi ? 'Verifying...' : isUpiVerified ? '✓ Verified' : 'Verify'}
                          </button>
                        </div>
                        {upiError && <div className="tb-inline-error">{upiError}</div>}
                        {isUpiVerified && (
                          <div className="tb-inline-success">
                            ✓ Verified VPA address. Ready for instant demo payment.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: CARD CONTENT */}
                {activeTab === 'card' && (
                  <div className="tb-method-panel">
                    <div className="tb-preset-cards-row">
                      <span className="tb-preset-hint">Quick Test:</span>
                      <button
                        type="button"
                        className="tb-preset-chip"
                        onClick={() => handleApplyCardPreset('visa')}
                      >
                        Visa
                      </button>
                      <button
                        type="button"
                        className="tb-preset-chip"
                        onClick={() => handleApplyCardPreset('mastercard')}
                      >
                        Mastercard
                      </button>
                      <button
                        type="button"
                        className="tb-preset-chip"
                        onClick={() => handleApplyCardPreset('rupay')}
                      >
                        RuPay
                      </button>
                    </div>

                    <div className="tb-field-group">
                      <label className="tb-field-label">Card Number</label>
                      <div className="tb-input-with-icon">
                        <input
                          type="text"
                          placeholder="4532 8901 2345 6789"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className={`tb-compact-input ${cardErrors.number ? 'has-error' : ''}`}
                          maxLength={19}
                        />
                        <div className="tb-card-brand-badge-inline">
                          {detectedCardNetwork === 'visa' && <img src={visaSvg} alt="Visa" />}
                          {detectedCardNetwork === 'mastercard' && <img src={mastercardSvg} alt="Mastercard" />}
                          {detectedCardNetwork === 'rupay' && <img src={rupaySvg} alt="RuPay" />}
                          {detectedCardNetwork === 'card' && <CreditCard size={14} color="#7A756F" />}
                        </div>
                      </div>
                      {cardErrors.number && <div className="tb-inline-error">{cardErrors.number}</div>}
                    </div>

                    <div className="tb-grid-2col-compact">
                      <div className="tb-field-group">
                        <label className="tb-field-label">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          className={`tb-compact-input ${cardErrors.expiry ? 'has-error' : ''}`}
                          maxLength={5}
                        />
                        {cardErrors.expiry && <div className="tb-inline-error">{cardErrors.expiry}</div>}
                      </div>

                      <div className="tb-field-group">
                        <label className="tb-field-label">CVV / CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                            if (cardErrors.cvv) setCardErrors((prev) => ({ ...prev, cvv: '' }));
                          }}
                          className={`tb-compact-input ${cardErrors.cvv ? 'has-error' : ''}`}
                          maxLength={4}
                        />
                        {cardErrors.cvv && <div className="tb-inline-error">{cardErrors.cvv}</div>}
                      </div>
                    </div>

                    <div className="tb-field-group" style={{ marginBottom: 0 }}>
                      <label className="tb-field-label">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name as on card"
                        value={cardHolder}
                        onChange={(e) => {
                          setCardHolder(e.target.value);
                          if (cardErrors.holder) setCardErrors((prev) => ({ ...prev, holder: '' }));
                        }}
                        className={`tb-compact-input ${cardErrors.holder ? 'has-error' : ''}`}
                      />
                      {cardErrors.holder && <div className="tb-inline-error">{cardErrors.holder}</div>}
                    </div>
                  </div>
                )}

                {/* TAB 3: QR CODE CONTENT */}
                {activeTab === 'qr' && (
                  <div className="tb-method-panel tb-qr-panel">
                    <div className="tb-qr-card-box">
                      <span className="tb-qr-tag">DEMO UPI QR</span>
                      <QrCode size={90} color="#5B1229" />
                    </div>
                    <div className="tb-qr-info-box">
                      <div className="tb-qr-amount">₹{finalPrice.toLocaleString('en-IN')}</div>
                      <p className="tb-qr-instructions">
                        Scan using Google Pay, PhonePe, Paytm or BHIM UPI app on your mobile.
                      </p>
                      <div className="tb-qr-timer-pill">
                        ⏱️ Expires in: <strong>{formattedQrTime}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* QA Failure Switch */}
                <div className="tb-test-failure-row">
                  <span className="tb-test-failure-label">
                    🧪 Test mode: Simulate bank decline
                  </span>
                  <label className="tb-switch-control" title="Toggle to simulate a bank decline">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                    />
                    <span className="tb-switch-slider"></span>
                  </label>
                </div>

              </div>

              {/* RIGHT COLUMN: COMPACT ORDER SUMMARY */}
              <aside className="tb-order-summary-col">
                <div className="tb-summary-top-row">
                  <h3 className="tb-summary-heading">Order Summary</h3>
                  <span className="tb-summary-ref-id">Ref: {orderId}</span>
                </div>

                <div className="tb-summary-plan-badge">
                  <div className="tb-summary-plan-title-row">
                    <strong className="tb-summary-plan-name">{currentPlan.name}</strong>
                    <span className="tb-summary-plan-period">{currentPlan.period || '3 Months'}</span>
                  </div>
                  <span className="tb-summary-plan-sub">Telugu Matrimonial Access</span>
                </div>

                <div className="tb-summary-fee-list">
                  <div className="tb-fee-item">
                    <span>Plan Fee</span>
                    <span>₹{planPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="tb-fee-item">
                    <span>Processing Fee / GST</span>
                    <span className="tb-free-tag">₹0 (FREE)</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="tb-fee-item tb-discount-highlight">
                      <span>Coupon ({appliedCoupon})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="tb-fee-divider" />

                  <div className="tb-total-item">
                    <span className="tb-total-label">Subtotal</span>
                    <span className="tb-total-amount">₹{finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="tb-summary-trust-bullets">
                  <div className="tb-trust-bullet">
                    <CheckCircle2 size={13} color="#059669" />
                    <span>Instant Tier Activation</span>
                  </div>
                  <div className="tb-trust-bullet">
                    <ShieldCheck size={13} color="#059669" />
                    <span>256-Bit Test Security</span>
                  </div>
                  <div className="tb-trust-bullet">
                    <CheckCircle2 size={13} color="#059669" />
                    <span>Zero Real Charges</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="tb-change-plan-action"
                  onClick={() => setStep('plan')}
                >
                  ← Change selected plan
                </button>
              </aside>

            </div>

          </div>
        )}

        {/* =========================================================================
            BODY: STEP 3 (PROCESSING STATE)
            ========================================================================= */}
        {step === 'processing' && (
          <div className="tb-upgrade-modal-body tb-state-body">
            <div className="tb-processing-card" role="status" aria-live="polite">
              <div className="tb-pulse-spinner"></div>
              <h3 className="tb-state-title">Processing Demo Payment</h3>
              <p className="tb-state-step-desc">{processingStep}</p>
              <div className="tb-security-tag">
                <Lock size={12} /> 256-Bit Matrimonial Payment Encryption
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            BODY: STEP 4 (PAYMENT SUCCESS)
            ========================================================================= */}
        {step === 'success' && transactionResult && (
          <div className="tb-upgrade-modal-body tb-state-body">
            <div className="tb-success-receipt-card" role="region" aria-label="Payment Receipt">
              <div className="tb-success-icon-wrap" aria-hidden="true">
                <CheckCircle2 size={42} color="#059669" />
              </div>

              <h2 className="tb-state-title">Payment Successful!</h2>
              <p className="tb-state-subtitle">
                Congratulations! Your TeluguBandham <strong>{transactionResult.planName}</strong> has been activated for this session.
              </p>

              <div className="tb-receipt-table">
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Membership Plan:</span>
                  <span className="tb-receipt-val highlight">{transactionResult.planName}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Duration:</span>
                  <span className="tb-receipt-val">{transactionResult.duration}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Amount Paid:</span>
                  <span className="tb-receipt-val">₹{transactionResult.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Payment Channel:</span>
                  <span className="tb-receipt-val">{transactionResult.paymentMethod}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Transaction ID:</span>
                  <span className="tb-receipt-val monospace">{transactionResult.txId}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Order Reference:</span>
                  <span className="tb-receipt-val monospace">{transactionResult.orderId}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Status:</span>
                  <span className="tb-receipt-val success">✓ {transactionResult.status}</span>
                </div>
                <div className="tb-receipt-row">
                  <span className="tb-receipt-lbl">Date & Time:</span>
                  <span className="tb-receipt-val">{transactionResult.date}</span>
                </div>
              </div>

              <div className="tb-state-actions">
                <button
                  type="button"
                  className="tb-state-btn-primary"
                  onClick={handleSuccessExplore}
                >
                  Explore Premium Matches <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  className="tb-state-btn-secondary"
                  onClick={handleModalClose}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            BODY: STEP 5 (PAYMENT DECLINED - SIMULATED TEST)
            ========================================================================= */}
        {step === 'failed' && (
          <div className="tb-upgrade-modal-body tb-state-body">
            <div className="tb-failure-card" role="region" aria-label="Payment Declined">
              <div className="tb-failure-icon-wrap" aria-hidden="true">
                <X size={38} color="#DC2626" />
              </div>

              <h2 className="tb-state-title">Payment Declined (Simulated)</h2>
              <p className="tb-state-subtitle">
                The simulated transaction was rejected because test failure mode was enabled. No real charges occurred.
              </p>

              <div className="tb-state-actions">
                <button
                  type="button"
                  className="tb-state-btn-primary"
                  onClick={() => {
                    setSimulateFailure(false);
                    setStep('payment');
                  }}
                >
                  <RefreshCw size={15} /> Retry Payment
                </button>
                <button
                  type="button"
                  className="tb-state-btn-secondary"
                  onClick={() => {
                    setSimulateFailure(false);
                    setActiveTab('upi');
                    setStep('payment');
                  }}
                >
                  Change Payment Method
                </button>
                <button
                  type="button"
                  className="tb-state-btn-ghost"
                  onClick={() => setStep('plan')}
                >
                  ← Back to Plan Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STICKY FOOTER: SHARED ACROSS STEP 1 & STEP 2 FOR EXACT MATCHING SIZE
            ========================================================================= */}
        {(step === 'plan' || step === 'payment') && (
          <>
            <footer className="tb-upgrade-footer-strip">
              <div className="tb-footer-summary-col">
                <span className="tb-amount-payable-label">Total Payable:</span>
                <div className="tb-amount-payable-row">
                  <span className="tb-final-price-text">
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>

                  {discountPercent > 0 ? (
                    <>
                      <span className="tb-original-price-text">
                        ₹{planPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="tb-discount-pill">
                        {discountPercent}% OFF
                      </span>
                    </>
                  ) : (
                    planOriginalPrice > planPrice && (
                      <span className="tb-original-price-text">
                        ₹{planOriginalPrice.toLocaleString('en-IN')}
                      </span>
                    )
                  )}
                </div>
              </div>

              {step === 'plan' ? (
                <div className="tb-footer-actions-group">
                  <button
                    type="button"
                    className="tb-checkout-submit-btn"
                    onClick={handleProceedToPayment}
                  >
                    <span>Proceed to Payment</span>
                  </button>
                </div>
              ) : (
                <div className="tb-footer-actions-group">
                  <button
                    type="button"
                    className="tb-footer-back-btn"
                    onClick={() => setStep('plan')}
                    aria-label="Back to Plan Selection"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Plans</span>
                  </button>

                  <button
                    type="button"
                    className="tb-checkout-submit-btn"
                    onClick={handleInitiatePayment}
                    disabled={isSubmitDisabled}
                  >
                    <span>
                      {activeTab === 'card' 
                        ? 'Proceed to 3D Secure OTP' 
                        : `Authorize ₹${finalPrice.toLocaleString('en-IN')} Demo Payment`}
                    </span>
                  </button>
                </div>
              )}
            </footer>

            {/* SUBTLE SECURITY & TRUST FOOTER */}
            <div className="tb-upgrade-trust-footer">
              <Lock size={12} color="#16A34A" />
              <span>256-Bit SSL Encrypted Checkout • Instant Plan Activation • Secure Payment Processing</span>
            </div>
          </>
        )}

        {/* =========================================================================
            SIMULATED 3D SECURE OTP MODAL (FOR CARD FLOW)
            ========================================================================= */}
        {isOtpModalOpen && (
          <div className="tb-otp-overlay" role="dialog" aria-modal="true" aria-labelledby="otp-title">
            <div className="tb-otp-modal">
              <div className="tb-otp-header">
                <ShieldCheck size={24} color="#7A1635" />
                <div>
                  <h3 id="otp-title" className="tb-otp-title">Bank 3D Secure Verification</h3>
                  <span className="tb-otp-sub">Simulated OTP SMS sent to registered mobile</span>
                </div>
              </div>

              <div className="tb-otp-body">
                <div className="tb-otp-pill">
                  <span>Merchant: <strong>TeluguBandham</strong></span>
                  <span>Amount: <strong>₹{finalPrice.toLocaleString('en-IN')}</strong></span>
                </div>

                <label className="tb-field-label" style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                  Enter 6-Digit Demo OTP Code
                </label>

                <div className="tb-otp-inputs">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`demo-otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      className="tb-otp-cell"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {otpError && <div className="tb-inline-error" style={{ textAlign: 'center' }}>{otpError}</div>}

                <div className="tb-otp-hint">
                  💡 Test Code: <strong>123456</strong> is pre-filled for your convenience.
                </div>

                <div className="tb-otp-btn-row">
                  <button
                    type="button"
                    className="tb-state-btn-primary"
                    style={{ flex: 1 }}
                    onClick={handleConfirmCardOtp}
                  >
                    Verify & Authorize
                  </button>
                  <button
                    type="button"
                    className="tb-state-btn-secondary"
                    onClick={() => setIsOtpModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
