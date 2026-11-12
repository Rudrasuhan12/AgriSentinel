import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Sprout,
  Building2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthUavShowcase } from '../components/auth/AuthUavShowcase';

type PersonaType = 'FARMER' | 'GOVERNMENT_OFFICIAL' | 'ADMIN';

interface PersonaInfo {
  id: PersonaType;
  label: string;
  badge: string;
  title: string;
  subtitle: string;
  placeholder: string;
  demoIdentifier: string;
  demoPassword: string;
  buttonLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PERSONAS: PersonaInfo[] = [
  {
    id: 'FARMER',
    label: 'Farmer',
    badge: 'PRODUCER PORTAL',
    title: 'Farmer Sign In',
    subtitle: 'Access your registered field boundaries, UAV surveys, and harvest estimates.',
    placeholder: 'Mobile number (e.g. 9000000002) or email',
    demoIdentifier: 'farmer@agrisentinel.local',
    demoPassword: 'FarmerPass@2026',
    buttonLabel: 'SIGN IN AS FARMER',
    icon: Sprout,
  },
  {
    id: 'GOVERNMENT_OFFICIAL',
    label: 'Official',
    badge: 'GOVERNMENT DESK',
    title: 'Official Access',
    subtitle: 'Sign in with department credentials to review district cadastral assessments.',
    placeholder: 'Official email (e.g. official@agrisentinel.local)',
    demoIdentifier: 'official@agrisentinel.local',
    demoPassword: 'OfficialPass@2026',
    buttonLabel: 'SIGN IN AS OFFICIAL',
    icon: Building2,
  },
  {
    id: 'ADMIN',
    label: 'Administrator',
    badge: 'COMMAND CENTER',
    title: 'Admin Console',
    subtitle: 'Sign in with elevated privileges to manage security protocols and system logs.',
    placeholder: 'Admin email (e.g. admin@agrisentinel.local)',
    demoIdentifier: 'admin@agrisentinel.local',
    demoPassword: 'AdminSecurePass@2026',
    buttonLabel: 'SIGN IN AS ADMINISTRATOR',
    icon: ShieldCheck,
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activePersona, setActivePersona] = useState<PersonaType>('FARMER');
  const [identifier, setIdentifier] = useState('farmer@agrisentinel.local');
  const [password, setPassword] = useState('FarmerPass@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickFillSuccess, setQuickFillSuccess] = useState(false);

  const activePersonaConfig = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

  const handleSelectPersona = (personaId: PersonaType) => {
    setActivePersona(personaId);
    setErrorMessage(null);
    setQuickFillSuccess(false);
    const targetPersona = PERSONAS.find(p => p.id === personaId);
    if (targetPersona) {
      setIdentifier(targetPersona.demoIdentifier);
      setPassword(targetPersona.demoPassword);
    }
  };

  const handleQuickFill = () => {
    setIdentifier(activePersonaConfig.demoIdentifier);
    setPassword(activePersonaConfig.demoPassword);
    setErrorMessage(null);
    setQuickFillSuccess(true);
    // Auto-dismiss confirmation after 4 seconds
    setTimeout(() => {
      setQuickFillSuccess(false);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setQuickFillSuccess(false);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(identifier, password, rememberMe);
      
      // Automatic role-based redirection determined exclusively by backend
      if (user.role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else if (user.role === 'GOVERNMENT_OFFICIAL') {
        navigate('/government/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-white text-[#0f172a] relative select-none lg:h-screen lg:max-h-screen lg:overflow-hidden">
      
      {/* Soft Ambient Agritech Wave Gradients at Bottom Corners */}
      <div className="absolute -bottom-10 -left-10 w-[380px] h-[220px] pointer-events-none opacity-80 z-0">
        <svg viewBox="0 0 400 250" fill="none" className="w-full h-full">
          <path 
            d="M-50 250 C 60 210, 140 230, 220 180 C 290 135, 330 90, 420 120 L 420 280 L -50 280 Z" 
            fill="url(#greenGradientBottomLeft)" 
          />
          <path 
            d="M-50 250 C 80 190, 160 210, 260 150 C 330 110, 360 80, 430 70 L 430 280 L -50 280 Z" 
            fill="url(#greenGradientBottomLeft2)" 
          />
          <defs>
            <linearGradient id="greenGradientBottomLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="greenGradientBottomLeft2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute -bottom-10 -right-10 w-[380px] h-[220px] pointer-events-none opacity-80 z-0">
        <svg viewBox="0 0 400 250" fill="none" className="w-full h-full">
          <path 
            d="M 450 250 C 340 210, 260 230, 180 180 C 110 135, 70 90, -20 120 L -20 280 L 450 280 Z" 
            fill="url(#greenGradientBottomRight)" 
          />
          <defs>
            <linearGradient id="greenGradientBottomRight" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header Navigation Bar */}
      <header className="w-full max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-12 py-3 sm:py-4 flex items-center justify-between z-10 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008C45] to-[#005c2d] flex items-center justify-center text-white shadow-md shadow-[#008C45]/20 group-hover:scale-105 transition-transform">
            <span className="font-mono font-bold text-sm tracking-tight">AS</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#0f172a] tracking-tight">
                Agri<span className="text-[#008C45]">Sentinel</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-[#008C45] border border-emerald-200">
                AGRI-AI
              </span>
            </div>
            <span className="text-[10px] text-[#64748b] tracking-wider uppercase font-medium -mt-0.5">
              UAV & Geospatial Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Back to Platform Pill Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-[#0f172a] hover:text-[#008C45] text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Back to Platform</span>
        </Link>
      </header>

      {/* Main Two-Column Container - Balanced 54% / 46% split fitting comfortably without scroll on desktop */}
      <main className="flex-1 min-h-0 w-full max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-center z-10 py-2 sm:py-4 lg:py-0 overflow-y-auto lg:overflow-visible">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* LEFT SECTION (54% on desktop): Animated UAV/Geospatial Visual & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start lg:pl-2">
            <AuthUavShowcase />
          </div>

          {/* RIGHT SECTION (46% on desktop): Refined Persona-Based Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[470px] bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 relative"
            >
              
              {/* Persona Segmented Switcher with Animated Tab Indicator */}
              <div className="relative flex p-1 bg-slate-100 rounded-xl mb-3 border border-slate-200/80">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = activePersona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p.id)}
                      className={`relative z-10 flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-[#008C45] font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeRoleTab"
                          className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/70 -z-10"
                          transition={{ type: "spring", stiffness: 480, damping: 36 }}
                        />
                      )}
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#008C45]' : 'text-slate-400'}`} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Persona Badge & Role-Aware Indicator */}
              <div className="flex items-center justify-between mb-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008C45] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-[#008C45]" />
                  <span>{activePersonaConfig.badge}</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-400">ROLE-AWARE</span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0f172a] tracking-tight">
                {activePersonaConfig.title}
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5 mb-2.5 line-clamp-2 leading-relaxed">
                {activePersonaConfig.subtitle}
              </p>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                
                {/* Identifier Field */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                    MOBILE NUMBER OR EMAIL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#008C45]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setQuickFillSuccess(false);
                      }}
                      placeholder={activePersonaConfig.placeholder}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569]">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => alert(`To sign in with demo credentials, use the 'Quick Fill Credentials' button below for the ${activePersonaConfig.label} role.`)}
                      className="text-xs font-semibold text-[#008C45] hover:text-[#007038] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#008C45]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setQuickFillSuccess(false);
                      }}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Device Checkbox */}
                <div className="flex items-center pt-0.5">
                  <input
                    id="remember_device"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#008C45] cursor-pointer"
                  />
                  <label htmlFor="remember_device" className="ml-2 text-xs text-[#475569] font-medium cursor-pointer">
                    Remember this device
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] hover:to-[#006230] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>SIGNING IN...</span>
                    </>
                  ) : (
                    <>
                      <span>{activePersonaConfig.buttonLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials & Quick Fill Section */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                      DEMO MODE
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {activePersonaConfig.label}:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] font-semibold text-[#008C45] hover:text-[#006e36] flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/70 px-2.5 py-1 rounded-md transition-all active:scale-[0.98]"
                    title="Autofill credentials for testing"
                  >
                    <Sparkles className="w-3 h-3 text-[#008C45]" />
                    <span>Quick Fill Credentials</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Demo Account Indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-50/80 px-2 py-0.5 rounded border border-slate-100">
                  <span className="truncate max-w-[280px]">User: {activePersonaConfig.demoIdentifier}</span>
                  <span className="text-slate-300">Live Auth</span>
                </div>

                {/* Quick Fill Confirmation Banner */}
                {quickFillSuccess && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#008C45] text-[11px] font-medium animate-in fade-in duration-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45] shrink-0" />
                    <span>Demo credentials filled successfully.</span>
                  </div>
                )}
              </div>

              {/* Create Account Link */}
              <div className="mt-2 text-center text-xs text-[#64748b]">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#008C45] hover:text-[#006e36] font-bold hover:underline cursor-pointer">
                  Create an account
                </Link>
              </div>

            </motion.div>
          </div>

        </div>
      </main>

      {/* Subtle Footer Bar to Anchor Layout */}
      <footer className="w-full max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-12 py-2 flex items-center justify-between text-[11px] text-slate-400 z-10 shrink-0">
        <div>© 2026 AgriSentinel Platform. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <span className="text-emerald-600 font-mono text-[10px]">● System Online</span>
        </div>
      </footer>

    </div>
  );
};

export default LoginPage;
