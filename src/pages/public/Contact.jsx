import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  MessageCircle,
  ShieldCheck,
  Crown,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import '../../styles/pages.css';

// Accurate, high-resolution SVG Flags for top Telugu NRI & Domestic Destinations
const CountryFlag = ({ code, size = 18 }) => {
  const width = size;
  const height = Math.round(size * 0.72);
  const flagStyle = {
    borderRadius: '2px',
    boxShadow: '0 0 1px rgba(0,0,0,0.3)',
    flexShrink: 0,
    verticalAlign: 'middle',
    display: 'inline-block'
  };

  switch (code) {
    case '+91': // India
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#ff9933" d="M0 0h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <path fill="#128807" d="M0 320h640v160H0z" />
          <g transform="translate(320 240) scale(.8)">
            <circle r="40" fill="none" stroke="#000088" strokeWidth="6" />
            <circle r="8" fill="#000088" />
            <path stroke="#000088" strokeWidth="3" d="M0-40V40M-40 0H40M-28-28l56 56M-28 28 28-28" />
          </g>
        </svg>
      );

    case '+1': // USA
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#bd3d44" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="37" d="M0 55h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640" />
          <path fill="#192f5d" d="M0 0h280v260H0z" />
          <circle cx="50" cy="50" r="10" fill="#fff" />
          <circle cx="110" cy="50" r="10" fill="#fff" />
          <circle cx="170" cy="50" r="10" fill="#fff" />
          <circle cx="230" cy="50" r="10" fill="#fff" />
          <circle cx="80" cy="100" r="10" fill="#fff" />
          <circle cx="140" cy="100" r="10" fill="#fff" />
          <circle cx="200" cy="100" r="10" fill="#fff" />
          <circle cx="50" cy="150" r="10" fill="#fff" />
          <circle cx="110" cy="150" r="10" fill="#fff" />
          <circle cx="170" cy="150" r="10" fill="#fff" />
          <circle cx="230" cy="150" r="10" fill="#fff" />
          <circle cx="80" cy="200" r="10" fill="#fff" />
          <circle cx="140" cy="200" r="10" fill="#fff" />
          <circle cx="200" cy="200" r="10" fill="#fff" />
        </svg>
      );

    case '+44': // UK
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M640 0 0 480" />
          <path stroke="#c8102e" strokeWidth="36" d="m0 0 640 480M640 0 0 480" />
          <path stroke="#fff" strokeWidth="100" d="M0 240h640M320 0v480" />
          <path stroke="#c8102e" strokeWidth="60" d="M0 240h640M320 0v480" />
        </svg>
      );

    case '+61': // Australia
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#00008b" d="M0 0h640v480H0z" />
          <g transform="scale(0.5)">
            <path fill="#012169" d="M0 0h640v480H0z" />
            <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M640 0 0 480" />
            <path stroke="#c8102e" strokeWidth="36" d="m0 0 640 480M640 0 0 480" />
            <path stroke="#fff" strokeWidth="100" d="M0 240h640M320 0v480" />
            <path stroke="#c8102e" strokeWidth="60" d="M0 240h640M320 0v480" />
          </g>
          <polygon points="480,120 488,140 510,140 492,152 498,172 480,160 462,172 468,152 450,140 472,140" fill="#fff" transform="scale(0.7) translate(180, 20)" />
          <polygon points="480,120 488,140 510,140 492,152 498,172 480,160 462,172 468,152 450,140 472,140" fill="#fff" transform="scale(0.5) translate(450, 420)" />
        </svg>
      );

    case '+971': // UAE
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#00732f" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#000" d="M0 320h640v160H0z" />
          <path fill="#f00" d="M0 0h160v480H0z" />
        </svg>
      );

    case '+65': // Singapore
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#ed2939" d="M0 0h640v240H0z" />
          <path fill="#fff" d="M0 240h640v240H0z" />
          <circle cx="160" cy="120" r="60" fill="#fff" />
          <circle cx="180" cy="120" r="54" fill="#ed2939" />
          <circle cx="210" cy="100" r="10" fill="#fff" />
          <circle cx="230" cy="120" r="10" fill="#fff" />
          <circle cx="210" cy="140" r="10" fill="#fff" />
          <circle cx="190" cy="130" r="10" fill="#fff" />
          <circle cx="190" cy="110" r="10" fill="#fff" />
        </svg>
      );

    case '+49': // Germany
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#000" d="M0 0h640v160H0z" />
          <path fill="#d00" d="M0 160h640v160H0z" />
          <path fill="#ffce00" d="M0 320h640v160H0z" />
        </svg>
      );

    case '+966': // Saudi Arabia
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#006c35" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="8" d="M180 340h280M460 340l-30-20M460 340l-30 20" />
          <circle cx="320" cy="200" r="40" fill="none" stroke="#fff" strokeWidth="6" />
        </svg>
      );

    case '+64': // New Zealand
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#00008b" d="M0 0h640v480H0z" />
          <g transform="scale(0.5)">
            <path fill="#012169" d="M0 0h640v480H0z" />
            <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M640 0 0 480" />
            <path stroke="#c8102e" strokeWidth="36" d="m0 0 640 480M640 0 0 480" />
            <path stroke="#fff" strokeWidth="100" d="M0 240h640M320 0v480" />
            <path stroke="#c8102e" strokeWidth="60" d="M0 240h640M320 0v480" />
          </g>
          <polygon points="480,120 488,140 510,140 492,152 498,172 480,160 462,172 468,152 450,140 472,140" fill="#f00" stroke="#fff" strokeWidth="4" transform="scale(0.6) translate(300, 200)" />
        </svg>
      );

    case '+60': // Malaysia
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#cc0000" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="34" d="M0 51h640M0 119h640M0 187h640M0 255h640M0 323h640M0 391h640M0 459h640" />
          <path fill="#000066" d="M0 0h320v240H0z" />
          <circle cx="160" cy="120" r="60" fill="#fc0" />
          <circle cx="180" cy="120" r="50" fill="#000066" />
        </svg>
      );

    case '+974': // Qatar
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#8d1b3d" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M0 0h180l40 27-40 26 40 27-40 27 40 26-40 27 40 27-40 27 40 26-40 27 40 27-40 27 40 26-40 27 40 27-40 27H0z" />
        </svg>
      );

    case '+965': // Kuwait
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#007a3d" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#ce1126" d="M0 320h640v160H0z" />
          <polygon points="0,0 160,160 160,320 0,480" fill="#000" />
        </svg>
      );

    default:
      return (
        <svg width={width} height={height} viewBox="0 0 640 480" style={flagStyle}>
          <path fill="#ff9933" d="M0 0h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <path fill="#128807" d="M0 320h640v160H0z" />
        </svg>
      );
  }
};

