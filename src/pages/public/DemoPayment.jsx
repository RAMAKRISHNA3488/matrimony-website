import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Lock, CheckCircle2, AlertTriangle, 
  CreditCard, Smartphone, QrCode, RefreshCw, X, ArrowRight
} from 'lucide-react';
import { SiPhonepe } from 'react-icons/si';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import { createMembershipTransaction } from '../../services/database/index.js';

// SVG Assets
import upiSvg from '../../assets/payment/upi.svg';
import googlePaySvg from '../../assets/payment/google-pay.svg';
import paytmSvg from '../../assets/payment/paytm.svg';

import '../../styles/demo-payment.css';

// Official NPCI BHIM Vector Logo Component
function BhimOfficialLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" width="28" height="28" className={className} aria-label="BHIM UPI">
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
    name: 'Visa Test Card',
    number: '4532 8901 2345 6789',
    expiry: '12/28',
    cvv: '842',
    holder: 'Telugu Member'
  },
  mastercard: {
    name: 'Mastercard Test',
    number: '5425 7812 3456 7890',
    expiry: '09/27',
    cvv: '519',
    holder: 'Telugu Member'
  },
  rupay: {
    name: 'RuPay Platinum',
    number: '6071 5201 8934 1122',
    expiry: '06/29',
    cvv: '327',
    holder: 'Telugu Member'
  }
};

