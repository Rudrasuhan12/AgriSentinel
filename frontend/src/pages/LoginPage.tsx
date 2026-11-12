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
  CheckCircle2, 
  Sparkles,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthVisualPanel } from '../components/auth/AuthVisualPanel';

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

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-charcoal-950 text-sand-50 selection:bg-lime-dim selection:text-lime-accent">
      
      {/* Left 50-55% Visual Panel */}
      <div className="w-full lg:w-[52%] shrink-0">
        <AuthVisualPanel />
      </div>

      {/* Right 45-50% Authentication Form Panel */}
      <div className="w-full lg:w-[48%] min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-gradient-to-b from-charcoal-900 via-charcoal-950 to-charcoal-950">
        
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Card Frame with Subtle Glassmorphism and Colorful Borders */}
          <div className="p-8 sm:p-10 rounded-3xl bg-forest-950/70 border border-teal-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            
            {/* Top Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-widest text-lime-accent mb-3">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>SECURE ACCESS PORTAL</span>
              </div>
              
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Welcome Back
              </h1>
              
              <p className="text-sm text-sand-300 mt-2 leading-relaxed">
                Sign in to continue to your authorized AgriSentinel account.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-3 text-xs text-red-200"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Identifier Field (Mobile Number or Email) */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-2">
                  Mobile Number or Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or name@domain.com"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-900/90 border border-forest-700/80 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent text-sm text-sand-50 placeholder:text-sand-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Field with Visibility Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("To reset your password in development, contact your administrator or use the initial admin bootstrap credentials.")}
                    className="text-xs text-lime-accent hover:underline font-mono"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-charcoal-900/90 border border-forest-700/80 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent text-sm text-sand-50 placeholder:text-sand-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sand-400 hover:text-sand-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-lime-accent bg-charcoal-900 border-forest-700 cursor-pointer"
                />
                <label htmlFor="remember_me" className="ml-2.5 text-xs text-sand-300 font-mono cursor-pointer">
                  Remember this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-accent hover:from-emerald-400 hover:to-lime-400 text-charcoal-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow hover:shadow-lg transition-all active:scale-98 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-charcoal-950" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to AgriSentinel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Help */}
            <div className="mt-6 pt-5 border-t border-forest-800/80 text-[11px] font-mono text-sand-400 space-y-1">
              <div className="text-teal-300 font-semibold uppercase text-[10px]">Development Credentials:</div>
              <div className="text-xs">Admin: <span className="text-lime-accent">admin@agrisentinel.local</span> / <span className="text-white">AdminSecurePass@2026</span></div>
              <div className="text-[10px] text-olive-400">Or register below as a Farmer for immediate approved access.</div>
            </div>

            {/* Signup Navigation Link */}
            <div className="mt-6 text-center text-xs text-sand-300 font-mono">
              Don't have an account?{' '}
              <Link to="/signup" className="text-lime-accent hover:underline font-bold">
                Create account
              </Link>
            </div>

          </div>

        </motion.div>
      </div>

    </div>
  );
};
