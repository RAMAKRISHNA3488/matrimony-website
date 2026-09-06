import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { UserProtectedRoute, AdminProtectedRoute } from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Global Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/Toast';
import ScrollToTop from './components/common/ScrollToTop';
import ProfileIncompleteModal from './components/common/ProfileIncompleteModal';
import mockDb from './services/mockDb';

// Core Public Pages (Immediate)
import Home from './pages/public/Home';
import Login from './pages/public/Login';

// Public Pages (Lazy Loaded)
const About = React.lazy(() => import('./pages/public/About'));
const HowItWorks = React.lazy(() => import('./pages/public/HowItWorks'));
const SuccessStories = React.lazy(() => import('./pages/public/SuccessStories'));
const FAQs = React.lazy(() => import('./pages/public/FAQs'));
const Safety = React.lazy(() => import('./pages/public/Safety'));
const PrivacyPolicy = React.lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/public/TermsOfService'));
const CookiePolicy = React.lazy(() => import('./pages/public/CookiePolicy'));
const RefundCancellation = React.lazy(() => import('./pages/public/RefundCancellation'));
const Membership = React.lazy(() => import('./pages/public/Membership'));
const Contact = React.lazy(() => import('./pages/public/Contact'));
const ForgotPassword = React.lazy(() => import('./pages/public/ForgotPassword'));
const Register = React.lazy(() => import('./pages/public/Register'));
const SocialDemo = React.lazy(() => import('./pages/public/SocialDemo'));
const DemoPayment = React.lazy(() => import('./pages/public/DemoPayment'));

// User Platform Pages (Lazy Loaded)
const Dashboard = React.lazy(() => import('./pages/user/Dashboard'));
const Discover = React.lazy(() => import('./pages/user/Discover'));
const Matches = React.lazy(() => import('./pages/user/Matches'));
const ProfileView = React.lazy(() => import('./pages/user/ProfileView'));
const ProfileEdit = React.lazy(() => import('./pages/user/ProfileEdit'));
const Interests = React.lazy(() => import('./pages/user/Interests'));
const Shortlist = React.lazy(() => import('./pages/user/Shortlist'));
const Messages = React.lazy(() => import('./pages/user/Messages'));
const Notifications = React.lazy(() => import('./pages/user/Notifications'));
const Settings = React.lazy(() => import('./pages/user/Settings'));