export default function DemoPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { showToast, refreshState } = useApp();

  // 1. Recover payment draft from Router state or sessionStorage or default fallback
  const draftData = useMemo(() => {
    if (location.state && location.state.plan) {
      return location.state;
    }
    try {
      const stored = sessionStorage.getItem('telugubandham_payment_draft');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse payment draft from session:", e);
    }
    // Default fallback draft if visited directly
    return {
      plan: {
        id: 'plan_gold',
        name: 'Gold Member',
        period: '3 Months',
        price: 3499,
        originalPrice: 5999
      },
      finalPrice: 3499,
      discountAmount: 0,
      appliedCoupon: null,
      paymentMethod: 'upi',
      upiSubMode: 'apps',
      selectedUpiApp: 'gpay',
      orderId: 'ORD-TB-782190'
    };
  }, [location.state]);

  const plan = draftData.plan || {
    id: 'plan_gold',
    name: 'Gold Member',
    period: '3 Months',
    price: 3499,
    originalPrice: 5999
  };

  const finalPrice = typeof draftData.finalPrice === 'number' ? draftData.finalPrice : (plan.price || 3499);
  const discountAmount = draftData.discountAmount || 0;
  const appliedCoupon = draftData.appliedCoupon || null;
  const [orderId] = useState(() => draftData.orderId || `ORD-TB-${Math.floor(100000 + Math.random() * 900000)}`);

  // View state: 'checkout' | 'processing' | 'success' | 'failed'
  const [viewState, setViewState] = useState('checkout');
  const [processingStep, setProcessingStep] = useState('Initializing simulated gateway...');

  // Selected payment method tabs
  const [activeTab, setActiveTab] = useState(draftData.paymentMethod === 'card' ? 'card' : (draftData.upiSubMode === 'qr' ? 'qr' : 'upi'));

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState(draftData.selectedUpiApp || 'gpay');
  const [upiSubMode, setUpiSubMode] = useState(draftData.upiSubMode === 'id' ? 'id' : 'apps');
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

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']);
  const [otpError, setOtpError] = useState('');

  // Simulation test switch: test failure flow
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Result Receipt
  const [transactionResult, setTransactionResult] = useState(null);

  // Detect card network brand
  const detectedCardNetwork = useMemo(() => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return 'mastercard';
    if (/^(60|65|81|82|508)/.test(raw)) return 'rupay';
    return 'card';
  }, [cardNumber]);

  // Format Card input
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    if (cardErrors.number) setCardErrors((prev) => ({ ...prev, number: '' }));
  };

  // Format Expiry input
  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
    if (cardErrors.expiry) setCardErrors((prev) => ({ ...prev, expiry: '' }));
  };

  // Quick Card Preset Filler
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

  // Verify UPI handler
  const handleVerifyUpi = () => {
    setUpiError('');
    if (!upiId.trim()) {
      setUpiError('Please enter a UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId.trim())) {
      setUpiError('Invalid UPI ID format. Must be in username@bank format.');
      return;
    }

    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
      showToast("✓ UPI ID verified successfully!", "success");
    }, 600);
  };

  // Validate Card fields
  const validateCardForm = () => {
    const errors = {};
    const rawNum = cardNumber.replace(/\s/g, '');
    if (!rawNum || rawNum.length < 15) {
      errors.number = 'Please enter a valid 16-digit card number.';
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

  // Execute Simulated Payment
  const executePaymentSimulation = (paymentChannelName) => {
    setViewState('processing');
    setProcessingStep('Connecting to Simulated Payment Gateway...');

    const timer1 = setTimeout(() => {
      setProcessingStep('Authorizing matrimonial upgrade transaction with bank...');
    }, 600);

    const timer2 = setTimeout(() => {
      setProcessingStep('Generating verified TeluguBandham transaction token...');
    }, 1200);

    const timer3 = setTimeout(async () => {
      if (simulateFailure) {
        setViewState('failed');
        showToast("⚠️ Demo payment was declined in simulated failure mode.", "error");
        return;
      }

      const generatedTxId = `TXN-TB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const upgradedPlanName = plan.name || 'Gold Member';
      const durationDays = plan.period?.includes('12') ? 365 : plan.period?.includes('6') ? 180 : 90;
      const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const resultPayload = {
        txId: generatedTxId,
        orderId,
        amount: finalPrice,
        planName: upgradedPlanName,
        duration: plan.period || '3 Months',
        paymentMethod: paymentChannelName,
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Membership Activated'
      };

      // 1. Update user in AuthContext & session
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
          await createMembershipTransaction(user.id, plan, paymentChannelName);
        }
      } catch (err) {
        console.warn("Failed to persist upgrade in background IndexedDB:", err);
      }

      setTransactionResult(resultPayload);
      setViewState('success');

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

  // Submit Handler
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
      // Open simulated OTP modal
      setIsOtpModalOpen(true);
    } else if (activeTab === 'qr') {
      executePaymentSimulation('UPI Dynamic QR Scan');
    }
  };

  // Confirm OTP simulation
  const handleConfirmOtp = () => {
    setOtpError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the demo OTP.');
      return;
    }
    setIsOtpModalOpen(false);
    const cardBrandLabel = detectedCardNetwork.toUpperCase();
    executePaymentSimulation(`${cardBrandLabel} Card (...${cardNumber.slice(-4)})`);
  };

  // Check if form is valid to enable button
  const isSubmitDisabled = useMemo(() => {
    if (activeTab === 'upi') {
      if (upiSubMode === 'id') return !upiId.trim() || !isUpiVerified;
      return !selectedUpiApp;
    }
    if (activeTab === 'card') {
      const rawNum = cardNumber.replace(/\s/g, '');
      return rawNum.length < 15 || !cardExpiry || !cardCvv || !cardHolder.trim();
    }
    return false;
  }, [activeTab, upiSubMode, upiId, isUpiVerified, selectedUpiApp, cardNumber, cardExpiry, cardCvv, cardHolder]);

  return (
    <div className="demo-pay-page-wrapper">
      <div className="demo-pay-container">

        {/* 1. TOP HEADER & TRUST PILL */}
        <header className="demo-pay-header">
          <div className="demo-pay-top-nav">
            <button
              type="button"
              className="demo-pay-back-btn"
              onClick={() => navigate('/membership')}
              aria-label="Back to Membership Plans"
            >
              <ArrowLeft size={15} />
              <span>Back to Membership</span>
            </button>

            <div className="demo-gateway-pill">
              <span className="demo-live-dot" aria-hidden="true"></span>
              <ShieldCheck size={14} />
              <span>SECURE DEMO GATEWAY</span>
            </div>
          </div>

          <div className="demo-pay-title-group">
            <h1 className="demo-pay-main-title">Complete Your Membership Upgrade</h1>
            <p className="demo-pay-subtitle">
              Choose your simulated payment channel below to activate your premium matrimonial benefits.
            </p>

            <div className="demo-notice-alert" role="status">
              <div className="demo-notice-text">
                <strong>Simulated Test Environment:</strong> All payments and upgrades are interactive simulations. No real money or credit card is charged.
              </div>
            </div>
          </div>
        </header>

        {/* 2. PROCESSING STATE VIEW */}
        {viewState === 'processing' && (
          <div className="demo-processing-overlay" role="status" aria-live="polite">
            <div className="demo-pulse-spinner"></div>
            <h2 className="demo-processing-title">Processing Demo Payment</h2>
            <p className="demo-processing-step">{processingStep}</p>
            <div className="demo-processing-security-tag">
              <Lock size={13} /> 256-Bit Matrimonial Payment Encryption
            </div>
          </div>
        )}

        {/* 3. SUCCESS STATE VIEW */}
        {viewState === 'success' && transactionResult && (
          <div className="demo-success-card" role="region" aria-label="Payment Receipt">
            <div className="demo-success-icon-wrap" aria-hidden="true">
              <CheckCircle2 size={46} color="#059669" />
            </div>

            <h2 className="demo-success-title">Payment Successful!</h2>
            <p className="demo-success-subtitle">
              Congratulations! Your TeluguBandham <strong>{transactionResult.planName}</strong> has been activated for the current session.
            </p>

            <div className="demo-receipt-box">
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Membership Plan:</span>
                <span className="demo-receipt-val highlight">{transactionResult.planName}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Duration:</span>
                <span className="demo-receipt-val">{transactionResult.duration}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Amount Paid:</span>
                <span className="demo-receipt-val">₹{transactionResult.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Payment Channel:</span>
                <span className="demo-receipt-val">{transactionResult.paymentMethod}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Transaction ID:</span>
                <span className="demo-receipt-val" style={{ fontFamily: 'monospace' }}>{transactionResult.txId}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Order Reference:</span>
                <span className="demo-receipt-val" style={{ fontFamily: 'monospace' }}>{transactionResult.orderId}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Status:</span>
                <span className="demo-receipt-val" style={{ color: '#059669' }}>✓ {transactionResult.status}</span>
              </div>
              <div className="demo-receipt-row">
                <span className="demo-receipt-label">Date & Time:</span>
                <span className="demo-receipt-val">{transactionResult.date}</span>
              </div>
            </div>

            <div className="demo-success-actions">
              <Link to="/dashboard" className="demo-btn-primary">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/membership" className="demo-btn-secondary">
                View Membership Status
              </Link>
            </div>
          </div>
        )}

        {/* 4. FAILED STATE VIEW */}
        {viewState === 'failed' && (
          <div className="demo-failure-card" role="region" aria-label="Payment Declined">
            <div className="demo-failure-icon-wrap" aria-hidden="true">
              <X size={44} color="#DC2626" />
            </div>

            <h2 className="demo-failure-title">Payment Declined (Simulated)</h2>
            <p className="demo-failure-desc">
              The simulated transaction was rejected because test failure mode was enabled. No charges were made.
            </p>

            <div className="demo-success-actions">
              <button
                type="button"
                className="demo-btn-primary"
                onClick={() => {
                  setSimulateFailure(false);
                  setViewState('checkout');
                }}
              >
                <RefreshCw size={16} /> Retry Payment
              </button>
              <button
                type="button"
                className="demo-btn-secondary"
                onClick={() => {
                  setSimulateFailure(false);
                  setActiveTab('upi');
                  setViewState('checkout');
                }}
              >
                Change Payment Method
              </button>
              <Link to="/membership" className="demo-btn-secondary" style={{ border: 'none', color: '#6B7280' }}>
                Cancel & Return
              </Link>
            </div>
          </div>
        )}

        {/* 5. CHECKOUT MAIN FORM VIEW */}
        {viewState === 'checkout' && (
          <div className="demo-pay-grid">

            {/* Left Column: Interactive Payment Selector and Forms */}
            <div className="demo-pay-card">
              <div className="demo-pay-card-header">
                <h2 className="demo-pay-section-heading">
                  <CreditCard size={20} color="#7A1635" /> Select Payment Method
                </h2>
                <p className="demo-pay-section-sub">
                  Choose your preferred simulated gateway channel to test.
                </p>
              </div>

              {/* TABS */}
              <div className="demo-pay-tabs" role="tablist">
                <button
                  type="button"
                  className={`demo-pay-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upi')}
                  role="tab"
                  aria-selected={activeTab === 'upi'}
                >
                  <span className="demo-tab-badge">FAST</span>
                  <div className="demo-pay-tab-icon">
                    <img src={upiSvg} alt="UPI" />
                  </div>
                  <span>UPI Payments</span>
                </button>

                <button
                  type="button"
                  className={`demo-pay-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                  onClick={() => setActiveTab('card')}
                  role="tab"
                  aria-selected={activeTab === 'card'}
                >
                  <div className="demo-pay-tab-icon">
                    <CreditCard size={22} color={activeTab === 'card' ? '#7A1635' : '#5A5751'} />
                  </div>
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  className={`demo-pay-tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
                  onClick={() => setActiveTab('qr')}
                  role="tab"
                  aria-selected={activeTab === 'qr'}
                >
                  <div className="demo-pay-tab-icon">
                    <QrCode size={22} color={activeTab === 'qr' ? '#7A1635' : '#5A5751'} />
                  </div>
                  <span>Scan QR Code</span>
                </button>
              </div>

              {/* TAB 1: UPI PAYMENTS */}
              {activeTab === 'upi' && (
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      className={`demo-preset-pill ${upiSubMode === 'apps' ? 'selected' : ''}`}
                      style={{
                        background: upiSubMode === 'apps' ? '#7A1635' : '#FAF7F2',
                        color: upiSubMode === 'apps' ? '#FFFFFF' : '#5B1229'
                      }}
                      onClick={() => setUpiSubMode('apps')}
                    >
                      <Smartphone size={12} style={{ display: 'inline', marginRight: '4px' }} /> Quick UPI Apps
                    </button>
                    <button
                      type="button"
                      className={`demo-preset-pill ${upiSubMode === 'id' ? 'selected' : ''}`}
                      style={{
                        background: upiSubMode === 'id' ? '#7A1635' : '#FAF7F2',
                        color: upiSubMode === 'id' ? '#FFFFFF' : '#5B1229'
                      }}
                      onClick={() => setUpiSubMode('id')}
                    >
                      <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Enter UPI ID
                    </button>
                  </div>

                  {upiSubMode === 'apps' && (
                    <div className="demo-upi-apps-grid" role="radiogroup">
                      {/* Google Pay */}
                      <div
                        className={`demo-upi-app-tile ${selectedUpiApp === 'gpay' ? 'selected' : ''}`}
                        onClick={() => setSelectedUpiApp('gpay')}
                        role="radio"
                        aria-checked={selectedUpiApp === 'gpay'}
                      >
                        <div className="demo-upi-app-logo">
                          <img src={googlePaySvg} alt="Google Pay" />
                        </div>
                        <div className="demo-upi-app-meta">
                          <span className="demo-upi-app-title">Google Pay</span>
                          <span className="demo-upi-app-desc">Instant 1-Click Demo Pay</span>
                        </div>
                        <div className="demo-radio-dot">
                          {selectedUpiApp === 'gpay' && <div className="demo-radio-dot-inner" />}
                        </div>
                      </div>

                      {/* PhonePe */}
                      <div
                        className={`demo-upi-app-tile ${selectedUpiApp === 'phonepe' ? 'selected' : ''}`}
                        onClick={() => setSelectedUpiApp('phonepe')}
                        role="radio"
                        aria-checked={selectedUpiApp === 'phonepe'}
                      >
                        <div className="demo-upi-app-logo">
                          <SiPhonepe color="#5F259F" size={24} />
                        </div>
                        <div className="demo-upi-app-meta">
                          <span className="demo-upi-app-title">PhonePe</span>
                          <span className="demo-upi-app-desc">Fast UPI Authorization</span>
                        </div>
                        <div className="demo-radio-dot">
                          {selectedUpiApp === 'phonepe' && <div className="demo-radio-dot-inner" />}
                        </div>
                      </div>

                      {/* Paytm */}
                      <div
                        className={`demo-upi-app-tile ${selectedUpiApp === 'paytm' ? 'selected' : ''}`}
                        onClick={() => setSelectedUpiApp('paytm')}
                        role="radio"
                        aria-checked={selectedUpiApp === 'paytm'}
                      >
                        <div className="demo-upi-app-logo">
                          <img src={paytmSvg} alt="Paytm" />
                        </div>
                        <div className="demo-upi-app-meta">
                          <span className="demo-upi-app-title">Paytm UPI</span>
                          <span className="demo-upi-app-desc">Instant Bank Transfer</span>
                        </div>
                        <div className="demo-radio-dot">
                          {selectedUpiApp === 'paytm' && <div className="demo-radio-dot-inner" />}
                        </div>
                      </div>

                      {/* BHIM UPI */}
                      <div
                        className={`demo-upi-app-tile ${selectedUpiApp === 'bhim' ? 'selected' : ''}`}
                        onClick={() => setSelectedUpiApp('bhim')}
                        role="radio"
                        aria-checked={selectedUpiApp === 'bhim'}
                      >
                        <div className="demo-upi-app-logo">
                          <BhimOfficialLogo />
                        </div>
                        <div className="demo-upi-app-meta">
                          <span className="demo-upi-app-title">BHIM UPI</span>
                          <span className="demo-upi-app-desc">NPCI Official Network</span>
                        </div>
                        <div className="demo-radio-dot">
                          {selectedUpiApp === 'bhim' && <div className="demo-radio-dot-inner" />}
                        </div>
                      </div>
                    </div>
                  )}

                  {upiSubMode === 'id' && (
                    <div className="demo-field-group">
                      <div className="demo-field-label">
                        <span>Virtual Payment Address (UPI ID)</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#8A6D3B' }}>
                          e.g. member@okaxis
                        </span>
                      </div>

                      <div className="demo-input-wrapper">
                        <input
                          type="text"
                          placeholder="Enter your UPI ID (e.g. yourname@oksbi)"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setIsUpiVerified(false);
                            setUpiError('');
                          }}
                          className={`demo-text-input ${upiError ? 'has-error' : ''}`}
                        />

                        {isUpiVerified ? (
                          <div className="demo-verified-indicator">
                            <CheckCircle2 size={15} color="#059669" /> Verified
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="demo-input-action-btn"
                            onClick={handleVerifyUpi}
                            disabled={!upiId.trim() || isVerifyingUpi}
                          >
                            {isVerifyingUpi ? <RefreshCw size={12} className="tb-spin" /> : 'Verify UPI'}
                          </button>
                        )}
                      </div>

                      {upiError && (
                        <div className="demo-field-error">
                          <AlertTriangle size={13} /> {upiError}
                        </div>
                      )}

                      {/* Quick fill buttons */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#7A756F', alignSelf: 'center' }}>Test IDs:</span>
                        {['telugu.member@okhdfcbank', 'bride.groom@ybl', 'telugubandham@icici'].map((demoVpa) => (
                          <button
                            key={demoVpa}
                            type="button"
                            className="demo-preset-pill"
                            onClick={() => {
                              setUpiId(demoVpa);
                              setIsUpiVerified(true);
                              setUpiError('');
                            }}
                          >
                            {demoVpa}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div>
                  {/* Card Visual Preview Bar */}
                  <div className="demo-card-preview-bar">
                    <div className="demo-card-preview-top">
                      <div className="demo-card-chip"></div>
                      <span className="demo-card-network-name">
                        {detectedCardNetwork.toUpperCase()}
                      </span>
                    </div>

                    <div className="demo-card-preview-num">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="demo-card-preview-bottom">
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>CARDHOLDER</div>
                        <div>{cardHolder || 'TELUGU MEMBER'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>EXPIRES</div>
                        <div>{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Presets */}
                  <div className="demo-card-presets-row">
                    <span style={{ fontSize: '0.775rem', color: '#7A756F', fontWeight: 600 }}>
                      Quick Test Cards:
                    </span>
                    <button
                      type="button"
                      className="demo-preset-pill"
                      onClick={() => handleApplyCardPreset('visa')}
                    >
                      💳 Visa Test
                    </button>
                    <button
                      type="button"
                      className="demo-preset-pill"
                      onClick={() => handleApplyCardPreset('mastercard')}
                    >
                      💳 Mastercard
                    </button>
                    <button
                      type="button"
                      className="demo-preset-pill"
                      onClick={() => handleApplyCardPreset('rupay')}
                    >
                      💳 RuPay
                    </button>
                  </div>

                  {/* Card Inputs */}
                  <div className="demo-field-group">
                    <label className="demo-field-label">Card Number</label>
                    <div className="demo-input-wrapper">
                      <input
                        type="text"
                        placeholder="4532 8901 2345 6789"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={`demo-text-input ${cardErrors.number ? 'has-error' : ''}`}
                        maxLength={19}
                      />
                    </div>
                    {cardErrors.number && <div className="demo-field-error">{cardErrors.number}</div>}
                  </div>

                  <div className="demo-grid-2col">
                    <div className="demo-field-group">
                      <label className="demo-field-label">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        className={`demo-text-input ${cardErrors.expiry ? 'has-error' : ''}`}
                        maxLength={5}
                      />
                      {cardErrors.expiry && <div className="demo-field-error">{cardErrors.expiry}</div>}
                    </div>

                    <div className="demo-field-group">
                      <label className="demo-field-label">CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                          if (cardErrors.cvv) setCardErrors((prev) => ({ ...prev, cvv: '' }));
                        }}
                        className={`demo-text-input ${cardErrors.cvv ? 'has-error' : ''}`}
                        maxLength={4}
                      />
                      {cardErrors.cvv && <div className="demo-field-error">{cardErrors.cvv}</div>}
                    </div>
                  </div>

                  <div className="demo-field-group">
                    <label className="demo-field-label">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name as printed on card"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        if (cardErrors.holder) setCardErrors((prev) => ({ ...prev, holder: '' }));
                      }}
                      className={`demo-text-input ${cardErrors.holder ? 'has-error' : ''}`}
                    />
                    {cardErrors.holder && <div className="demo-field-error">{cardErrors.holder}</div>}
                  </div>
                </div>
              )}

              {/* TAB 3: QR CODE */}
              {activeTab === 'qr' && (
                <div className="demo-qr-container">
                  <div className="demo-qr-card-frame">
                    <span className="demo-qr-badge">DEMO UPI QR</span>
                    <QrCode size={130} color="#5B1229" />
                  </div>

                  <div className="demo-qr-details">
                    <span style={{ fontSize: '0.8rem', color: '#7A756F' }}>Payable to TeluguBandham Matrimony</span>
                    <div className="demo-qr-amount-callout">
                      ₹{finalPrice.toLocaleString('en-IN')}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.825rem' }}>
                      Scan using Google Pay, PhonePe, Paytm or any BHIM UPI app on your smartphone, or click the simulate button below.
                    </p>
                  </div>
                </div>
              )}

              {/* SIMULATE FAILURE SWITCH FOR THOROUGH TESTING */}
              <div className="demo-simulation-toggle-row">
                <span className="demo-toggle-label">
                  🧪 Test Mode: Simulate Payment Failure (For QA testing)
                </span>
                <label className="demo-switch" title="Toggle to simulate a bank decline">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                  />
                  <span className="demo-switch-slider"></span>
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                className="demo-pay-submit-btn"
                onClick={handleInitiatePayment}
                disabled={isSubmitDisabled}
              >
                <span>
                  {activeTab === 'card' ? 'Proceed to 3D Secure OTP' : `Authorize ₹${finalPrice.toLocaleString('en-IN')} Demo Payment`}
                </span>
              </button>
            </div>

            {/* Right Column: Plan Order Summary */}
            <aside className="demo-summary-card">
              <div className="demo-summary-header">
                <h3 className="demo-summary-title">Order Summary</h3>
                <span className="demo-summary-order-id">Ref: {orderId}</span>
              </div>

              <div className="demo-plan-overview-box">
                <div className="demo-plan-overview-top">
                  <span className="demo-plan-name-tag">{plan.name}</span>
                  <span className="demo-plan-period-tag">{plan.period || '3 Months'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7A756F' }}>
                  Telugu Matrimonial Premium Access
                </div>
              </div>

              <div className="demo-price-breakdown">
                <div className="demo-price-row">
                  <span>Plan Base Fee</span>
                  <span>₹{(plan.price || 3499).toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="demo-price-row discount">
                    <span>Discount ({appliedCoupon || 'Coupon'})</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="demo-price-row">
                  <span>Processing Fee / GST</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>₹0 (FREE)</span>
                </div>

                <div className="demo-price-row total">
                  <span>Total Amount</span>
                  <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="demo-security-checklist">
                <div className="demo-security-item">
                  <ShieldCheck size={14} color="#059669" />
                  <span>Instant Account & Contact Upgrade</span>
                </div>
                <div className="demo-security-item">
                  <Lock size={14} color="#059669" />
                  <span>PCI-DSS 256-Bit Test Protocol</span>
                </div>
                <div className="demo-security-item">
                  <CheckCircle2 size={14} color="#059669" />
                  <span>100% Privacy & Zero Real Charge</span>
                </div>
              </div>
            </aside>

          </div>
        )}

        {/* 6. SIMULATED 3D-SECURE OTP MODAL (For Card Flow) */}
        {isOtpModalOpen && (
          <div className="demo-otp-backdrop" role="dialog" aria-modal="true">
            <div className="demo-otp-card">
              <div className="demo-otp-badge">
                <Lock size={12} /> 3D-SECURE DEMO BANK OTP
              </div>

              <h3 className="demo-otp-title">Enter Authentication OTP</h3>
              <p className="demo-otp-sub">
                A simulated OTP has been sent for <strong>₹{finalPrice.toLocaleString('en-IN')}</strong> to your registered mobile number.
              </p>

              <div className="demo-otp-input-row">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newDigits = [...otpDigits];
                      newDigits[idx] = val;
                      setOtpDigits(newDigits);
                      if (val && e.target.nextSibling) {
                        e.target.nextSibling.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpDigits[idx] && e.target.previousSibling) {
                        e.target.previousSibling.focus();
                      }
                    }}
                    className="demo-otp-char-input"
                  />
                ))}
              </div>

              {otpError && (
                <div className="demo-field-error" style={{ justifyContent: 'center', marginBottom: '10px' }}>
                  <AlertTriangle size={13} /> {otpError}
                </div>
              )}

              <div className="demo-otp-actions">
                <button
                  type="button"
                  className="demo-pay-submit-btn"
                  style={{ margin: 0 }}
                  onClick={handleConfirmOtp}
                >
                  Confirm & Complete Upgrade
                </button>

                <button
                  type="button"
                  className="demo-btn-secondary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setIsOtpModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
