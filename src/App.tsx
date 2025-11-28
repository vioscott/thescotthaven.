import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfessionalSignupPage } from './pages/ProfessionalSignupPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { AgentFinderPage } from './pages/AgentFinderPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { PropertyAnalyticsPage } from './pages/PropertyAnalyticsPage';
import { PortfolioAnalyticsPage } from './pages/PortfolioAnalyticsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { EditListingPage } from './pages/EditListingPage';
import { MortgagePage } from './pages/MortgagePage';
import { SupabaseTestPage } from './pages/SupabaseTestPage';


export function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<SearchPage />} />
            <Route path="/properties/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup/professional" element={<ProfessionalSignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route path="/create-listing" element={
              <ProtectedRoute allowedRoles={['tenant', 'landlord', 'agent', 'admin']}>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['tenant', 'landlord', 'agent', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute allowedRoles={['tenant', 'landlord', 'agent', 'admin']}>
                <PortfolioAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/properties/:id/analytics" element={
              <ProtectedRoute allowedRoles={['tenant', 'landlord', 'agent', 'admin']}>
                <PropertyAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/agents" element={<AgentFinderPage />} />
            <Route path="/mortgage" element={<MortgagePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['landlord', 'agent', 'tenant']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['landlord', 'agent', 'tenant', 'admin']}>
                <ProfileSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/post" element={
              <ProtectedRoute allowedRoles={['landlord', 'agent', 'tenant']}>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            <Route path="/properties/:id/edit" element={
              <ProtectedRoute allowedRoles={['landlord', 'agent', 'admin']}>
                <EditListingPage />
              </ProtectedRoute>
            } />
            <Route path="/test-supabase" element={<SupabaseTestPage />} />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['tenant', 'landlord', 'agent', 'admin']}>
                <ProfileSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute allowedRoles={['tenant', 'landlord', 'agent', 'admin']}>
                <MessagesPage />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}