const COUNTRY_CODES = [
  { code: '+91', digits: 10, placeholder: '98765 43210' },
  { code: '+1', digits: 10, placeholder: '202 555 0123' },
  { code: '+44', digits: 10, placeholder: '7911 123456' },
  { code: '+61', digits: 9, placeholder: '412 345 678' },
  { code: '+971', digits: 9, placeholder: '50 123 4567' },
  { code: '+65', digits: 8, placeholder: '8123 4567' },
  { code: '+49', digits: 10, placeholder: '151 23456789' },
  { code: '+966', digits: 9, placeholder: '50 123 4567' },
  { code: '+64', digits: 9, placeholder: '21 123 4567' },
  { code: '+60', digits: 9, placeholder: '12 345 6789' },
  { code: '+974', digits: 8, placeholder: '3312 3456' },
  { code: '+965', digits: 8, placeholder: '5123 4567' }
];

// Authentic WhatsApp Brand SVG Icon
const WhatsAppIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 3.67C14.24 3.67 16.31 4.53 17.87 6.09C19.42 7.64 20.28 9.71 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.31 19.8 8.12 19.09L7.84 18.92L4.72 19.74L5.55 16.7L5.36 16.4C4.58 15.16 4.17 13.72 4.17 11.91C4.17 7.37 7.87 3.67 12.04 3.67ZM8.83 7.35C8.65 7.35 8.35 7.42 8.11 7.68C7.86 7.94 7.18 8.58 7.18 9.88C7.18 11.19 8.13 12.44 8.26 12.62C8.39 12.79 10.11 15.45 12.75 16.58C13.38 16.85 13.86 17.01 14.25 17.13C14.88 17.33 15.45 17.3 15.9 17.23C16.41 17.15 17.47 16.59 17.69 15.97C17.91 15.35 17.91 14.82 17.84 14.71C17.77 14.6 17.6 14.53 17.34 14.4C17.08 14.27 15.82 13.65 15.58 13.56C15.35 13.48 15.18 13.43 15.01 13.69C14.84 13.95 14.35 14.53 14.2 14.71C14.05 14.88 13.9 14.9 13.64 14.77C13.38 14.64 12.54 14.37 11.55 13.48C10.78 12.79 10.26 11.94 10.11 11.68C9.96 11.42 10.09 11.28 10.22 11.15C10.34 11.03 10.49 10.84 10.62 10.69C10.75 10.54 10.79 10.43 10.88 10.26C10.97 10.08 10.92 9.93 10.86 9.8C10.79 9.67 10.29 8.44 10.07 7.93C9.87 7.43 9.65 7.5 9.49 7.49C9.33 7.48 9.16 7.48 8.98 7.48C8.81 7.48 8.83 7.35 8.83 7.35Z" />
  </svg>
);

