import { calculateProfileCompletion } from './src/services/matchingAlgorithm.js';
import { DEFAULT_USER_PROFILE, FEMALE_USER_PROFILE } from './src/services/mockData.js';

console.log('====================================================');
console.log('TELUGUBANDHAM 100% PROFILE COMPLETION VERIFICATION SUITE');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// 1. Profile Completion Checkpoint Tests
console.log('1. Testing calculateProfileCompletion with Pre-seeded Profiles:');
const fullMale = calculateProfileCompletion(DEFAULT_USER_PROFILE);
assert(fullMale.percentage === 100, 'DEFAULT_USER_PROFILE has 100% completion');
assert(fullMale.isComplete === true, 'DEFAULT_USER_PROFILE isComplete is true');
assert(fullMale.missingCheckpoints.length === 0, 'DEFAULT_USER_PROFILE has 0 missing checkpoints');

const fullFemale = calculateProfileCompletion(FEMALE_USER_PROFILE);
assert(fullFemale.percentage === 100, 'FEMALE_USER_PROFILE has 100% completion');
assert(fullFemale.isComplete === true, 'FEMALE_USER_PROFILE isComplete is true');

// 2. Incomplete Profile Edge Cases
console.log('\n2. Testing Incomplete Profile Detection across Checkpoints:');
const noPhotos = { ...DEFAULT_USER_PROFILE, photos: [], photoCount: 0, profilePhoto: '' };
const resNoPhotos = calculateProfileCompletion(noPhotos);
assert(resNoPhotos.percentage === 95, 'Missing photos results in 95% completion');
assert(resNoPhotos.isComplete === false, 'Missing photos causes isComplete = false');
assert(resNoPhotos.missingCheckpoints.some(c => c.id === 'photos'), 'photos identified as missing');

const noCareer = { ...DEFAULT_USER_PROFILE, education: '', profession: '', income: '' };
const resNoCareer = calculateProfileCompletion(noCareer);
assert(resNoCareer.percentage === 80, 'Missing career details results in 80% completion');
assert(resNoCareer.isComplete === false, 'Missing career causes isComplete = false');

const noFamily = { ...DEFAULT_USER_PROFILE, fatherOccupation: '', familyType: '', familyDetails: null };
const resNoFamily = calculateProfileCompletion(noFamily);
assert(resNoFamily.percentage === 85, 'Missing family details results in 85% completion');
assert(resNoFamily.isComplete === false, 'Missing family causes isComplete = false');

// 3. AppContext Gate Simulation
console.log('\n3. Testing Feature Gating Rules (Only Interest Works Without 100% Profile):');

function simulateCheckCompleteness(user, actionType, targetName = 'Member') {
  let modalState = null;
  const setProfileIncompleteState = (s) => { modalState = s; };

  if (!user) return { allowed: false, modal: null };
  if (actionType === 'interest') return { allowed: true, modal: null };

  const completion = calculateProfileCompletion(user);
  const isOneHundredPercent = completion.percentage >= 100 && completion.isComplete;

  if (!isOneHundredPercent) {
    setProfileIncompleteState({
      isOpen: true,
      actionType,
      targetName,
      step: 'bio-data'
    });
    return { allowed: false, modal: modalState };
  }
  return { allowed: true, modal: null };
}

// Incomplete user attempting features
const incompleteUser = { ...DEFAULT_USER_PROFILE, photos: [], photoCount: 0, profilePhoto: '' };

const testInterest = simulateCheckCompleteness(incompleteUser, 'interest', 'Dr. Sahithi Kamma');
assert(testInterest.allowed === true, 'Express Interest is ALLOWED without 100% profile');
assert(testInterest.modal === null, 'No incomplete modal triggered for Express Interest');

const testChat = simulateCheckCompleteness(incompleteUser, 'chat', 'Dr. Sahithi Kamma');
assert(testChat.allowed === false, 'Chat is BLOCKED without 100% profile');
assert(testChat.modal?.actionType === 'chat', 'Chat triggers modal with actionType = chat');

const testShortlist = simulateCheckCompleteness(incompleteUser, 'shortlist', 'Dr. Sahithi Kamma');
assert(testShortlist.allowed === false, 'Shortlist is BLOCKED without 100% profile');
assert(testShortlist.modal?.actionType === 'shortlist', 'Shortlist triggers modal with actionType = shortlist');

const testBioData = simulateCheckCompleteness(incompleteUser, 'biodata', 'Dr. Sahithi Kamma');
assert(testBioData.allowed === false, 'Download Bio-Data is BLOCKED without 100% profile');
assert(testBioData.modal?.actionType === 'biodata', 'Bio-Data triggers modal with actionType = biodata');

const testReport = simulateCheckCompleteness(incompleteUser, 'report', 'Dr. Sahithi Kamma');
assert(testReport.allowed === false, 'Report is BLOCKED without 100% profile');
assert(testReport.modal?.actionType === 'report', 'Report triggers modal with actionType = report');

const testContact = simulateCheckCompleteness(incompleteUser, 'contact', 'Dr. Sahithi Kamma');
assert(testContact.allowed === false, 'View Contact is BLOCKED without 100% profile');
assert(testContact.modal?.actionType === 'contact', 'Contact triggers modal with actionType = contact');

// 4. Complete User Profile (100%) - all features allowed
console.log('\n4. Testing Complete User Profile (100%) - All Features Unlocked:');
const completeUser = { ...DEFAULT_USER_PROFILE };
assert(simulateCheckCompleteness(completeUser, 'interest').allowed === true, '100% user allowed to Express Interest');
assert(simulateCheckCompleteness(completeUser, 'chat').allowed === true, '100% user allowed to Chat');
assert(simulateCheckCompleteness(completeUser, 'shortlist').allowed === true, '100% user allowed to Shortlist');
assert(simulateCheckCompleteness(completeUser, 'biodata').allowed === true, '100% user allowed to Download Bio-Data');
assert(simulateCheckCompleteness(completeUser, 'report').allowed === true, '100% user allowed to Report');
assert(simulateCheckCompleteness(completeUser, 'contact').allowed === true, '100% user allowed to View Contact');

console.log('\n====================================================');
console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('====================================================\n');

if (passed !== total) {
  process.exit(1);
}
