import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Landmark,
  User,
  ChevronRight
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

  const navLinks = [
    { name: 'Core Pillars', href: '#core-pillars', id: 'core-pillars' },
    { name: 'Platform Stats', href: '#platform-stats', id: 'platform-stats' },
    { name: '3D Reconstruction', href: '#heap-reconstruction', id: 'heap-reconstruction' },
    { name: 'Satellite GIS', href: '#gis-showcase', id: 'gis-showcase' },
    { name: 'Stakeholders', href: '#stakeholders', id: 'stakeholders' },
    { name: 'Methodology', href: '#methodology', id: 'methodology' },
  ];

  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const allWatchedIds = ['hero', 'core-pillars', 'platform-stats', 'heap-reconstruction', 'gis-showcase', 'stakeholders', 'methodology'];
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
    if (href === '#heap-reconstruction' && onOpenPreview) {
      e.preventDefault();
      onOpenPreview();
      return;
    }
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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* 1. Institutional Utility Strip (AgriStack Inspiration) */}
      <div className="bg-[#08331E] text-[#D1FAE5] text-[11px] font-mono border-b border-[#065F46] py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold tracking-wider text-[#34D399]">
              <Landmark className="w-3.5 h-3.5" />
              <span>DIGITAL AGRICULTURE MISSION</span>
            </span>
            <span className="hidden md:inline text-[#059669]">|</span>
            <span className="hidden md:inline text-emerald-100 font-sans text-[11px]">
              Geospatial Cadastral & UAV Photogrammetric Infrastructure
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Live System Status Pill */}
            <div className="flex items-center gap-1.5 bg-[#064E3B] px-2 py-0.5 rounded text-[10px] text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>PostGIS: EPSG:4326 Online</span>
            </div>
            
            {/* Language Selection Badge */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-200 font-sans">
              <span className="font-semibold text-white">English</span>
              <span className="text-emerald-400">/</span>
              <span className="text-emerald-300 hover:text-white cursor-pointer transition-colors">ଓଡ଼ିଆ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Institutional Navigation Bar */}
      <nav
        className={`transition-all duration-300 ${
          scrolled || location.pathname !== '/'
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-2.5'
            : 'bg-white/90 backdrop-blur-sm border-b border-gray-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo & Identity */}
            <Link to="/" className="flex items-center gap-3 group shrink-0 focus:outline-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008C45] to-[#005c2e] flex items-center justify-center text-white shadow-sm shadow-emerald-900/10 transition-transform duration-300 group-hover:scale-105">
                <Scan className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-lg tracking-tight text-[#0f2e1e]">
                    Agri<span className="text-[#008C45]">Sentinel</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E6F4EA] text-[#008C45] border border-[#B7E1CD]">
                    DPI-UAV
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium tracking-tight">
                  UAV & Geospatial Intelligence Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id && location.pathname === '/';
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'text-[#008C45] bg-[#E6F4EA]'
                        : 'text-gray-700 hover:text-[#008C45] hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>

            {/* Desktop Action & Authentication Hub */}
            <div className="hidden sm:flex items-center gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="px-3.5 py-2 rounded-lg bg-[#E6F4EA] hover:bg-[#d4edd9] text-[#008C45] border border-[#B7E1CD] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ defaultRole: 'FARMER' }}
                    className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-[#008C45] text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Farmer Portal
                  </Link>

                  <Link
                    to="/login"
                    state={{ defaultRole: 'OFFICIAL' }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#008C45] text-gray-700 hover:text-[#008C45] text-xs font-semibold bg-white transition-all shadow-2xs"
                  >
                    Official Portal
                  </Link>

                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg bg-[#008C45] hover:bg-[#007338] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-[#E6F4EA] hover:text-[#008C45] flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                state={{ defaultRole: 'FARMER' }}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-200 text-center text-xs font-semibold text-gray-800"
              >
                Farmer Sign In
              </Link>
              <Link
                to="/login"
                state={{ defaultRole: 'OFFICIAL' }}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-lg bg-[#E6F4EA] text-[#008C45] border border-[#B7E1CD] text-center text-xs font-semibold"
              >
                Official Inspection Portal
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-lg bg-[#008C45] text-white text-center text-xs font-semibold"
              >
                Sign In to Platform
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