const REGIONAL_HUBS = [
  {
    city: "Hyderabad (Headquarters)",
    state: "Telangana",
    address: "Level 4, Cyber Towers, Hitec City, Madhapur, Hyderabad, TS 500081",
    phone: "+91 98765 43210",
    landline: "040-67890123",
    email: "hyderabad@telugubandham.com",
    hours: "9:00 AM – 8:00 PM IST"
  },
  {
    city: "Visakhapatnam Regional Hub",
    state: "Andhra Pradesh",
    address: "Plot 12, Sector 3, MVP Colony, Visakhapatnam, AP 530017",
    phone: "+91 98765 43211",
    landline: "0891-2345678",
    email: "vizag@telugubandham.com",
    hours: "9:30 AM – 7:30 PM IST"
  },
  {
    city: "Vijayawada Regional Office",
    state: "Andhra Pradesh",
    address: "Opp. PVP Square Mall, MG Road, Benz Circle, Vijayawada, AP 520010",
    phone: "+91 98765 43212",
    landline: "0866-3456789",
    email: "vijayawada@telugubandham.com",
    hours: "9:30 AM – 7:30 PM IST"
  }
];

const CONTACT_FAQS = [
  {
    id: "c-faq-1",
    question: "What is the fastest way to get help?",
    answer: "Our Telugu phone helpline (+91 98765 43210) and WhatsApp support are active 7 days a week from 9:00 AM to 9:00 PM IST with an average response time of under 15 minutes."
  },
  {
    id: "c-faq-2",
    question: "Can I visit a regional hub in person for profile onboarding?",
    answer: "Yes, our relationship advisors at our Hyderabad, Visakhapatnam, and Vijayawada centers welcome walk-in visits for in-person document verification, assisted profile registration, and horoscope matching consultations."
  },
  {
    id: "c-faq-3",
    question: "How do I report a suspicious profile or safety concern?",
    answer: "You can report any profile directly using the 'Report Profile' button on their page, or select 'Trust and Safety Report' in the contact form above. Safety reports are audited by our moderation team within 2 hours."
  }
];

