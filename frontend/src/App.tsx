import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MetricsStrip } from './components/MetricsStrip';
import { AboutSection } from './components/AboutSection';
import { TechnologySection } from './components/TechnologySection';
import { WorkflowSection } from './components/WorkflowSection';
import { YieldMethodologySection } from './components/YieldMethodologySection';
import { PlatformPreviewSection } from './components/PlatformPreviewSection';
import { ResearchSection } from './components/ResearchSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LaunchPlatformModal } from './components/LaunchPlatformModal';

export const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col font-sans selection:bg-lime-dim selection:text-lime-accent">
      {/* Fixed Navigation Bar */}
      <Navbar onOpenPreview={handleOpenModal} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection onExploreClick={handleOpenModal} />
        <MetricsStrip />
        <AboutSection />
        <TechnologySection />
        <WorkflowSection />
        <YieldMethodologySection />
        <PlatformPreviewSection />
        <ResearchSection />
        <CTASection onExploreClick={handleOpenModal} />
      </main>

      {/* Comprehensive Technical Footer */}
      <Footer />

      {/* Interactive Platform Concept Modal */}
      <LaunchPlatformModal isOpen={modalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default App;

