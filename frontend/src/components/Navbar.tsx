import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  Menu, 
  X, 
  ArrowUpRight 
} from 'lucide-react';

interface NavbarProps {
  onOpenPreview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPreview }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Streamlined, focused desktop navigation links to eliminate congestion
  const desktopLinks = [
    { name: '3D Heap', href: '#heap-reconstruction', id: 'heap-reconstruction' },
    { name: 'Technology', href: '#technology', id: 'technology' },
    { name: 'Workflow', href: '#workflow', id: 'workflow' },
    { name: 'Methodology', href: '#methodology', id: 'methodology' },
    { name: 'Research', href: '#research', id: 'research' },
    { name: 'About', href: '#about', id: 'about' },
  ];

  // Complete list for mobile drawer
  const mobileLinks = [
    { name: 'Home', href: '#hero', id: 'hero' },
    { name: '3D Heap Reconstruction', href: '#heap-reconstruction', id: 'heap-reconstruction' },
    { name: 'Capabilities', href: '#capabilities', id: 'capabilities' },
    { name: 'Technology Architecture', href: '#technology', id: 'technology' },
    { name: 'Workflow Protocol', href: '#workflow', id: 'workflow' },
    { name: 'Yield Methodology', href: '#methodology', id: 'methodology' },
    { name: 'Research Focus', href: '#research', id: 'research' },
    { name: 'About AgriSentinel', href: '#about', id: 'about' },
  ];

  // Scroll spy to detect active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const allWatchedIds = ['hero', 'heap-reconstruction', 'capabilities', 'about', 'technology', 'workflow', 'methodology', 'research'];
      const sections = allWatchedIds.map(id => document.getElementById(id));
      const scrollPos = window.scrollY + 220;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(allWatchedIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-charcoal-950/90 backdrop-blur-md border-b border-forest-800/60 py-3 shadow-xl'
          : 'bg-transparent py-4 sm:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Wordmark */}
          <a href="#hero" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-forest-800 to-forest-900 border border-lime-dim flex items-center justify-center overflow-hidden shadow-subtle-glow group-hover:border-lime-accent/50 transition-colors">
              <Scan className="w-4 h-4 text-lime-accent transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-lime-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-sand-50">
                  Agri<span className="text-lime-accent">Sentinel</span>
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-forest-900 border border-forest-700 text-olive-300 tracking-wider">
                  R&D
                </span>
              </div>
              <span className="text-[9px] text-olive-400 font-mono tracking-wider hidden sm:block">
                UAV & Geospatial Analytics
              </span>
            </div>
          </a>

          {/* Spacious Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
            {desktopLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] xl:text-xs uppercase font-mono tracking-widest transition-colors relative py-1.5 focus:outline-none ${
                    isActive ? 'text-lime-accent font-semibold' : 'text-sand-300/80 hover:text-sand-50'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-lime-accent rounded-full shadow-subtle-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action CTA: Single, Elegant, Uncluttered Launch Button */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              onClick={onOpenPreview}
              className="relative group overflow-hidden px-4 sm:px-4.5 py-2 rounded-lg bg-gradient-to-r from-forest-700 to-forest-600 hover:from-forest-600 hover:to-forest-500 text-sand-50 text-[11px] font-mono uppercase tracking-wider font-semibold border border-lime-dim flex items-center gap-2 shadow-sm hover:shadow-subtle-glow transition-all active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Launch Platform
                <ArrowUpRight className="w-3.5 h-3.5 text-lime-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-lime-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-forest-900/60 border border-forest-800 text-sand-200 hover:text-lime-accent lg:hidden focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-charcoal-950/95 backdrop-blur-xl border-b border-forest-800/80 px-4 pt-3 pb-6 shadow-2xl"
          >
            <div className="flex flex-col gap-1.5 py-2">
              {mobileLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-xs font-mono tracking-wider transition-colors ${
                    activeSection === link.id
                      ? 'text-lime-accent bg-forest-900/60 font-semibold'
                      : 'text-sand-200 hover:text-lime-accent hover:bg-forest-900/30'
                  }`}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 mt-1 border-t border-forest-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenPreview) onOpenPreview();
                  }}
                  className="w-full py-2.5 rounded-lg bg-forest-700 hover:bg-forest-600 text-sand-50 font-mono text-xs uppercase tracking-wider font-semibold border border-lime-dim flex items-center justify-center gap-2 transition-colors"
                >
                  Launch Platform Preview
                  <ArrowUpRight className="w-4 h-4 text-lime-accent" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
