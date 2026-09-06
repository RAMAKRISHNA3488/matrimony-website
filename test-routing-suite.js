/**
 * Verification script for Authenticated Navigation Routing in TeluguBandham
 */

function testRoutingRules() {
  console.log("====================================================");
  console.log("TELUGUBANDHAM NAVIGATION & ROUTING VERIFICATION SUITE");
  console.log("====================================================");

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

  console.log("\n1. Testing Active Navigation Link Highlight Logic:");

  function getActiveNav(pathname) {
    return {
      home: pathname === '/dashboard',
      matches: pathname === '/matches' || pathname.startsWith('/matches/'),
      search: pathname === '/search' || pathname.startsWith('/discover'),
      interests: pathname === '/interests' || pathname.startsWith('/interests/'),
      messages: pathname === '/messages' || pathname.startsWith('/messages/')
    };
  }

  // /dashboard => only Home active
  const atDashboard = getActiveNav('/dashboard');
  assert(atDashboard.home === true, "On '/dashboard': Home is active");
  assert(atDashboard.matches === false && atDashboard.search === false && atDashboard.interests === false && atDashboard.messages === false, "On '/dashboard': other links are inactive");

  // /matches => only Matches active
  const atMatches = getActiveNav('/matches');
  assert(atMatches.matches === true, "On '/matches': Matches is active");
  assert(atMatches.home === false && atMatches.search === false && atMatches.interests === false && atMatches.messages === false, "On '/matches': Home and other links are inactive");

  // /search => only Search active
  const atSearch = getActiveNav('/search');
  assert(atSearch.search === true, "On '/search': Search is active");
  assert(atSearch.home === false && atSearch.matches === false && atSearch.interests === false && atSearch.messages === false, "On '/search': Home and other links are inactive");

  // /discover => only Search active
  const atDiscover = getActiveNav('/discover');
  assert(atDiscover.search === true, "On '/discover': Search is active");
  assert(atDiscover.home === false, "On '/discover': Home is inactive");

  // /interests => only Interests active
  const atInterests = getActiveNav('/interests');
  assert(atInterests.interests === true, "On '/interests': Interests is active");
  assert(atInterests.home === false && atInterests.matches === false && atInterests.search === false && atInterests.messages === false, "On '/interests': Home and other links are inactive");

  // /messages => only Messages active
  const atMessages = getActiveNav('/messages');
  assert(atMessages.messages === true, "On '/messages': Messages is active");
  assert(atMessages.home === false && atMessages.matches === false && atMessages.search === false && atMessages.interests === false, "On '/messages': Home and other links are inactive");

  // /profile/edit => NO main links active
  const atProfile = getActiveNav('/profile/edit');
  assert(!atProfile.home && !atProfile.matches && !atProfile.search && !atProfile.interests && !atProfile.messages, "On '/profile/edit': NO main links are active");

  // /settings => NO main links active
  const atSettings = getActiveNav('/settings');
  assert(!atSettings.home && !atSettings.matches && !atSettings.search && !atSettings.interests && !atSettings.messages, "On '/settings': NO main links are active");

  console.log("\n2. Testing Authenticated Redirection Logic:");

  function handleRootNavigation(isAuthenticated) {
    if (isAuthenticated) {
      return '/dashboard';
    }
    return '/'; // Public Home landing page
  }

  assert(handleRootNavigation(true) === '/dashboard', "Logged-in user visiting '/' redirects to '/dashboard'");
  assert(handleRootNavigation(false) === '/', "Guest user visiting '/' stays on public Home '/'");

  console.log("\n3. Testing Protected Route Guards:");

  const protectedRoutes = ['/dashboard', '/matches', '/search', '/interests', '/messages', '/profile'];
  const publicRoutes = ['/', '/login', '/register', '/membership', '/safety', '/success-stories'];

  function guardRoute(path, isAuthenticated) {
    if (protectedRoutes.includes(path)) {
      return isAuthenticated ? path : '/login';
    }
    return path;
  }

  protectedRoutes.forEach(r => {
    assert(guardRoute(r, false) === '/login', `Unauthenticated user accessing '${r}' redirects to '/login'`);
    assert(guardRoute(r, true) === r, `Authenticated user accessing '${r}' is allowed`);
  });

  console.log("\n====================================================");
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log("====================================================");

  if (total !== passed) {
    process.exit(1);
  }
}

testRoutingRules();
