import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' }
];

export default function LanguageSwitcher({ variant = 'desktop', onSelect }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const currentLangCode = i18n.language === 'te' ? 'te' : 'en';
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation & Escape key handling
  useEffect(() => {
    function handleKeyDown(event) {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    if (onSelect) onSelect(langCode);
  };

  // Mobile Menu Variant: Clean, accessible side-by-side or stacked buttons
  if (variant === 'mobile') {
    return (
      <div className="mobile-language-switcher" role="region" aria-label={t('nav.language', 'Language')}>
        <div className="mobile-lang-header">
          <Globe size={15} className="mobile-lang-icon" aria-hidden="true" />
          <span className="mobile-lang-title">{t('nav.language', 'Language')}</span>
        </div>
        <div className="mobile-lang-options" role="radiogroup" aria-label="Select Language">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`mobile-lang-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                role="radio"
                aria-checked={isSelected}
              >
                <span className="mobile-lang-btn-text">{lang.nativeLabel}</span>
                {isSelected && <Check size={14} className="mobile-lang-check" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Dropdown Variant
  return (
    <div className="language-switcher-wrapper" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`lang-switcher-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change language, current is ${currentLang.nativeLabel}`}
      >
        <Globe size={15} className="lang-globe-icon" aria-hidden="true" />
        <span className="lang-current-label">{currentLang.nativeLabel}</span>
        <ChevronDown size={13} className={`lang-chevron-icon ${isOpen ? 'rotated' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="lang-dropdown-menu"
          role="listbox"
          aria-label={t('nav.language', 'Language')}
        >
          <div className="lang-dropdown-header">
            {t('nav.language', 'Language')}
          </div>
          <div className="lang-dropdown-divider" />
          <div className="lang-dropdown-list">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLangCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="lang-item-check-slot">
                    {isSelected ? (
                      <Check size={14} className="lang-item-check" aria-hidden="true" />
                    ) : (
                      <span className="lang-item-check-placeholder" />
                    )}
                  </div>
                  <span className="lang-item-label">{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
