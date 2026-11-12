import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  Loader2,
  Scan,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthUavShowcase } from '../components/auth/AuthUavShowcase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

  const handleAutofillAdmin = () => {
    setIdentifier('admin@agrisentinel.local');
    setPassword('AdminSecurePass@2026');
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-white text-[#0f172a] relative select-none">
      
      {/* Soft Ambient Agritech Wave Gradients at Bottom Corners (as in reference) */}
      <div className="absolute -bottom-10 -left-10 w-[420px] h-[260px] pointer-events-none opacity-80 z-0">
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
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="greenGradientBottomLeft2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute -bottom-10 -right-10 w-[420px] h-[260px] pointer-events-none opacity-80 z-0">
        <svg viewBox="0 0 400 250" fill="none" className="w-full h-full">
          <path 
            d="M 450 250 C 340 210, 260 230, 180 180 C 110 135, 70 90, -20 120 L -20 280 L 450 280 Z" 
            fill="url(#greenGradientBottomRight)" 
          />
          <path 
            d="M 450 250 C 320 190, 240 210, 140 150 C 70 110, 40 80, -30 70 L -30 280 L 450 280 Z" 
            fill="url(#greenGradientBottomRight2)" 
          />
          <defs>
            <linearGradient id="greenGradientBottomRight" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="greenGradientBottomRight2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header Bar */}
      <header className="shrink-0 w-full px-6 sm:px-12 lg:px-16 py-4 flex items-center justify-between border-b border-gray-100 z-10">
        {/* Brand Logo & Tag */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008C45] to-[#005f2f] flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Scan className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-[#0f172a] tracking-tight">
                Agri<span className="text-[#008C45]">Sentinel</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#008C45] font-semibold tracking-wider uppercase">
                AGRI-AI
              </span>
            </div>
            <span className="text-[10px] text-[#64748b] font-medium tracking-wide">
              UAV & Geospatial Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Back to Platform Pill Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-[#0f172a] hover:text-[#008C45] text-xs font-semibold shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Back to Platform</span>
        </Link>
      </header>

      {/* Main Two-Column Container - Fits in 100dvh without vertical scrolling on desktop */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-center z-10 overflow-y-auto lg:overflow-hidden py-3 lg:py-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* LEFT SECTION (55% on desktop): Animated UAV/Geospatial Visual & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center max-w-xl">
            <AuthUavShowcase />
          </div>

          {/* RIGHT SECTION (45% on desktop): Clean White Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[440px] bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative">
              
              {/* Secure Access Portal Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008C45] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3 h-3 text-[#008C45]" />
                <span>SECURE ACCESS PORTAL</span>
              </div>

              {/* Title & Prompt */}
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0f172a] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-[#64748b] mt-1 mb-5">
                Sign in to continue to your authorized AgriSentinel account.
              </p>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Mobile Number or Email Field */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1.5">
                    MOBILE NUMBER OR EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#008C45]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g., 9876543210 or name@domain.com"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569]">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("To reset password in development, use the initial administrator credentials below or contact platform support.")}
                      className="text-xs font-semibold text-[#008C45] hover:text-[#007038] hover:underline"
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
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Device Checkbox */}
                <div className="flex items-center">
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

                {/* Green Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] hover:to-[#006230] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>SIGNING IN...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN TO AGRISENTINEL</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Development Credentials Card Helper (Clickable to autofill) */}
              <div 
                onClick={handleAutofillAdmin}
                className="mt-4 pt-3.5 border-t border-gray-100 text-[10px] font-mono text-[#64748b] space-y-0.5 cursor-pointer hover:bg-slate-50/80 p-2 rounded-lg transition-colors"
                title="Click to auto-fill admin credentials"
              >
                <div className="text-[#008C45] font-bold uppercase tracking-wider text-[9px] flex items-center justify-between">
                  <span>DEVELOPMENT CREDENTIALS:</span>
                  <span className="text-[9px] text-[#008C45] underline font-sans font-normal">Click to fill</span>
                </div>
                <div className="text-[#334155] leading-tight">
                  Admin: <span className="text-[#008C45] font-semibold">admin@agrisentinel.local</span> / <span className="font-semibold text-slate-700">AdminSecurePass@2026</span>
                </div>
              </div>

              {/* Signup Link */}
              <div className="mt-3 text-center text-xs text-[#64748b]">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#008C45] hover:text-[#006e36] font-bold hover:underline">
                  Create an account
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default LoginPage;
