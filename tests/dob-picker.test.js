import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validators } from '../src/services/authService.js';
import { registrationService } from '../src/services/registrationService.js';

describe('DOB Date Picker & Validation Engine Suite', () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const maxDobYear = currentYear - 18;
  const minDobYear = currentYear - 100;

  const toLocalIso = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  it('strictly enforces no infinite/unrestricted date bounds (18 to 100 years)', () => {
    // Exactly 18 years old today is valid
    const exactly18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const iso18 = toLocalIso(exactly18);
    assert.equal(validators.isAtLeast18(iso18), true, 'Exactly 18 must be valid');

    // 17 years and 364 days old is invalid (minor)
    const minor = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
    const isoMinor = toLocalIso(minor);
    assert.equal(validators.isAtLeast18(isoMinor), false, 'Under 18 must be rejected');

    // Year beyond max bound (e.g. 101 years ago)
    const tooOld = new Date(today.getFullYear() - 101, today.getMonth(), today.getDate());
    const isoTooOld = toLocalIso(tooOld);
    assert.equal(validators.isAtLeast18(isoTooOld), false, 'Age > 100 must be rejected');

    // Year 0001 or negative years (infinite past)
    assert.equal(validators.isAtLeast18('0001-01-01'), false, 'Year 0001 must be rejected');
    assert.equal(validators.isAtLeast18('1800-05-10'), false, 'Year 1800 must be rejected');
  });

  it('strictly rejects any future dates as DOB', () => {
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const isoTomorrow = toLocalIso(tomorrow);
    assert.equal(validators.isValidDob(isoTomorrow), false, 'Tomorrow must be rejected');

    const nextYear = `${currentYear + 1}-01-01`;
    assert.equal(validators.isValidDob(nextYear), false, 'Next year must be rejected');

    const distantFuture = '2099-12-31';
    assert.equal(validators.isValidDob(distantFuture), false, 'Distant future must be rejected');
  });

  it('correctly validates and normalizes manual date inputs', () => {
    // Standard ISO YYYY-MM-DD
    assert.equal(validators.isValidDob('1996-07-24'), true);

    // Indian format DD-MM-YYYY
    assert.equal(validators.isValidDob('24-07-1996'), true);

    // Slash format DD/MM/YYYY
    assert.equal(validators.isValidDob('24/07/1996'), true);

    // Leap year date (Feb 29 on leap year)
    assert.equal(validators.isValidDob('2000-02-29'), true, '2000 is a leap year');
    assert.equal(validators.isValidDob('2004-02-29'), true, '2004 is a leap year');

    // Non-leap year Feb 29
    assert.equal(validators.isValidDob('1999-02-29'), false, '1999 is not a leap year');
    assert.equal(validators.isValidDob('2001-02-29'), false, '2001 is not a leap year');

    // Invalid calendar months / days
    assert.equal(validators.isValidDob('1995-13-01'), false, 'Month 13 is invalid');
    assert.equal(validators.isValidDob('1995-04-31'), false, 'April only has 30 days');
    assert.equal(validators.isValidDob('1995-00-10'), false, 'Month 00 is invalid');
  });

  it('ensures Step 1 registration form validation honors the DOB rules', () => {
    const baseStep1Data = {
      name: 'Karthik Varma',
      profileFor: 'Myself',
      gender: 'male',
      dob: '1995-05-15',
      email: 'karthik.varma@example.com',
      phone: '9876543210',
      isMobileVerified: true
    };

    // Valid data passes
    const validRes = registrationService.validateStep1(baseStep1Data);
    assert.equal(validRes.isValid, true, 'Valid Step 1 should pass');
    assert.equal(validRes.errors.dob, undefined);

    // Missing DOB fails
    const missingDobRes = registrationService.validateStep1({ ...baseStep1Data, dob: '' });
    assert.equal(missingDobRes.isValid, false);
    assert.match(missingDobRes.errors.dob, /Date of birth is required/i);

    // Under-18 DOB fails
    const under18Res = registrationService.validateStep1({ ...baseStep1Data, dob: '2020-01-01' });
    assert.equal(under18Res.isValid, false);
    assert.match(under18Res.errors.dob, /at least 18 years old/i);

    // Future DOB fails
    const futureRes = registrationService.validateStep1({ ...baseStep1Data, dob: '2030-01-01' });
    assert.equal(futureRes.isValid, false);
    assert.match(futureRes.errors.dob, /at least 18 years old/i);
  });
});
