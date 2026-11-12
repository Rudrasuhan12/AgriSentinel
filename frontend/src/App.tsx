import React, { useState } from 'react';
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

export const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col font-sans selection:bg-lime-dim selection:text-lime-accent">
      {/* Fixed Navigation Bar with Updated Anchor Routing */}
      <Navbar onOpenPreview={handleOpenModal} />

      {/* Main Content Sections - Reordered to Feature 3D Heap Directly Below Hero */}
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

export default App;