// Admin Platform Pages (Lazy Loaded)
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminVerifications = React.lazy(() => import('./pages/admin/AdminVerifications'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminMemberships = React.lazy(() => import('./pages/admin/AdminMemberships'));
const AdminMatches = React.lazy(() => import('./pages/admin/AdminMatches'));
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages'));
const AdminStories = React.lazy(() => import('./pages/admin/AdminStories'));
const AdminContent = React.lazy(() => import('./pages/admin/AdminContent'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminNotifications = React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSupport = React.lazy(() => import('./pages/admin/AdminSupport'));
const AdminManagement = React.lazy(() => import('./pages/admin/AdminManagement'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminAuditLogs = React.lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminBackup = React.lazy(() => import('./pages/admin/AdminBackup'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--primary-800)', fontWeight: 600, fontSize: '0.95rem' }}>
        Loading TeluguBandham...
      </div>
    </div>
  );
}

// Wrapper for public / user platform showing public Navbar and Footer
function UserPlatformLayout({ children }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="app-platform-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className={`app-main-content ${isAuthenticated ? 'has-bottom-nav' : ''}`} style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Redirects logged-in users visiting root "/" directly to "/dashboard"
function HomeRouteHandler() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <UserPlatformLayout>
      <Home />
    </UserPlatformLayout>
  );
}

function GlobalAppModals() {
  const { user } = useAuth();
  const { profileIncompleteState, setProfileIncompleteState } = useApp();
  const activeUser = user || mockDb.getCurrentUser();

  return (
    <ProfileIncompleteModal
      isOpen={Boolean(profileIncompleteState?.isOpen)}
      onClose={() => setProfileIncompleteState(prev => ({ ...prev, isOpen: false }))}
      user={activeUser}
      actionType={profileIncompleteState?.actionType || 'chat'}
      targetName={profileIncompleteState?.targetName || 'Member'}
      step={profileIncompleteState?.step || 'auto'}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <ScrollToTop />
            <ToastContainer />
            <GlobalAppModals />
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
              {/* ================= PUBLIC & USER PLATFORM ROUTES ================= */}
              <Route
                path="/"
                element={<HomeRouteHandler />}
              />
            <Route
              path="/about"
              element={
                <UserPlatformLayout>
                  <About />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/how-it-works"
              element={
                <UserPlatformLayout>
                  <HowItWorks />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/success-stories"
              element={
                <UserPlatformLayout>
                  <SuccessStories />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/faqs"
              element={
                <UserPlatformLayout>
                  <FAQs />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/faq"
              element={
                <UserPlatformLayout>
                  <FAQs />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/safety"
              element={
                <UserPlatformLayout>
                  <Safety />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/safety-guidelines"
              element={
                <UserPlatformLayout>
                  <Safety />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <UserPlatformLayout>
                  <PrivacyPolicy />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/privacy"
              element={
                <UserPlatformLayout>
                  <PrivacyPolicy />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <UserPlatformLayout>
                  <TermsOfService />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/terms-of-service"
              element={
                <UserPlatformLayout>
                  <TermsOfService />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/cookies"
              element={
                <UserPlatformLayout>
                  <CookiePolicy />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/cookie-policy"
              element={
                <UserPlatformLayout>
                  <CookiePolicy />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/refunds"
              element={
                <UserPlatformLayout>
                  <RefundCancellation />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/refund"
              element={
                <UserPlatformLayout>
                  <RefundCancellation />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/cancellation"
              element={
                <UserPlatformLayout>
                  <RefundCancellation />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/refund-and-cancellation"
              element={
                <UserPlatformLayout>
                  <RefundCancellation />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/social/:platform"
              element={<SocialDemo />}
            />
            <Route
              path="/social"
              element={<SocialDemo />}
            />
            <Route
              path="/help"
              element={
                <UserPlatformLayout>
                  <Contact />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/membership"
              element={
                <UserPlatformLayout>
                  <Membership />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/demo-payment"
              element={
                <UserPlatformLayout>
                  <DemoPayment />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <UserPlatformLayout>
                  <Contact />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/login"
              element={
                <UserPlatformLayout>
                  <Login />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <UserPlatformLayout>
                  <ForgotPassword />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/register"
              element={
                <UserPlatformLayout>
                  <Register />
                </UserPlatformLayout>
              }
            />
            <Route
              path="/register/:step"
              element={
                <UserPlatformLayout>
                  <Register />
                </UserPlatformLayout>
              }
            />
            {/* User Guarded Protected Routes */}
            <Route
              path="/search"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Discover />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Discover />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Matches />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Navigate to="/profile/edit" replace />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <ProfileView />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Dashboard />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <ProfileEdit />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/interests"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Interests />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/shortlist"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Shortlist />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Messages />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Notifications />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <UserProtectedRoute>
                  <UserPlatformLayout>
                    <Settings />
                  </UserPlatformLayout>
                </UserProtectedRoute>
              }
            />

            {/* ================= ADMIN PLATFORM ROUTES ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <AdminProtectedRoute>
                  <AdminVerifications />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/verification"
              element={
                <AdminProtectedRoute>
                  <AdminVerifications />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/memberships"
              element={
                <AdminProtectedRoute>
                  <AdminMemberships />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminProtectedRoute>
                  <AdminMemberships />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/matches"
              element={
                <AdminProtectedRoute>
                  <AdminMatches />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <AdminProtectedRoute>
                  <AdminMessages />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminProtectedRoute>
                  <AdminReports />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <AdminProtectedRoute>
                  <AdminReports />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/stories"
              element={
                <AdminProtectedRoute>
                  <AdminStories />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminProtectedRoute>
                  <AdminContent />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminProtectedRoute>
                  <AdminAnalytics />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminProtectedRoute>
                  <AdminNotifications />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/support"
              element={
                <AdminProtectedRoute>
                  <AdminSupport />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/admins"
              element={
                <AdminProtectedRoute requiredRole="Super Admin">
                  <AdminManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminProtectedRoute requiredRole="Super Admin">
                  <AdminSettings />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <AdminProtectedRoute>
                  <AdminAuditLogs />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/backup"
              element={
                <AdminProtectedRoute requiredRole="Super Admin">
                  <AdminBackup />
                </AdminProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AppProvider>
  </AuthProvider>
</ErrorBoundary>
  );
}
