/**
 * Comprehensive Automated Test Suite for TeluguBandham Auth & Registration Flows
 */

import { validators, authService } from './src/services/authService.js';
import { otpService } from './src/services/otpService.js';
import { registrationService, INITIAL_REGISTRATION_DATA } from './src/services/registrationService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('TELUGUBANDHAM AUTH & REGISTRATION VALIDATION SUITE');
  console.log('====================================================\n');

  // 1. Mobile Number Validation Tests
  console.log('1. Testing Mobile Number Validation:');
  assert(validators.isValidIndianMobile('9876543210') === true, '9876543210 is valid');
  assert(validators.isValidIndianMobile('8123456789') === true, '8123456789 is valid');
  assert(validators.isValidIndianMobile('7000000000') === true, '7000000000 is valid');
  assert(validators.isValidIndianMobile('6300000000') === true, '6300000000 is valid');
  assert(validators.isValidIndianMobile('5123456789') === false, '5123456789 (starts with 5) is invalid');
  assert(validators.isValidIndianMobile('987654321') === false, '9 digits is invalid');
  assert(validators.isValidIndianMobile('98765432100') === false, '11 digits is invalid');
  assert(validators.isValidIndianMobile('abcdefghij') === false, 'Letters are invalid');

  // 2. Full Name Validation
  console.log('\n2. Testing Full Name Validation:');
  assert(validators.isValidFullName('Karthik Varma') === true, 'Karthik Varma is valid');
  assert(validators.isValidFullName('P. Pooja Reddy') === true, 'P. Pooja Reddy is valid');
  assert(validators.isValidFullName('A') === false, 'Single character is invalid');
  assert(validators.isValidFullName('Karthik123') === false, 'Numbers in name is invalid');

  // 3. Email Validation
  console.log('\n3. Testing Email Validation:');
  assert(validators.isValidEmail('user@example.com') === true, 'user@example.com is valid');
  assert(validators.isValidEmail('sravani.rao@telugubandham.com') === true, 'sravani.rao@telugubandham.com is valid');
  assert(validators.isValidEmail('invalid-email') === false, 'invalid-email without @ is invalid');
  assert(validators.isValidEmail('user@domain') === false, 'user@domain without TLD is invalid');

  // 4. DOB & Age (18+) Validation
  console.log('\n4. Testing Date of Birth & Dynamic Age Validation:');
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 22);
  const validDob = eighteenYearsAgo.toISOString().split('T')[0];
  assert(validators.isAtLeast18(validDob) === true, `Age 22 (${validDob}) is >= 18`);

  const sixteenYearsAgo = new Date();
  sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
  const minorDob = sixteenYearsAgo.toISOString().split('T')[0];
  assert(validators.isAtLeast18(minorDob) === false, `Age 16 (${minorDob}) is under 18`);

  // 5. Password Policy & Strength Analyzer
  console.log('\n5. Testing Password Policy & Strength Analyzer:');
  assert(validators.isStrongPassword('Bandham@2026') === true, 'Bandham@2026 is strong');
  assert(validators.isStrongPassword('weakpass') === false, 'weakpass lacks upper, number, special char');
  
  const strengthWeak = validators.getPasswordStrength('abc');
  assert(strengthWeak.hasMinLen === false && strengthWeak.label === 'Weak', 'abc is Weak');

  const strengthStrong = validators.getPasswordStrength('Bandham@2026');
  assert(strengthStrong.hasMinLen && strengthStrong.hasUpper && strengthStrong.hasLower && strengthStrong.hasDigit && strengthStrong.hasSpecial, 'Bandham@2026 meets all 5 criteria');

  // 6. OTP Service Flow
  console.log('\n6. Testing OTP Service Flow:');
  const otpReq = await otpService.requestOtp('9876543210', 'registration');
  assert(otpReq.success === true, 'OTP requested successfully');
  assert(otpReq.demoCode === '123456', 'Dev default demo code is 123456');

  const otpVerifyInvalid = await otpService.verifyOtp('9876543210', '000000', 'registration');
  assert(otpVerifyInvalid.success === false, 'Invalid OTP code is rejected');

  const otpVerifyValid = await otpService.verifyOtp('9876543210', '123456', 'registration');
  assert(otpVerifyValid.success === true, 'Valid OTP code 123456 is accepted');
  assert(otpService.isVerified('9876543210', 'registration') === true, 'isVerified returns true');

  // 7. Step Validations in Registration Service
  console.log('\n7. Testing Multi-Step Registration Validations:');
  const step1Data = {
    name: 'Karthik Varma',
    profileFor: 'Myself',
    gender: 'male',
    dob: validDob,
    email: 'karthik@example.com',
    phone: '9876543210',
    isMobileVerified: true
  };
  const step1Result = registrationService.validateStep1(step1Data);
  assert(step1Result.isValid === true, 'Step 1 validation passes with complete verified data');

  const step1Incomplete = { ...step1Data, isMobileVerified: false };
  assert(registrationService.validateStep1(step1Incomplete).isValid === false, 'Step 1 fails when mobile is not verified');

  const step2Data = {
    community: 'Reddy',
    education: 'B.Tech / B.E.',
    profession: 'Software Engineer / Architect',
    city: 'Hyderabad'
  };
  assert(registrationService.validateStep2(step2Data).isValid === true, 'Step 2 validation passes');

  const step4Data = {
    password: 'Bandham@2026',
    confirmPassword: 'Bandham@2026',
    agreeTerms: true,
    confirmAccurate: true
  };
  assert(registrationService.validateStep4(step4Data).isValid === true, 'Step 4 validation passes with matching passwords and terms');

  const step4Mismatch = { ...step4Data, confirmPassword: 'DifferentPassword@2026' };
  assert(registrationService.validateStep4(step4Mismatch).isValid === false, 'Step 4 fails on password mismatch');

  // 8. Auth Service Login & Register Integration
  console.log('\n8. Testing Auth Service Login & Register:');
  const loginRes = await authService.login('9876543210', 'Bandham@2026');
  assert(loginRes.success === true, 'Demo user login succeeds with 10-digit mobile & password');
  assert(loginRes.user && loginRes.user.phone.includes('9876543210'), 'Logged in user phone matches');

  const randomPasswordLogin = await authService.login('9059336003', 'randomPass123');
  assert(randomPasswordLogin.success === true, 'Login succeeds with any mobile number and random password');
  assert(randomPasswordLogin.user && randomPasswordLogin.user.phone.includes('9059336003'), 'User phone matches entered mobile');

  // 9. Password Reset with OTP Flow
  console.log('\n9. Testing Password Reset Flow:');
  await otpService.requestOtp('9876543210', 'forgot-password');
  const resetRes = await authService.resetPasswordWithOtp('9876543210', '123456', 'NewPassword@2026');
  assert(resetRes.success === true, 'Password reset with OTP succeeds');

  console.log('\n====================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
