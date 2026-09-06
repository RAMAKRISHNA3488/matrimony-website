import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  registrationService,
  INITIAL_REGISTRATION_DATA,
  PROFILE_FOR_OPTIONS
} from '../services/registrationService';

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const [formData, setFormData] = useState(() => registrationService.getDraftData());
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Auto-save draft on data changes (excluding password fields)
  useEffect(() => {
    registrationService.saveDraftData(formData);
  }, [formData]);

  // Update a single form field with intelligent logic (e.g. Profile For -> Gender lock)
  const updateField = useCallback((field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Smart Profile For -> Gender logic
      if (field === 'profileFor') {
        const option = PROFILE_FOR_OPTIONS.find((opt) => opt.value === value);
        if (option && option.genderLock) {
          updated.gender = option.genderLock;
        }
      }

      // If mobile number changes, reset verification status
      if (field === 'phone') {
        if (prev.phone !== value) {
          updated.isMobileVerified = false;
        }
      }

      return updated;
    });

    // Clear field-specific error if existing
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  // Update multiple fields
  const setMultipleFields = useCallback((fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  // Mark a field as touched
  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Validate a specific step
  const validateStep = useCallback((stepNumber) => {
    let result = { isValid: true, errors: {} };

    if (stepNumber === 1) {
      result = registrationService.validateStep1(formData);
    } else if (stepNumber === 2) {
      result = registrationService.validateStep2(formData);
    } else if (stepNumber === 3) {
      result = registrationService.validateStep3(formData);
    } else if (stepNumber === 4) {
      result = registrationService.validateStep4(formData);
    }

    setErrors(result.errors);
    return result.isValid;
  }, [formData]);

  // Advance to next step
  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!validateStep(1)) return false;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep(2)) return false;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!validateStep(3)) return false;
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!validateStep(4)) return false;
      setCurrentStep(5); // Step 5 is Review
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }, [currentStep, validateStep]);

  // Go to previous step
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Jump to specific step (e.g. from Review page edit buttons)
  const goToStep = useCallback((stepNumber) => {
    // Only allow going to previous steps, or current step, or step 1-4
    if (stepNumber >= 1 && stepNumber <= 5) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Reset entire registration state
  const resetRegistration = useCallback(() => {
    registrationService.clearDraftData();
    setFormData({ ...INITIAL_REGISTRATION_DATA });
    setCurrentStep(1);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setRegisteredUser(null);
  }, []);

  const value = {
    formData,
    updateField,
    setMultipleFields,
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
    setRegisteredUser,
    resetRegistration
  };

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}
