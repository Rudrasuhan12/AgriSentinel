import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PlatformStatsSection } from './components/PlatformStatsSection';
import { CorePillarsSection } from './components/CorePillarsSection';
import { PlatformPreviewSection } from './components/PlatformPreviewSection';
import { InteractiveGisShowcase } from './components/InteractiveGisShowcase';
import { StakeholderPortalsSection } from './components/StakeholderPortalsSection';
import { TechnicalMethodologySection } from './components/TechnicalMethodologySection';
import { Footer } from './components/Footer';
import { LaunchPlatformModal } from './components/LaunchPlatformModal';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FarmerDashboard } from './pages/dashboards/FarmerDashboard';
import { GovernmentDashboard } from './pages/dashboards/GovernmentDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

// The Main Institutional Landing Page Component
const LandingPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#172B22] flex flex-col font-sans selection:bg-[#E6F4EA] selection:text-[#008C45]">
      {/* 1 & 2. Institutional Utility Bar & Professional Navigation Header */}
      <Navbar onOpenPreview={handleOpenModal} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 3 & 4. Hero Section with Required Headline & Prominent CTAs */}
        <HeroSection onExploreClick={handleOpenModal} />

        {/* 5. Platform Statistics Section (Real Database & LGD Records) */}
        <PlatformStatsSection />

        {/* 6. Three Core Foundational Pillars (AgriStack Architecture) */}
        <CorePillarsSection />

        {/* 7. Interactive 3D Grain Heap Reconstruction Showcase */}
        <PlatformPreviewSection />

        {/* 8. Interactive Satellite GIS Map Showcase */}
        <InteractiveGisShowcase />

        {/* 9. Agricultural Stakeholder Portal Access Gateways */}
        <StakeholderPortalsSection />

        {/* 10. Technical Methodology & UAV Specifications */}
        <TechnicalMethodologySection />
      </main>

      {/* 11. Comprehensive Institutional Footer */}
      <Footer />

      {/* Interactive Platform Concept Modal */}
      <LaunchPlatformModal isOpen={modalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Farmer Portal */}
      <Route
        path="/farmer/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.FARMER]}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Government Portal */}
      <Route
        path="/government/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.GOVERNMENT_OFFICIAL]}>
            <GovernmentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Administrator Console */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
