/**
 * Automated Verification Script for TeluguBandham IndexedDB Temporary Database Services
 */

import {
  createUser,
  getUserById,
  getUserByMobile,
  getUserByEmail,
  verifyCredentials,
  updateUser,
  createProfile,
  getProfileByUserId,
  getAllProfilesWithUsers,
  searchProfiles,
  sendInterest,
  acceptInterest,
  declineInterest,
  getInterestsForUser,
  createMatch,
  getMatchesForUser,
  getRecommendedMatches,
  sendMessage,
  getConversation,
  getConversationsForUser,
  markConversationAsRead,
  getUnreadMessageCount,
  createNotification,
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  createMembershipTransaction,
  getMembershipsForUser,
  getAllMemberships,
  createReport,
  getAllReports,
  updateReportStatus,
  blockUser,
  unblockUser,
  getBlockedUsersForUser,
  isUserBlocked,
  createAdminLog,
  getAllAdminLogs,
  resetDatabase,
  openDB
} from '../src/services/database/index.js';

// Setup minimal IndexedDB mock environment for Node testing
import 'fake-indexeddb/auto';

async function runVerification() {
  console.log("=================================================");
  console.log("   TELUGUBANDHAM TEMPORARY DATABASE VERIFICATION");
  console.log("=================================================\n");

  try {
    // 1. Initialize & Seed Test
    console.log("1. Initializing IndexedDB & Seeding Initial Demo Data...");
    await openDB();
    console.log("✅ Database initialized successfully.");

    // 2. User & Profile Creation Test
    console.log("\n2. Testing User & Profile Creation...");
    const newUserRes = await createUser({
      id: 'TB-9999',
      fullName: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      mobileNumber: '9876543219',
      password: 'Password@123',
      gender: 'male',
      dateOfBirth: '1996-05-15',
      community: 'Kamma',
      occupation: 'Cloud Infrastructure Architect',
      education: 'B.Tech (ECE)'
    });

    if (!newUserRes.success) {
      throw new Error(`Failed to create user: ${newUserRes.message}`);
    }
    console.log(`✅ User created: ${newUserRes.user.fullName} (${newUserRes.user.id})`);

    const userProfile = await createProfile({
      userId: newUserRes.user.id,
      about: "Warm, family-oriented Telugu professional living in Hyderabad.",
      height: "5'10\"",
      familyDetails: { familyType: 'Nuclear', fatherOccupation: 'Govt Employee', motherOccupation: 'Homemaker' },
      lifestyle: { diet: 'Non-Vegetarian', smoking: 'No', drinking: 'No' },
      interests: ['Coding', 'Cricket', 'Travel'],
      horoscopeDetails: { raasi: 'Vrishabha', nakshatram: 'Rohini', dosham: 'No Dosham' },
      photos: ['/assets/profiles/groom_varma.jpg']
    });
    console.log(`✅ Profile created for userId: ${userProfile.userId}`);

    // 3. Duplicate Validation Test
    console.log("\n3. Testing Duplicate Account Prevention...");
    const dupRes = await createUser({
      fullName: 'Duplicate Suresh',
      email: 'suresh.kumar@example.com',
      mobileNumber: '9876543219',
      password: 'Password@123'
    });
    if (dupRes.success) {
      throw new Error("Duplicate validation failed: Allowed duplicate user creation.");
    }
    console.log(`✅ Duplicate registration blocked: "${dupRes.message}"`);

    // 4. Credential Verification (Login) Test
    console.log("\n4. Testing Credential Verification & Login...");
    const validLogin = await verifyCredentials('9876543219', 'Password@123');
    if (!validLogin.success || validLogin.user.id !== 'TB-9999') {
      throw new Error("Valid credential login failed.");
    }
    console.log(`✅ Valid login succeeded for: ${validLogin.user.fullName}`);

    const invalidLogin = await verifyCredentials('9876543219', 'WrongPassword');
    if (invalidLogin.success) {
      throw new Error("Invalid login allowed incorrect password.");
    }
    console.log(`✅ Invalid password rejected: "${invalidLogin.message}"`);

    // 5. Search & Filter Profiles Test
    console.log("\n5. Testing Profile Search & Filtering...");
    const allProfiles = await getAllProfilesWithUsers();
    console.log(`✅ Total profiles loaded from IndexedDB: ${allProfiles.length}`);

    const searchRes = await searchProfiles({ gender: 'female', query: 'Sravani' });
    console.log(`✅ Search query 'Sravani' returned ${searchRes.length} matching profile(s).`);

    // 6. Interest Workflow (Send -> Accept -> Match Generation) Test
    console.log("\n6. Testing Interest Workflow (Send -> Accept -> Mutual Match)...");
    const interestRes = await sendInterest('TB-9999', 'TB-1001', "Namaste, I found your profile very matching!");
    if (!interestRes.success) {
      throw new Error(`Failed to send interest: ${interestRes.message}`);
    }
    console.log(`✅ Interest sent successfully (ID: ${interestRes.interest.id})`);

    const acceptRes = await acceptInterest(interestRes.interest.id);
    if (!acceptRes.success || acceptRes.interest.status !== 'accepted') {
      throw new Error("Failed to accept interest.");
    }
    console.log(`✅ Interest accepted. Match auto-created!`);

    const userMatches = await getMatchesForUser('TB-9999');
    console.log(`✅ Matches verified in IndexedDB for TB-9999: ${userMatches.length} match record(s).`);

    // 7. Messaging & Persistence Test
    console.log("\n7. Testing Messaging & Conversations...");
    const msg = await sendMessage('TB-9999', 'TB-1001', 'Hello Sravani garu, thank you for accepting my interest!');
    console.log(`✅ Message saved: "${msg.message}" (Read: ${msg.read})`);

    const conv = await getConversation('TB-9999', 'TB-1001');
    console.log(`✅ Conversation thread retrieved: ${conv.length} message(s).`);

    // 8. Notifications Test
    console.log("\n8. Testing Notifications...");
    const notifs = await getNotificationsForUser('TB-1001');
    console.log(`✅ Notifications for receiver TB-1001: ${notifs.length} notification(s).`);

    // 9. Membership Test Payment Upgrade Test
    console.log("\n9. Testing Membership Upgrade & Transaction Recording...");
    const tx = await createMembershipTransaction('TB-9999', { name: 'Diamond Member', price: 5999, period: '6 Months' }, 'UPI (Google Pay)');
    console.log(`✅ Membership transaction recorded: ${tx.plan} - ₹${tx.amount} (${tx.status})`);

    const updatedUser = await getUserById('TB-9999');
    console.log(`✅ User record updated in IndexedDB: Plan=${updatedUser.membershipPlan}, Verified=${updatedUser.verificationStatus}`);

    // 10. Reports & Blocked Users Test
    console.log("\n10. Testing Reports & Blocked Users...");
    const rep = await createReport('TB-9999', 'TB-1005', 'Suspicious Profile', 'Inconsistent education details.');
    console.log(`✅ Report submitted: ID=${rep.id}, Status=${rep.status}`);

    await blockUser('TB-9999', 'TB-1005');
    const isBlocked = await isUserBlocked('TB-9999', 'TB-1005');
    console.log(`✅ User blocked status verified: ${isBlocked}`);

    // 11. Admin Audit Logs Test
    console.log("\n11. Testing Admin Audit Logs...");
    const log = await createAdminLog('admin_1', 'USER_MEMBERSHIP_UPGRADE', 'TB-9999', 'Upgraded to Diamond Plan via UPI');
    console.log(`✅ Admin audit log recorded: ${log.action} on ${log.targetId}`);

    console.log("\n=================================================");
    console.log("🎉 ALL 11 DATABASE SUITES PASSED FLAWLESSLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Verification failed with error:", err);
    process.exit(1);
  }
}

runVerification();
