import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { openDB, createUser, verifyCredentials } from '../src/services/database/index.js';
import { validators } from '../src/services/authService.js';

describe('Authentication & Credential Verification Suite', async () => {
  await openDB();

  it('validates Indian mobile numbers correctly', () => {
    assert.equal(validators.isValidIndianMobile('9876543210'), true);
    assert.equal(validators.isValidIndianMobile('+919876543210'), true);
    assert.equal(validators.isValidIndianMobile('919876543210'), true);
    assert.equal(validators.isValidIndianMobile('8765432109'), true);
    assert.equal(validators.isValidIndianMobile('7654321098'), true);
    assert.equal(validators.isValidIndianMobile('6543210987'), true);

    // Invalid mobile numbers
    assert.equal(validators.isValidIndianMobile('5123456789'), false, 'Numbers starting with 5 should be invalid');
    assert.equal(validators.isValidIndianMobile('1234567890'), false, 'Numbers starting with 1 should be invalid');
    assert.equal(validators.isValidIndianMobile('987654321'), false, '9 digits should be invalid');
    assert.equal(validators.isValidIndianMobile('98765432101'), false, '11 digits should be invalid');
    assert.equal(validators.isValidIndianMobile('abcdefghij'), false, 'Alphabetical input should be invalid');
  });

  it('validates email addresses properly', () => {
    assert.equal(validators.isValidEmail('karthik@example.com'), true);
    assert.equal(validators.isValidEmail('sravani.reddy@domain.in'), true);
    assert.equal(validators.isValidEmail('invalid-email'), false);
    assert.equal(validators.isValidEmail('missing@domain'), false);
    assert.equal(validators.isValidEmail(''), false);
  });

  it('validates password strength rules', () => {
    assert.equal(validators.isStrongPassword('Password@123'), true);
    assert.equal(validators.isStrongPassword('weak'), false, 'Too short');
    assert.equal(validators.isStrongPassword('alllowercase1!'), false, 'Missing uppercase');
    assert.equal(validators.isStrongPassword('ALLUPPERCASE1!'), false, 'Missing lowercase');
    assert.equal(validators.isStrongPassword('NoSpecialChar123'), false, 'Missing special char');
    assert.equal(validators.isStrongPassword('NoDigits!@#ABC'), false, 'Missing digit');
  });

  it('validates 18+ age requirement', () => {
    assert.equal(validators.isAtLeast18('1995-05-15'), true);
    assert.equal(validators.isAtLeast18('2000-01-01'), true);
    assert.equal(validators.isAtLeast18('2020-01-01'), false, 'Minors should be rejected');
    assert.equal(validators.isAtLeast18('2035-01-01'), false, 'Future dates should be rejected');
    assert.equal(validators.isAtLeast18('1850-01-01'), false, 'Age > 100 should be rejected');
  });

  it('validates full DOB compliance with isValidDob', () => {
    // Valid adult dates
    assert.equal(validators.isValidDob('1995-05-15'), true);
    assert.equal(validators.isValidDob('15-05-1995'), true);
    assert.equal(validators.isValidDob('15/05/1995'), true);
    assert.equal(validators.isValidDob('2000-12-31'), true);

    // Minor dates (< 18 years old)
    assert.equal(validators.isValidDob('2018-05-15'), false, 'Minors must be rejected');
    assert.equal(validators.isValidDob('2024-01-01'), false, 'Toddlers must be rejected');

    // Future dates
    assert.equal(validators.isValidDob('2030-06-15'), false, 'Future DOB must be rejected');

    // Infinite / excessive past dates (> 100 years old)
    assert.equal(validators.isValidDob('1900-01-01'), false, 'Excessive ages must be rejected');
    assert.equal(validators.isValidDob('0001-01-01'), false, 'Year 0001 must be rejected');

    // Invalid calendar days
    assert.equal(validators.isValidDob('2000-02-30'), false, 'Feb 30 does not exist');
    assert.equal(validators.isValidDob('1998-04-31'), false, 'April 31 does not exist');

    // Garbage / empty inputs
    assert.equal(validators.isValidDob(''), false);
    assert.equal(validators.isValidDob(null), false);
    assert.equal(validators.isValidDob('invalid-date'), false);
  });

  it('accepts correct password for registered account and rejects wrong password', async () => {
    const testMobile = '9876500001';
    const testPass = 'SecureAuth@2026';

    await createUser({
      id: 'TB-AUTH-TEST',
      fullName: 'Test Candidate',
      mobileNumber: testMobile,
      password: testPass,
      gender: 'male',
      dateOfBirth: '1996-06-15'
    });

    // Valid credentials
    const validRes = await verifyCredentials(testMobile, testPass);
    assert.equal(validRes.success, true);
    assert.equal(validRes.user.mobileNumber, testMobile);

    // Invalid password must fail
    const invalidRes = await verifyCredentials(testMobile, 'IncorrectPassword123');
    assert.equal(invalidRes.success, false);
    assert.match(invalidRes.message, /Invalid password/i);

    // Non-existent user must fail
    const nonExistentRes = await verifyCredentials('9999999999', 'AnyPassword');
    assert.equal(nonExistentRes.success, false);
  });
});
