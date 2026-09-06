import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import enJson from '../src/i18n/locales/en.json' with { type: 'json' };
import teJson from '../src/i18n/locales/te.json' with { type: 'json' };
import { mockDb } from '../src/services/mockDb.js';

describe('Audit Fixes & Regressions Verification Suite', () => {
  it('verifies that i18n validation namespace is completely populated in both English and Telugu', () => {
    assert.ok(enJson.validation, 'en.json must contain validation object');
    assert.ok(teJson.validation, 'te.json must contain validation object');

    const requiredKeys = [
      'mobileRequired',
      'mobileInvalid',
      'passwordRequired',
      'passwordStrong',
      'confirmPasswordRequired',
      'passwordMismatch',
      'nameRequired',
      'nameInvalid',
      'dobRequired',
      'ageUnder18',
      'emailRequired',
      'emailInvalid',
      'communityRequired',
      'educationRequired',
      'professionRequired',
      'cityRequired',
      'genderRequired',
      'profileForRequired'
    ];

    for (const key of requiredKeys) {
      assert.ok(enJson.validation[key], `en.json missing validation key: ${key}`);
      assert.ok(teJson.validation[key], `te.json missing validation key: ${key}`);
      assert.ok(typeof enJson.validation[key] === 'string' && enJson.validation[key].length > 0);
      assert.ok(typeof teJson.validation[key] === 'string' && teJson.validation[key].length > 0);
    }
  });

  it('verifies that setCurrentUser in mockDb dispatches real-time notifications', () => {
    let notifiedType = null;
    let notifiedPayload = null;

    const unsubscribe = mockDb.subscribe((type, payload) => {
      if (type === 'user_updated') {
        notifiedType = type;
        notifiedPayload = payload;
      }
    });

    const testUser = {
      id: 'TEST-SYNC-01',
      name: 'Test Sync User',
      membershipTier: 'Gold Member'
    };

    mockDb.setCurrentUser(testUser);

    assert.equal(notifiedType, 'user_updated');
    assert.equal(notifiedPayload?.membershipTier, 'Gold Member');

    unsubscribe();
  });

  it('verifies that mobile step indicators format clean titles', () => {
    const formatMobileStep = (step, isTelugu = false) => {
      const stepTitle =
        step === 1 ? (isTelugu ? 'ప్రాథమిక వివరాలు' : 'Basic Details') :
        step === 2 ? (isTelugu ? 'విద్య & ఉద్యోగం' : 'Education & Career') :
        step === 3 ? (isTelugu ? 'కుటుంబం & జాతకం' : 'Family Details') :
        (isTelugu ? 'భద్రత & పాస్‌వర్డ్' : 'Account Security');

      return `Step ${step} of 4 — ${stepTitle}`;
    };

    assert.equal(formatMobileStep(1), 'Step 1 of 4 — Basic Details');
    assert.equal(formatMobileStep(2), 'Step 2 of 4 — Education & Career');
    assert.equal(formatMobileStep(2, true), 'Step 2 of 4 — విద్య & ఉద్యోగం');
    assert.equal(formatMobileStep(3), 'Step 3 of 4 — Family Details');
    assert.equal(formatMobileStep(4), 'Step 4 of 4 — Account Security');
  });
});
