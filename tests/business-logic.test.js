import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateProfileCompletion } from '../src/services/matchingAlgorithm.js';
import { MEMBERSHIP_PLANS, DEFAULT_USER_PROFILE } from '../src/services/mockData.js';

describe('Business Logic & Policy Enforcement Suite', () => {
  it('correctly calculates profile completion percentages and step completion', () => {
    // Empty / incomplete profile
    const emptyUser = {
      id: 'TEST-01',
      name: '',
      gender: '',
      photos: []
    };
    const emptyRes = calculateProfileCompletion(emptyUser);
    assert.ok(emptyRes.percentage < 100);
    assert.equal(emptyRes.isComplete, false);

    // 100% complete profile from system default
    const completeRes = calculateProfileCompletion(DEFAULT_USER_PROFILE);
    assert.equal(completeRes.percentage, 100);
    assert.equal(completeRes.isComplete, true);
    assert.equal(completeRes.missingCheckpoints.length, 0);
  });

  it('enforces that Only the Interest action works without 100% profile completion', () => {
    const checkActionAllowed = (user, actionType) => {
      if (!user) return false;
      // Only the Interest option works without 100 percent profile
      if (actionType === 'interest') {
        return true;
      }
      const completion = calculateProfileCompletion(user);
      return completion.percentage >= 100 && completion.isComplete;
    };

    const incompleteUser = {
      id: 'TEST-INC',
      name: 'Partial User',
      gender: 'male',
      photos: []
    };

    // Incomplete user: Interest is allowed, Chat / Shortlist are blocked
    assert.equal(checkActionAllowed(incompleteUser, 'interest'), true, 'Interest must be allowed without 100%');
    assert.equal(checkActionAllowed(incompleteUser, 'chat'), false, 'Chat must be blocked without 100%');
    assert.equal(checkActionAllowed(incompleteUser, 'shortlist'), false, 'Shortlist must be blocked without 100%');

    // 100% user: All actions are allowed
    assert.equal(checkActionAllowed(DEFAULT_USER_PROFILE, 'interest'), true);
    assert.equal(checkActionAllowed(DEFAULT_USER_PROFILE, 'chat'), true);
    assert.equal(checkActionAllowed(DEFAULT_USER_PROFILE, 'shortlist'), true);
  });

  it('verifies membership tiers and valid pricing structures', () => {
    assert.ok(Array.isArray(MEMBERSHIP_PLANS));
    assert.ok(MEMBERSHIP_PLANS.length >= 3);

    const goldPlan = MEMBERSHIP_PLANS.find(p => p.id === 'plan_gold' || p.name?.includes('Gold'));
    assert.ok(goldPlan, 'Gold Plan must exist');
    assert.ok(goldPlan.price > 0, 'Price must be positive');
    assert.ok(goldPlan.originalPrice >= goldPlan.price, 'Original price should be >= sale price');

    const vipPlan = MEMBERSHIP_PLANS.find(p => p.id === 'plan_diamond' || p.name?.includes('Diamond') || p.name?.includes('VIP'));
    assert.ok(vipPlan, 'VIP / Diamond Plan must exist');
  });
});
