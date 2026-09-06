/**
 * Automated Verification Script for TeluguBandham Authentication Logic
 */

import { validators, authService } from '../src/services/authService.js';

console.log("==================================================");
console.log("RUNNING TELUGUBANDHAM AUTHENTICATION TESTS");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${description}`);
    failed++;
  }
}

// 1. Mobile Number Validation Tests
console.log("\n--- Testing Mobile Number Validator ---");
assert("Accepts 10 digits starting with 9 (9876543210)", validators.isValidIndianMobile("9876543210"));
assert("Accepts 10 digits starting with 8 (8123456789)", validators.isValidIndianMobile("8123456789"));
assert("Accepts 10 digits starting with 7 (7012345678)", validators.isValidIndianMobile("7012345678"));
assert("Accepts 10 digits starting with 6 (6300123456)", validators.isValidIndianMobile("6300123456"));
assert("Rejects mobile starting with 1 (1234567890)", !validators.isValidIndianMobile("1234567890"));
assert("Rejects mobile starting with 5 (5876543210)", !validators.isValidIndianMobile("5876543210"));
assert("Rejects 9-digit number (987654321)", !validators.isValidIndianMobile("987654321"));
assert("Rejects 11-digit number (98765432101)", !validators.isValidIndianMobile("98765432101"));
assert("Rejects mobile with characters (98765abc10)", !validators.isValidIndianMobile("98765abc10"));
assert("Rejects mobile with +91 (+919876543210)", !validators.isValidIndianMobile("+919876543210"));
assert("Rejects empty string", !validators.isValidIndianMobile(""));

// 2. Email Validation Tests
console.log("\n--- Testing Email Validator ---");
assert("Accepts valid email (user@example.com)", validators.isValidEmail("user@example.com"));
assert("Accepts valid email with dot (sravani.reddy@telugubandham.com)", validators.isValidEmail("sravani.reddy@telugubandham.com"));
assert("Rejects invalid email missing domain (user@)", !validators.isValidEmail("user@"));
assert("Rejects invalid email missing @ (user.com)", !validators.isValidEmail("user.com"));
assert("Rejects invalid email missing TLD (user@example)", !validators.isValidEmail("user@example"));
assert("Rejects empty string", !validators.isValidEmail(""));

// 3. Password Validation Tests
console.log("\n--- Testing Password Validator ---");
assert("Accepts 8 char password (Telugu@123)", validators.isValidPassword("Telugu@123"));
assert("Rejects short password (< 8 chars, 1234567)", !validators.isValidPassword("1234567"));
assert("Checks strong password (Telugu@123)", validators.isStrongPassword("Telugu@123"));
assert("Rejects password without uppercase (telugu@123)", !validators.isStrongPassword("telugu@123"));
assert("Rejects password without special char (Telugu123)", !validators.isStrongPassword("Telugu123"));

// 4. Age / DOB Validation Tests (18+ Requirement)
console.log("\n--- Testing Age & DOB Validator ---");
const dob25 = new Date();
dob25.setFullYear(dob25.getFullYear() - 25);
assert("Accepts 25 year old DOB", validators.isAtLeast18(dob25.toISOString().split('T')[0]));

const dob17 = new Date();
dob17.setFullYear(dob17.getFullYear() - 17);
assert("Rejects 17 year old DOB (under-18)", !validators.isAtLeast18(dob17.toISOString().split('T')[0]));

const dobFuture = new Date();
dobFuture.setFullYear(dobFuture.getFullYear() + 2);
assert("Rejects future DOB", !validators.isAtLeast18(dobFuture.toISOString().split('T')[0]));

// 5. OTP Service Tests
console.log("\n--- Testing OTP Service ---");
async function runAsyncTests() {
  const otpRes = await authService.requestOtp("9876543210");
  assert("OTP request succeeds for valid mobile", otpRes.success);
  assert("OTP demo code is 123456", otpRes.demoCode === "123456");

  const verifyValid = await authService.verifyOtp("9876543210", "123456");
  assert("OTP verification succeeds for 123456", verifyValid.success);

  const verifyInvalid = await authService.verifyOtp("9876543210", "000000");
  assert("OTP verification fails for incorrect code", !verifyInvalid.success);

  const verifyBadLen = await authService.verifyOtp("9876543210", "123");
  assert("OTP verification fails for short code", !verifyBadLen.success);

  // 6. Registration & Login Flow Tests
  console.log("\n--- Testing Registration & Login Flow ---");
  const testRegPayload = {
    name: "Kavya Varma",
    gender: "female",
    dob: "1997-08-20",
    phone: "9876500123",
    email: "kavya.varma@example.com",
    community: "Kamma",
    education: "M.S. in Computer Science",
    profession: "Software Engineer",
    city: "Hyderabad",
    password: "Password@123",
    confirmPassword: "Password@123",
    agreeTerms: true
  };

  const regRes = await authService.register(testRegPayload);
  assert("Registration succeeds with complete valid data", regRes.success);
  assert("Registered user receives a unique TB ID", regRes.user && regRes.user.id.startsWith("TB-"));
  assert("Registered user has verified status", regRes.user && regRes.user.isVerified === true);

  // Test registration validation failures
  const underAgeReg = await authService.register({ ...testRegPayload, dob: "2012-01-01" });
  assert("Registration rejects under-18 candidate", !underAgeReg.success);

  const mismatchPassReg = await authService.register({ ...testRegPayload, confirmPassword: "WrongPassword" });
  assert("Registration rejects password mismatch", !mismatchPassReg.success);

  const invalidMobileReg = await authService.register({ ...testRegPayload, phone: "1234567890" });
  assert("Registration rejects invalid mobile", !invalidMobileReg.success);

  // Test Login with registered mobile
  const loginRes = await authService.login("9876500123", "Password@123");
  assert("Login succeeds for registered mobile & password", loginRes.success);
  assert("Login returns authenticated user object", loginRes.user && loginRes.user.name === "Kavya Varma");

  // Test Login with invalid password
  const badLogin = await authService.login("9876500123", "Short");
  assert("Login fails for invalid password length", !badLogin.success);
}

await runAsyncTests();

console.log("\n==================================================");
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
