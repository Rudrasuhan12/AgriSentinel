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
  CheckCircle2,
  Globe
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
    badge: 'PRODUCER REGISTRY',
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
    badge: 'REVENUE & AGRICULTURE DEPT',
    title: 'Official Access Desk',
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
    badge: 'DPI COMMAND CONSOLE',
    title: 'Administrator Console',
    subtitle: 'Sign in with elevated privileges to manage security protocols and system audit logs.',
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F8FAFC] text-[#0f172a] relative select-none">
      
      {/* 1. Institutional Utility Bar (AgriStack Inspiration) */}
      <div className="bg-[#0f2e1e] text-white text-[11px] font-mono py-1.5 px-4 sm:px-8 border-b border-[#1b432e] z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-400 tracking-wider uppercase">
              DIGITAL AGRICULTURE MISSION
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="hidden sm:inline text-white/80">
              Digital Public Infrastructure for Agriculture
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-white/80">
            <div className="flex items-center gap-1.5 text-white/90">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>English / ଓଡ଼ିଆ</span>
            </div>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session Secure</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between z-10 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008C45] to-[#005c2d] flex items-center justify-center text-white shadow-md shadow-[#008C45]/20 group-hover:scale-105 transition-transform">
            <span className="font-mono font-bold text-sm tracking-tight">AS</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#0f2e1e] tracking-tight">
                Agri<span className="text-[#008C45]">Sentinel</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E6F4EA] text-[#008C45] border border-[#B7E1CD]">
                DPI-UAV
              </span>
            </div>
            <span className="text-[10px] text-[#64748b] tracking-wider uppercase font-medium -mt-0.5">
              Geospatial Registry & Yield Assessment
            </span>
          </div>
        </Link>

        {/* Back to Platform Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-[#0f2e1e] hover:text-[#008C45] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Back to Platform</span>
        </Link>
      </header>

      {/* 3. Main Two-Column Container */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center z-10 py-6 lg:py-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* LEFT SECTION (7 cols): Institutional DPI & UAV Showcase */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start lg:pl-2">
            <AuthUavShowcase />
          </div>

          {/* RIGHT SECTION (5 cols): Refined Institutional Sign In Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[470px] bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 relative"
            >
              
              {/* Persona Segmented Switcher with Animated Tab Indicator */}
              <div className="relative flex p-1 bg-slate-100 rounded-xl mb-3.5 border border-slate-200/80">
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

              {/* Dynamic Persona Badge & Role Indicator */}
              <div className="flex items-center justify-between mb-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E6F4EA] border border-[#B7E1CD] text-[#008C45] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-[#008C45]" />
                  <span>{activePersonaConfig.badge}</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-400">ROLE-AWARE</span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0f2e1e] tracking-tight">
                {activePersonaConfig.title}
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5 mb-3 line-clamp-2 leading-relaxed">
                {activePersonaConfig.subtitle}
              </p>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
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
                      onClick={() => alert(`To sign in with demo credentials, click the 'Quick Fill Credentials' button below for the ${activePersonaConfig.label} role.`)}
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
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
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
                  className="w-full py-3 px-6 rounded-xl bg-[#008C45] hover:bg-[#007338] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      DEMO MODE
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {activePersonaConfig.label}:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] font-semibold text-[#008C45] hover:text-[#006e36] flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 px-2.5 py-1 rounded-md transition-all active:scale-[0.98]"
                    title="Autofill credentials for evaluation"
                  >
                    <Sparkles className="w-3 h-3 text-[#008C45]" />
                    <span>Quick Fill Credentials</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Demo Account Indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                  <span className="truncate max-w-[280px]">User: {activePersonaConfig.demoIdentifier}</span>
                  <span className="text-emerald-600 font-medium">Verified Auth</span>
                </div>

                {/* Quick Fill Confirmation Banner */}
                {quickFillSuccess && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#008C45] text-[11px] font-medium animate-in fade-in duration-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45] shrink-0" />
                    <span>Demo credentials filled successfully. Click Sign In to enter.</span>
                  </div>
                )}
              </div>

              {/* Create Account Link */}
              <div className="mt-3 pt-2 text-center text-xs text-[#64748b]">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#008C45] hover:text-[#006e36] font-bold hover:underline cursor-pointer">
                  Create an account
                </Link>
              </div>

            </motion.div>
          </div>

        </div>
      </main>

      {/* 4. Institutional Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-[11px] text-slate-500 z-10 shrink-0 border-t border-gray-200/70 flex-wrap gap-2">
        <div>© 2026 AgriSentinel Platform • Digital Public Infrastructure for Agriculture</div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
          <span className="text-emerald-600 font-mono text-[10px]">● System Online</span>
        </div>
      </footer>

    </div>
  );
};

export default LoginPage;
