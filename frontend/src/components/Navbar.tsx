import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  Menu, 
  X, 
  ArrowUpRight, 
  User, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenPreview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPreview }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Curated, spacious desktop navigation items (strictly 4-5 focused links to prevent clutter)
  const desktopLinks = [
    { name: '3D Heap', href: '#heap-reconstruction', id: 'heap-reconstruction' },
    { name: 'Capabilities', href: '#capabilities', id: 'capabilities' },
    { name: 'Architecture', href: '#technology', id: 'technology' },
    { name: 'Workflow', href: '#workflow', id: 'workflow' },
    { name: 'Methodology', href: '#methodology', id: 'methodology' },
  ];

  // Full comprehensive section list for mobile drawer
  const mobileLinks = [
    { name: 'Home Overview', href: '#hero', id: 'hero' },
    { name: '3D Heap Reconstruction', href: '#heap-reconstruction', id: 'heap-reconstruction' },
    { name: 'Technology Capabilities', href: '#capabilities', id: 'capabilities' },
    { name: 'System Architecture', href: '#technology', id: 'technology' },
    { name: 'Execution Workflow', href: '#workflow', id: 'workflow' },
    { name: 'Yield Methodology', href: '#methodology', id: 'methodology' },
    { name: 'Research & Innovation', href: '#research', id: 'research' },
    { name: 'About AgriSentinel', href: '#about', id: 'about' },
  ];

  // Scroll spy to detect active section when on landing page
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const allWatchedIds = ['hero', 'heap-reconstruction', 'capabilities', 'technology', 'workflow', 'methodology', 'research', 'about'];
      const sections = allWatchedIds.map(id => document.getElementById(id));
      const scrollPos = window.scrollY + 200;

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
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/' + href);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === UserRole.ADMIN) return '/admin/dashboard';
    if (user.role === UserRole.GOVERNMENT_OFFICIAL) return '/government/dashboard';
    return '/farmer/dashboard';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || location.pathname !== '/'
          ? 'bg-charcoal-950/90 backdrop-blur-md border-b border-forest-800/60 py-3 shadow-xl'
          : 'bg-charcoal-950/40 backdrop-blur-sm py-4 border-b border-forest-900/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 focus:outline-none">
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
          </Link>

          {/* Spacious Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
            {desktopLinks.map((link) => {
              const isActive = location.pathname === '/' && activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-xs uppercase font-mono tracking-wider transition-colors relative py-1.5 focus:outline-none ${
                    isActive ? 'text-lime-accent font-semibold' : 'text-sand-300 hover:text-sand-50'
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

          {/* Action CTAs: Clean, uncluttered layout with auth actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="px-3.5 py-1.5 rounded-lg bg-forest-900 border border-lime-dim/60 hover:border-lime-accent text-sand-100 text-xs font-mono flex items-center gap-2 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-lime-accent" />
                  <span>Dashboard</span>
                  <span className="text-[9px] px-1 rounded bg-forest-800 text-lime-300 uppercase">
                    {user.role === UserRole.FARMER ? 'Farmer' : user.role === UserRole.ADMIN ? 'Admin' : 'Official'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg border border-forest-800 bg-forest-950/60 text-sand-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-sand-200 hover:text-sand-50 hover:bg-forest-900/50 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="relative group overflow-hidden px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-sand-50 text-xs font-mono uppercase tracking-wider font-semibold border border-lime-dim flex items-center gap-1.5 shadow-sm hover:shadow-subtle-glow transition-all active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    Launch Platform
                    <ArrowUpRight className="w-3.5 h-3.5 text-lime-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-lime-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            )}
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
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-charcoal-950/98 border-b border-forest-800/80 backdrop-blur-xl px-4 py-4 mt-2 overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {mobileLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs uppercase font-mono tracking-wider py-2 px-3 rounded-lg text-sand-300 hover:text-lime-accent hover:bg-forest-900/40 transition-colors"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-3 border-t border-forest-800/60 flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-lg bg-forest-900 border border-lime-dim/60 text-sand-50 text-xs font-mono uppercase tracking-wider text-center flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-lime-accent" />
                      Go to {user.role === UserRole.FARMER ? 'Farmer' : user.role === UserRole.ADMIN ? 'Admin' : 'Official'} Portal
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2 text-rose-400 text-xs font-mono text-center flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-lg border border-forest-800 text-sand-100 text-xs font-mono uppercase tracking-wider text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-forest-700 text-sand-50 text-xs font-mono uppercase tracking-wider text-center font-semibold"
                    >
                      Register / Access Request
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