export default function Contact() {
  const { showToast } = useApp();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    otherCategory: '',
    message: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    category: false,
    otherCategory: false,
    message: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [activeHubIndex, setActiveHubIndex] = useState(0);

  // Close country dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Field Validation Helper
  const validateField = (field, value = '', country = selectedCountry, currentFormData = formData) => {
    const val = (value || '').toString();
    const currentCountry = country || COUNTRY_CODES[0];

    switch (field) {
      case 'name':
        if (!val.trim()) return 'Full name is required';
        if (val.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s.-]+$/.test(val)) return 'Name can only contain letters and spaces';
        return null;

      case 'phone':
        if (!val) return 'Mobile number is required';
        if (currentCountry.code === '+91') {
          if (val.length !== 10) return 'Enter exactly 10 digits';
          if (!/^[6-9]/.test(val)) return 'Number must start with 6, 7, 8, or 9';
        } else {
          if (val.length < (currentCountry.digits || 10) - 1 || val.length > (currentCountry.digits || 10) + 1) {
            return `Enter a valid ${currentCountry.digits || 10}-digit number`;
          }
        }
        return null;

      case 'email':
        if (!val.trim()) return 'Email address is required';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim())) {
          return 'Enter a valid email address';
        }
        return null;

      case 'category':
        if (!val) return 'Please select an inquiry category';
        return null;

      case 'otherCategory':
        if (currentFormData.category === 'Other') {
          if (!val.trim()) return 'Please describe your specific topic or issue';
          if (val.trim().length < 3) return 'Description must be at least 3 characters';
        }
        return null;

      case 'message':
        if (!val.trim()) return 'Message details are required';
        if (val.trim().length < 10) return 'Message must be at least 10 characters';
        return null;

      default:
        return null;
    }
  };

  const handleNameChange = (e) => {
    const cleanValue = e.target.value.replace(/[^a-zA-Z\s.-]/g, '').slice(0, 50);
    setFormData((prev) => ({ ...prev, name: cleanValue }));
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateField('name', cleanValue) }));
    }
  };

  const handlePhoneChange = (e) => {
    // Strictly restrict to digits and max digits for selected country
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.digits);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    if (touched.phone) {
      setErrors((prev) => ({ ...prev, phone: validateField('phone', digitsOnly, selectedCountry) }));
    }
  };

  const handleEmailChange = (e) => {
    const cleanValue = e.target.value.trimStart().slice(0, 80);
    setFormData((prev) => ({ ...prev, email: cleanValue }));
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateField('email', cleanValue) }));
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const nextFormData = {
      ...formData,
      category: val,
      otherCategory: val === 'Other' ? formData.otherCategory : ''
    };
    setFormData(nextFormData);

    if (touched.category) {
      setErrors((prev) => ({
        ...prev,
        category: validateField('category', val),
        otherCategory: val === 'Other' ? validateField('otherCategory', nextFormData.otherCategory, selectedCountry, nextFormData) : null
      }));
    }
  };

  const handleOtherCategoryChange = (e) => {
    const val = e.target.value.slice(0, 100);
    const nextFormData = { ...formData, otherCategory: val };
    setFormData(nextFormData);
    if (touched.otherCategory) {
      setErrors((prev) => ({ ...prev, otherCategory: validateField('otherCategory', val, selectedCountry, nextFormData) }));
    }
  };

  const handleMessageChange = (e) => {
    const val = e.target.value.slice(0, 1000);
    setFormData((prev) => ({ ...prev, message: val }));
    if (touched.message) {
      setErrors((prev) => ({ ...prev, message: validateField('message', val) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field] || '', selectedCountry, formData) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name || '', selectedCountry, formData),
      phone: validateField('phone', formData.phone || '', selectedCountry, formData),
      email: validateField('email', formData.email || '', selectedCountry, formData),
      category: validateField('category', formData.category || '', selectedCountry, formData),
      otherCategory: formData.category === 'Other' ? validateField('otherCategory', formData.otherCategory || '', selectedCountry, formData) : null,
      message: validateField('message', formData.message || '', selectedCountry, formData)
    };

    setTouched({
      name: true,
      phone: true,
      email: true,
      category: true,
      otherCategory: formData.category === 'Other',
      message: true
    });
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== null);
    if (hasErrors) {
      showToast("Please correct the errors in the form before submitting.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRef = `TB-CARE-${Math.floor(10000 + Math.random() * 90000)}`;
      setRefNumber(generatedRef);
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast("Message sent successfully! Our Telugu team will contact you shortly.", "success");
    }, 600);
  };

  const handleReset = () => {
    setSelectedCountry(COUNTRY_CODES[0]);
    setIsCountryOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: '',
      otherCategory: '',
      message: ''
    });
    setTouched({
      name: false,
      email: false,
      phone: false,
      category: false,
      otherCategory: false,
      message: false
    });
    setErrors({});
    setIsSubmitted(false);
  };

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="contact-page-wrapper">
      {/* 1. COMPACT HERO SECTION */}
      <section className="contact-hero-compact" aria-labelledby="contact-heading">
        <div className="container">
          <div className="contact-hero-content">
            <h1 id="contact-heading" className="contact-hero-title">
              Contact TeluguBandham
            </h1>
            <p className="contact-hero-subtitle">
              Our team of relationship advisors is here to assist you and your family every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTACT SECTION */}
      <section className="contact-main-section" aria-label="Contact Form and Regional Hubs">
        <div className="container">
          <div className="contact-main-grid">
            {/* Left Column: Contact Form */}
            <div className="contact-card contact-form-card">
              <div className="contact-card-header">
                <h2 className="contact-card-title">Send Us a Message</h2>
                <p className="contact-card-subtitle">
                  Fill in your details and our Telugu relationship advisors will get back to you promptly.
                </p>
              </div>

              {isSubmitted ? (
                <div className="contact-success-state" role="status">
                  <div className="contact-success-icon-wrap" aria-hidden="true">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="contact-success-title">Thank You for Reaching Out!</h3>
                  <p className="contact-success-desc">
                    Your enquiry has been logged with our customer care team. A relationship manager will call you within <strong>2 business hours</strong>.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <div className="contact-ref-badge" style={{ padding: '5px 12px', fontSize: '0.8125rem' }}>
                      <span>Reference ID:</span> <strong>{refNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn"
                      style={{
                        padding: '5px 14px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        borderRadius: '20px',
                        border: '1px solid var(--primary-700, #901B2C)',
                        color: 'var(--primary-700, #901B2C)',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary-700, #901B2C)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = 'var(--primary-700, #901B2C)';
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form" noValidate>
                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label htmlFor="contact-name" className="contact-form-label">
                        Full Name <span className="req-star">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        className={`contact-form-input ${errors.name && touched.name ? 'input-error' : ''}`}
                        value={formData.name}
                        onChange={handleNameChange}
                        onBlur={() => handleBlur('name')}
                        maxLength={50}
                        required
                        aria-invalid={!!(errors.name && touched.name)}
                      />
                      {errors.name && touched.name && (
                        <span className="contact-field-error" role="alert">{errors.name}</span>
                      )}
                    </div>

                    <div className="contact-form-group">
                      <div className="contact-label-flex">
                        <label htmlFor="contact-phone" className="contact-form-label">
                          Mobile Number <span className="req-star">*</span>
                        </label>
                        <span className="contact-counter-hint">{formData.phone.length}/{selectedCountry.digits} digits</span>
                      </div>
                      <div className={`phone-input-combo ${errors.phone && touched.phone ? 'combo-error' : ''}`}>
                        <div className="custom-country-picker-wrap" ref={countryDropdownRef}>
                          <button
                            type="button"
                            className={`custom-country-trigger ${isCountryOpen ? 'active' : ''}`}
                            onClick={() => setIsCountryOpen((prev) => !prev)}
                            aria-label="Select Country Code"
                            aria-expanded={isCountryOpen}
                          >
                            <CountryFlag code={selectedCountry.code} size={20} />
                            <span className="country-code-text">{selectedCountry.code}</span>
                            <ChevronDown size={12} className={`country-select-arrow ${isCountryOpen ? 'rotated' : ''}`} />
                          </button>

                          {isCountryOpen && (
                            <div className="custom-country-menu" role="listbox">
                              {COUNTRY_CODES.map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`custom-country-option ${selectedCountry.code === item.code ? 'selected' : ''}`}
                                  onClick={() => {
                                    setSelectedCountry(item);
                                    setIsCountryOpen(false);
                                    const trimmedPhone = formData.phone.slice(0, item.digits);
                                    setFormData((prev) => ({ ...prev, phone: trimmedPhone }));
                                    if (touched.phone) {
                                      setErrors((prev) => ({ ...prev, phone: validateField('phone', trimmedPhone, item) }));
                                    }
                                  }}
                                  role="option"
                                  aria-selected={selectedCountry.code === item.code}
                                >
                                  <CountryFlag code={item.code} size={20} />
                                  <span className="country-option-code">{item.code}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          id="contact-phone"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={selectedCountry.digits}
                          className="contact-form-input phone-number-input"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          onBlur={() => handleBlur('phone')}
                          required
                          aria-invalid={!!(errors.phone && touched.phone)}
                        />
                      </div>
                      {errors.phone && touched.phone && (
                        <span className="contact-field-error" role="alert">{errors.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label htmlFor="contact-email" className="contact-form-label">
                        Email Address <span className="req-star">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className={`contact-form-input ${errors.email && touched.email ? 'input-error' : ''}`}
                        value={formData.email}
                        onChange={handleEmailChange}
                        onBlur={() => handleBlur('email')}
                        maxLength={80}
                        required
                        aria-invalid={!!(errors.email && touched.email)}
                      />
                      {errors.email && touched.email && (
                        <span className="contact-field-error" role="alert">{errors.email}</span>
                      )}
                    </div>

                    <div className="contact-form-group">
                      <label htmlFor="contact-category" className="contact-form-label">
                        Inquiry Category <span className="req-star">*</span>
                      </label>
                      <select
                        id="contact-category"
                        className={`contact-form-select ${errors.category && touched.category ? 'input-error' : ''}`}
                        value={formData.category}
                        onChange={handleCategoryChange}
                        onBlur={() => handleBlur('category')}
                        required
                        aria-invalid={!!(errors.category && touched.category)}
                      >
                        <option value="">Select Inquiry Category</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Profile Verification Support">Profile Verification Support</option>
                        <option value="Membership and Billing">Membership and Billing</option>
                        <option value="Horoscope Compatibility Queries">Horoscope Compatibility Queries</option>
                        <option value="Trust and Safety Report">Trust and Safety Report</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.category && touched.category && (
                        <span className="contact-field-error" role="alert">{errors.category}</span>
                      )}
                    </div>
                  </div>

                  {/* Conditional Specification Field for "Other" Category */}
                  {formData.category === 'Other' && (
                    <div className="contact-form-group contact-other-category-wrap">
                      <div className="contact-label-flex">
                        <label htmlFor="contact-other-category" className="contact-form-label">
                          Specify Your Problem / Inquiry Topic <span className="req-star">*</span>
                        </label>
                        <span className="contact-counter-hint">{(formData.otherCategory || '').length}/100</span>
                      </div>
                      <input
                        id="contact-other-category"
                        type="text"
                        className={`contact-form-input ${errors.otherCategory && touched.otherCategory ? 'input-error' : ''}`}
                        value={formData.otherCategory}
                        onChange={handleOtherCategoryChange}
                        onBlur={() => handleBlur('otherCategory')}
                        maxLength={100}
                        required
                        aria-invalid={!!(errors.otherCategory && touched.otherCategory)}
                        autoFocus
                      />
                      {errors.otherCategory && touched.otherCategory && (
                        <span className="contact-field-error" role="alert">{errors.otherCategory}</span>
                      )}
                    </div>
                  )}

                  <div className="contact-form-group">
                    <div className="contact-label-flex">
                      <label htmlFor="contact-message" className="contact-form-label">
                        Message Details <span className="req-star">*</span>
                      </label>
                      <span className="contact-counter-hint">{formData.message.length}/1000</span>
                    </div>
                    <textarea
                      id="contact-message"
                      rows={4}
                      className={`contact-form-textarea ${errors.message && touched.message ? 'input-error' : ''}`}
                      value={formData.message}
                      onChange={handleMessageChange}
                      onBlur={() => handleBlur('message')}
                      maxLength={1000}
                      required
                      aria-invalid={!!(errors.message && touched.message)}
                    />
                    {errors.message && touched.message && (
                      <span className="contact-field-error" role="alert">{errors.message}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary contact-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Sending Message...</>
                    ) : (
                      <>
                        <Send size={16} aria-hidden="true" />
                        Submit Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Direct Helpline & Regional Hubs */}
            <div className="contact-right-column">
              {/* Direct Instant Helpline Card */}
              <div className="contact-direct-card">
                <div className="direct-card-top">
                  <span className="direct-card-tag">Dedicated Helpline</span>
                  <h3 className="direct-card-title">Direct Support and WhatsApp</h3>
                </div>

                <p className="direct-card-desc">
                  Speak directly with our Telugu relationship managers for priority support.
                </p>

                <div className="direct-actions-grid">
                  <a href="tel:+919876543210" className="direct-action-btn phone-action">
                    <div className="action-btn-icon">
                      <Phone size={18} />
                    </div>
                    <div className="action-btn-text">
                      <span className="action-label">Call Support</span>
                      <strong className="action-val">+91 98765 43210</strong>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="direct-action-btn whatsapp-action"
                  >
                    <div className="action-btn-icon">
                      <WhatsAppIcon size={18} />
                    </div>
                    <div className="action-btn-text">
                      <span className="action-label">WhatsApp Support</span>
                      <strong className="action-val">+91 98765 43210</strong>
                    </div>
                  </a>
                </div>

                <div className="direct-card-footer">
                  <div className="direct-footer-item">
                    <Clock size={15} className="direct-footer-icon" />
                    <span>Active 9:00 AM – 9:00 PM IST (All 7 Days)</span>
                  </div>
                  <div className="direct-footer-item">
                    <Mail size={15} className="direct-footer-icon" />
                    <a href="mailto:support@telugubandham.com">support@telugubandham.com</a>
                  </div>
                </div>
              </div>

              {/* Regional Hubs Header & Interactive Showcase */}
              <div className="regional-hubs-container">
                <div className="regional-hubs-header">
                  <h3 className="regional-hubs-title">Regional Hubs and Offices</h3>
                  <span className="regional-hubs-sub">Visit us for in-person support</span>
                </div>

                {/* City Selector Tabs */}
                <div className="hub-tabs-row" role="tablist" aria-label="Select Regional Office">
                  {REGIONAL_HUBS.map((hub, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`hub-tab-btn ${activeHubIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveHubIndex(idx)}
                      role="tab"
                      aria-selected={activeHubIndex === idx}
                    >
                      <MapPin size={13} className="hub-tab-icon" />
                      <span>{hub.city.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Active Hub Showcase Card */}
                <div className="hub-card hub-active-card">
                  <div className="hub-card-header">
                    <div>
                      <h4 className="hub-city-name">{REGIONAL_HUBS[activeHubIndex].city}</h4>
                      <span className="hub-state-tag">{REGIONAL_HUBS[activeHubIndex].state}</span>
                    </div>
                    <span className="hub-hours-badge">
                      <Clock size={12} /> {REGIONAL_HUBS[activeHubIndex].hours}
                    </span>
                  </div>

                  <div className="hub-details">
                    <div className="hub-detail-row">
                      <MapPin size={15} className="hub-icon" aria-hidden="true" />
                      <span className="hub-address-text">{REGIONAL_HUBS[activeHubIndex].address}</span>
                    </div>

                    <div className="hub-actions-row">
                      <a
                        href={`tel:${REGIONAL_HUBS[activeHubIndex].phone.replace(/[^0-9+]/g, '')}`}
                        className="hub-action-pill phone-pill"
                      >
                        <Phone size={13} />
                        <span>{REGIONAL_HUBS[activeHubIndex].phone}</span>
                      </a>
                      <a
                        href={`mailto:${REGIONAL_HUBS[activeHubIndex].email}`}
                        className="hub-action-pill mail-pill"
                      >
                        <Mail size={13} />
                        <span>{REGIONAL_HUBS[activeHubIndex].email}</span>
                      </a>
                    </div>

                    {REGIONAL_HUBS[activeHubIndex].landline && (
                      <div className="hub-landline-note">
                        <span>Office Desk: <strong>{REGIONAL_HUBS[activeHubIndex].landline}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK ASSISTANCE RESOLUTION PILLARS */}
      <section className="contact-pillars-section" aria-label="Quick Assistance Options">
        <div className="container">
          <div className="contact-pillars-grid">
            <Link to="/how-it-works" className="contact-pillar-card">
              <div className="pillar-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Profile and ID Verification</h3>
                <p className="pillar-desc">
                  Learn how our 100% manual document verification and government ID checks work.
                </p>
                <span className="pillar-link">
                  Learn How It Works <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            <Link to="/membership" className="contact-pillar-card">
              <div className="pillar-icon-wrap">
                <Crown size={22} />
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Plans and Upgrade Inquiries</h3>
                <p className="pillar-desc">
                  Explore Gold, Diamond, and VIP Elite matchmaking plans with transparent pricing.
                </p>
                <span className="pillar-link">
                  View Plans <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            <Link to="/safety-guidelines" className="contact-pillar-card">
              <div className="pillar-icon-wrap">
                <HelpCircle size={22} />
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">Safety and Fraud Protection</h3>
                <p className="pillar-desc">
                  Read our community standards, red flags to watch for, and reporting guidelines.
                </p>
                <span className="pillar-link">
                  Safety Guidelines <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CONTACT FAQS ACCORDION */}
      <section className="contact-faq-section" aria-labelledby="contact-faq-title">
        <div className="container">
          <div className="contact-faq-header">
            <h2 id="contact-faq-title" className="contact-faq-title">
              Common Support Questions
            </h2>
            <p className="contact-faq-desc">
              Quick answers to frequent support queries regarding response times, visits, and safety.
            </p>
          </div>

          <div className="contact-faq-accordion" role="region" aria-label="Support Questions">
            {CONTACT_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className={`membership-faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="membership-faq-trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`c-faq-ans-${faq.id}`}
                  >
                    <span className="membership-faq-question">{faq.question}</span>
                    <div className="membership-faq-icon" aria-hidden="true">
                      <ChevronDown size={17} />
                    </div>
                  </button>

                  <div
                    id={`c-faq-ans-${faq.id}`}
                    className={`membership-faq-answer-wrap ${isOpen ? 'show' : ''}`}
                  >
                    <div className="membership-faq-answer-inner">
                      <p className="membership-faq-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
