import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PlatformPreviewSection } from './components/PlatformPreviewSection';
import { MetricsStrip } from './components/MetricsStrip';
import { AboutSection } from './components/AboutSection';
import { TechnologySection } from './components/TechnologySection';
import { WorkflowSection } from './components/WorkflowSection';
import { YieldMethodologySection } from './components/YieldMethodologySection';
import { ResearchSection } from './components/ResearchSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LaunchPlatformModal } from './components/LaunchPlatformModal';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FarmerDashboard } from './pages/dashboards/FarmerDashboard';
import { GovernmentDashboard } from './pages/dashboards/GovernmentDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

// The Main Landing Page Component
const LandingPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col font-sans selection:bg-lime-dim selection:text-lime-accent">
      {/* Fixed Navigation Bar */}
      <Navbar onOpenPreview={handleOpenModal} />

      {/* Main Content Sections - 3D Heap Directly Below Hero */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection onExploreClick={handleOpenModal} />

        {/* 2. Interactive 3D Heap Reconstruction & Platform Preview */}
        <PlatformPreviewSection />

        {/* 3. Technology Capabilities */}
        <MetricsStrip />

        {/* 4. About AgriSentinel & Assessment Challenges */}
        <AboutSection />

        {/* 5. Technology Architecture */}
        <TechnologySection />

        {/* 6. Execution Workflow */}
        <WorkflowSection />

        {/* 7. Yield Methodology & Mathematical Simulation */}
        <YieldMethodologySection />

        {/* 8. Research and Innovation */}
        <ResearchSection />

        {/* 9. Closing Action Callout */}
        <CTASection onExploreClick={handleOpenModal} />
      </main>

      {/* 10. Comprehensive Footer */}
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
