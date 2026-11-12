import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Tractor, 
  Landmark, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  Scan
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthUavShowcase } from '../components/auth/AuthUavShowcase';

// Odisha Districts with Sample Blocks for Dependent Dropdowns
const ODISHA_LOCATIONS: Record<string, string[]> = {
  "Cuttack": ["Salepur", "Athagarh", "Banki", "Baramba", "Mahanga", "Niali", "Tangi-Choudwar"],
  "Puri": ["Pipili", "Delanga", "Gop", "Kakatpur", "Nimapada", "Satyabadi", "Brahmagiri"],
  "Balasore": ["Basta", "Jaleswar", "Remuna", "Soro", "Bahanaga", "Baliapal", "Simulia"],
  "Sambalpur": ["Dhankauda", "Maneswar", "Jujomura", "Rairakhol", "Kuchinda", "Bamra"],
  "Ganjam": ["Chhatrapur", "Aska", "Bhanjanagar", "Hinjilicut", "Polasara", "Purushottampur"],
  "Bhadrak": ["Bhadrak", "Basudevpur", "Bonth", "Chandbali", "Dhamnagar", "Tihidi"],
  "Bargarh": ["Attabira", "Barpali", "Bhatli", "Bheden", "Gaisilet", "Padampur"],
  "Koraput": ["Jeypore", "Koraput", "Kotpad", "Borigumma", "Semiliguda", "Pottangi"]
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerFarmer, registerOfficial } = useAuth();

  // Role selection state: null | 'FARMER' | 'GOVERNMENT_OFFICIAL'
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'GOVERNMENT_OFFICIAL' | null>(null);

  // Farmer multi-step form state (1 to 4)
  const [farmerStep, setFarmerStep] = useState<number>(1);
  const [farmerData, setFarmerData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    password: '',
    confirm_password: '',
    preferred_language: 'Odia',
    state: 'Odisha',
    district: 'Cuttack',
    sub_district: 'Salepur',
    village: '',
    gram_panchayat: '',
    pin_code: '',
    primary_crop: 'Paddy (Swarna)',
    land_ownership_type: 'Owner',
    approximate_land_area: 2.0,
    farming_category: 'Small',
    number_of_fields: 1,
    consent_terms: true,
    consent_privacy: true,
    consent_field_data: true,
    otp_code: '123456',
  });

  // Official access request form state
  const [officialData, setOfficialData] = useState({
    full_name: '',
    official_email: '',
    mobile_number: '',
    password: '',
    department: 'Department of Agriculture & Farmers\' Empowerment',
    organization: 'Govt of Odisha',
    designation: 'Agricultural Officer (AO)',
    employee_id: '',
    requested_state: 'Odisha',
    requested_district: 'Cuttack',
    reason: '',
    invitation_code: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [officialSubmitted, setOfficialSubmitted] = useState(false);
  const [farmerSuccess, setFarmerSuccess] = useState(false);

  // Handle Farmer Registration Submission
  const handleFarmerSubmit = async () => {
    setErrorMessage(null);
    if (!farmerData.consent_terms || !farmerData.consent_privacy || !farmerData.consent_field_data) {
      setErrorMessage("Please accept the terms, privacy notice, and field data consent to proceed.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerFarmer({
        full_name: farmerData.full_name,
        mobile_number: farmerData.mobile_number,
        email: farmerData.email || undefined,
        password: farmerData.password,
        preferred_language: farmerData.preferred_language,
        state: farmerData.state,
        district: farmerData.district,
        sub_district: farmerData.sub_district,
        village: farmerData.village,
        gram_panchayat: farmerData.gram_panchayat || undefined,
        pin_code: farmerData.pin_code,
        primary_crop: farmerData.primary_crop,
        land_ownership_type: farmerData.land_ownership_type,
        approximate_land_area: parseFloat(farmerData.approximate_land_area.toString()),
        farming_category: farmerData.farming_category,
        number_of_fields: parseInt(farmerData.number_of_fields.toString(), 10),
        consent_terms: farmerData.consent_terms,
        consent_privacy: farmerData.consent_privacy,
        consent_field_data: farmerData.consent_field_data,
      });

      setFarmerSuccess(true);
      setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 2200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create farmer account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Official Access Request Submission
  const handleOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (officialData.reason.length < 10) {
      setErrorMessage("Please provide a detailed justification for official access (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerOfficial(officialData);
      setOfficialSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit official access request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-white text-[#0f172a] relative select-none overflow-x-hidden">
      
      {/* Soft Ambient Agritech Wave Gradients at Bottom Corners (as on login page) */}
      <div className="absolute -bottom-10 -left-10 w-[420px] h-[260px] pointer-events-none opacity-80 z-0">
        <svg viewBox="0 0 400 250" fill="none" className="w-full h-full">
          <path 
            d="M-50 250 C 60 210, 140 230, 220 180 C 290 135, 330 90, 420 120 L 420 280 L -50 280 Z" 
            fill="url(#signupWaveLeft1)" 
          />
          <path 
            d="M-50 250 C 80 190, 160 210, 260 150 C 330 110, 360 80, 430 70 L 430 280 L -50 280 Z" 
            fill="url(#signupWaveLeft2)" 
          />
          <defs>
            <linearGradient id="signupWaveLeft1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="signupWaveLeft2" x1="0" y1="0" x2="1" y2="1">
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
            fill="url(#signupWaveRight1)" 
          />
          <path 
            d="M 450 250 C 320 190, 240 210, 140 150 C 70 110, 40 80, -30 70 L -30 280 L 450 280 Z" 
            fill="url(#signupWaveRight2)" 
          />
          <defs>
            <linearGradient id="signupWaveRight1" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="signupWaveRight2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008C45" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header Bar */}
      <header className="shrink-0 w-full px-6 sm:px-12 lg:px-16 py-4 flex items-center justify-between border-b border-gray-100 z-10 bg-white/90 backdrop-blur-sm">
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

      {/* Main Two-Column Layout */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-center z-10 py-6 overflow-y-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* LEFT SECTION (50% on desktop): Animated UAV Showcase */}
          <div className="lg:col-span-6 flex flex-col justify-center max-w-xl mx-auto lg:mx-0">
            <AuthUavShowcase />
          </div>

          {/* RIGHT SECTION (50% on desktop): Clean White Card with Roles & Multi-step forms */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-xl bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative">
              
              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 0: ROLE SELECTION */}
              {selectedRole === null && (
                <div>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008C45] text-[10px] font-mono font-bold uppercase tracking-wider mb-2.5">
                      <Sparkles className="w-3 h-3 text-[#008C45]" />
                      <span>ONBOARDING WORKFLOW</span>
                    </div>
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0f172a] tracking-tight">
                      How will you use AgriSentinel?
                    </h1>
                    <p className="text-xs sm:text-sm text-[#64748b] mt-1.5 leading-relaxed">
                      Select your registration path to access tailored agricultural tools or official assessment workflows.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Option A: Farmer Card */}
                    <div 
                      onClick={() => setSelectedRole('FARMER')}
                      className="p-5 rounded-2xl border-2 border-emerald-500/30 hover:border-[#008C45] bg-emerald-50/20 hover:bg-emerald-50/40 cursor-pointer transition-all duration-200 group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#008C45] group-hover:scale-105 transition-transform">
                          <Tractor className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008C45] font-bold">
                          INSTANT REGISTRATION
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#0f172a] group-hover:text-[#008C45] transition-colors">
                        Farmer
                      </h3>
                      <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                        Register your agricultural fields, manage harvest records and access field assessment insights.
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs font-mono text-[#008C45] font-bold">
                        <span>Register as Farmer</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Option B: Government Official Card */}
                    <div 
                      onClick={() => setSelectedRole('GOVERNMENT_OFFICIAL')}
                      className="p-5 rounded-2xl border-2 border-sky-500/30 hover:border-[#0284c7] bg-sky-50/20 hover:bg-sky-50/40 cursor-pointer transition-all duration-200 group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] group-hover:scale-105 transition-transform">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                          REQUIRES APPROVAL
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#0f172a] group-hover:text-[#0284c7] transition-colors">
                        Government Official
                      </h3>
                      <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                        Access authorized agricultural assessment records, review field information and monitor reports.
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-sky-100 flex items-center justify-between text-xs font-mono text-[#0284c7] font-bold">
                        <span>Request Official Access</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-xs text-[#64748b]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#008C45] hover:text-[#007038] font-bold hover:underline">
                      Sign in here
                    </Link>
                  </div>
                </div>
              )}

              {/* FARMER REGISTRATION MULTI-STEP FLOW */}
              {selectedRole === 'FARMER' && !farmerSuccess && (
                <div>
                  {/* Stepper Header */}
                  <div className="mb-5 flex items-center justify-between pb-3 border-b border-gray-100">
                    <button 
                      onClick={() => {
                        if (farmerStep > 1) setFarmerStep(farmerStep - 1);
                        else setSelectedRole(null);
                      }}
                      className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#0f172a] font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#008C45]">
                      <span>Step {farmerStep} of 4:</span>
                      <strong className="text-[#0f172a]">
                        {farmerStep === 1 && "Personal Info"}
                        {farmerStep === 2 && "Field Location"}
                        {farmerStep === 3 && "Agriculture Data"}
                        {farmerStep === 4 && "Consent & Verification"}
                      </strong>
                    </div>
                  </div>

                  {/* STEP 1: PERSONAL INFORMATION */}
                  {farmerStep === 1 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Full Name *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={farmerData.full_name} 
                          onChange={(e) => setFarmerData({...farmerData, full_name: e.target.value})}
                          placeholder="e.g. Ramesh Chandra Sahoo"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Mobile Number *
                          </label>
                          <input 
                            type="tel" 
                            required
                            value={farmerData.mobile_number} 
                            onChange={(e) => setFarmerData({...farmerData, mobile_number: e.target.value})}
                            placeholder="10-digit number (e.g. 9437123456)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Email (Optional)
                          </label>
                          <input 
                            type="email" 
                            value={farmerData.email} 
                            onChange={(e) => setFarmerData({...farmerData, email: e.target.value})}
                            placeholder="farmer@example.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Password *
                          </label>
                          <input 
                            type="password" 
                            required
                            value={farmerData.password} 
                            onChange={(e) => setFarmerData({...farmerData, password: e.target.value})}
                            placeholder="Min 8 characters"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Confirm Password *
                          </label>
                          <input 
                            type="password" 
                            required
                            value={farmerData.confirm_password} 
                            onChange={(e) => setFarmerData({...farmerData, confirm_password: e.target.value})}
                            placeholder="Re-enter password"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Preferred Language
                        </label>
                        <select 
                          value={farmerData.preferred_language}
                          onChange={(e) => setFarmerData({...farmerData, preferred_language: e.target.value})}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        >
                          <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिन्दी)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!farmerData.full_name || !farmerData.mobile_number || !farmerData.password) {
                            setErrorMessage("Please fill all required personal fields.");
                            return;
                          }
                          if (farmerData.password !== farmerData.confirm_password) {
                            setErrorMessage("Passwords do not match.");
                            return;
                          }
                          setErrorMessage(null);
                          setFarmerStep(2);
                        }}
                        className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>Continue to Location</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: LOCATION INFORMATION (Odisha Dropdowns) */}
                  {farmerStep === 2 && (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            State
                          </label>
                          <input 
                            type="text" 
                            disabled 
                            value={farmerData.state} 
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            District *
                          </label>
                          <select 
                            value={farmerData.district}
                            onChange={(e) => {
                              const newDist = e.target.value;
                              const firstBlock = ODISHA_LOCATIONS[newDist]?.[0] || 'Block';
                              setFarmerData({...farmerData, district: newDist, sub_district: firstBlock});
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          >
                            {Object.keys(ODISHA_LOCATIONS).map((dist) => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Sub-District / Block *
                          </label>
                          <select 
                            value={farmerData.sub_district}
                            onChange={(e) => setFarmerData({...farmerData, sub_district: e.target.value})}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          >
                            {(ODISHA_LOCATIONS[farmerData.district] || []).map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            PIN Code *
                          </label>
                          <input 
                            type="text" 
                            required
                            value={farmerData.pin_code}
                            onChange={(e) => setFarmerData({...farmerData, pin_code: e.target.value})}
                            placeholder="6-digit PIN (e.g. 754202)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Village / Mauza *
                          </label>
                          <input 
                            type="text" 
                            required
                            value={farmerData.village}
                            onChange={(e) => setFarmerData({...farmerData, village: e.target.value})}
                            placeholder="Village name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Gram Panchayat (Optional)
                          </label>
                          <input 
                            type="text" 
                            value={farmerData.gram_panchayat}
                            onChange={(e) => setFarmerData({...farmerData, gram_panchayat: e.target.value})}
                            placeholder="GP name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!farmerData.village || !farmerData.pin_code) {
                            setErrorMessage("Please specify your Village and PIN Code.");
                            return;
                          }
                          setErrorMessage(null);
                          setFarmerStep(3);
                        }}
                        className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>Continue to Agricultural Info</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 3: AGRICULTURAL INFORMATION */}
                  {farmerStep === 3 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Primary Harvest Crop
                        </label>
                        <select 
                          value={farmerData.primary_crop}
                          onChange={(e) => setFarmerData({...farmerData, primary_crop: e.target.value})}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        >
                          <option value="Paddy (Swarna - MTU 7029)">Paddy (Swarna - MTU 7029)</option>
                          <option value="Paddy (Pooja - CR 1009)">Paddy (Pooja - CR 1009)</option>
                          <option value="Paddy (Lalat)">Paddy (Lalat)</option>
                          <option value="Paddy (Hasanta)">Paddy (Hasanta)</option>
                          <option value="Other Paddy Variety">Other Paddy Variety</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Land Ownership Type
                          </label>
                          <select 
                            value={farmerData.land_ownership_type}
                            onChange={(e) => setFarmerData({...farmerData, land_ownership_type: e.target.value})}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          >
                            <option value="Owner">Owner / Cultivator</option>
                            <option value="Tenant">Tenant Farmer</option>
                            <option value="Sharecropper">Sharecropper</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Approx. Total Area (Hectares)
                          </label>
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0.1"
                            value={farmerData.approximate_land_area}
                            onChange={(e) => setFarmerData({...farmerData, approximate_land_area: parseFloat(e.target.value) || 1.0})}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Farming Category
                          </label>
                          <select 
                            value={farmerData.farming_category}
                            onChange={(e) => setFarmerData({...farmerData, farming_category: e.target.value})}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          >
                            <option value="Marginal">Marginal (&lt; 1 Ha)</option>
                            <option value="Small">Small (1 - 2 Ha)</option>
                            <option value="Medium">Medium (2 - 10 Ha)</option>
                            <option value="Large">Large (&gt; 10 Ha)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                            Number of Field Parcels
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            max="20"
                            value={farmerData.number_of_fields}
                            onChange={(e) => setFarmerData({...farmerData, number_of_fields: parseInt(e.target.value, 10) || 1})}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-[#64748b]">
                        * Field boundaries and parcel polygons can be drawn interactively on satellite maps after account registration.
                      </p>

                      <button
                        type="button"
                        onClick={() => setFarmerStep(4)}
                        className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>Continue to Consent & Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 4: CONSENT & VERIFICATION */}
                  {farmerStep === 4 && (
                    <div className="space-y-3.5">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 text-xs text-[#334155]">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={farmerData.consent_terms}
                            onChange={(e) => setFarmerData({...farmerData, consent_terms: e.target.checked})}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#008C45]"
                          />
                          <span>I accept the <strong>Terms & Conditions</strong> of the AgriSentinel agricultural platform.</span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={farmerData.consent_privacy}
                            onChange={(e) => setFarmerData({...farmerData, consent_privacy: e.target.checked})}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#008C45]"
                          />
                          <span>I acknowledge the <strong>Privacy Notice</strong> regarding agricultural data governance.</span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={farmerData.consent_field_data}
                            onChange={(e) => setFarmerData({...farmerData, consent_field_data: e.target.checked})}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#008C45]"
                          />
                          <span>I consent to <strong>UAV aerial imagery capture</strong> and photogrammetric heap volume processing for my registered parcels.</span>
                        </label>
                      </div>

                      {/* Development Mock OTP Notification */}
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#008C45]">
                        <div className="flex items-center gap-1.5 font-bold mb-0.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Development Mode OTP Verification</span>
                        </div>
                        <div className="text-emerald-700">Default mock verification OTP is pre-filled: <strong>123456</strong></div>
                      </div>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleFarmerSubmit}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Creating Farmer Profile...</span>
                          </>
                        ) : (
                          <>
                            <span>Complete Registration</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FARMER SUCCESS SCREEN */}
              {farmerSuccess && (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-[#008C45] flex items-center justify-center mb-4 shadow-sm">
                    <CheckCircle2 className="w-9 h-9 text-[#008C45]" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-[#0f172a]">
                    Welcome to AgriSentinel!
                  </h2>
                  <p className="text-[#64748b] text-xs sm:text-sm mt-1.5 max-w-sm">
                    Your farmer account has been created successfully. Redirecting to your agricultural dashboard...
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-mono text-[#008C45]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Farmer Portal...</span>
                  </div>
                </div>
              )}

              {/* GOVERNMENT OFFICIAL ACCESS REQUEST FORM */}
              {selectedRole === 'GOVERNMENT_OFFICIAL' && !officialSubmitted && (
                <div>
                  <div className="mb-5 flex items-center justify-between pb-3 border-b border-gray-100">
                    <button 
                      onClick={() => setSelectedRole(null)}
                      className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#0f172a] font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Roles</span>
                    </button>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                      OFFICIAL ACCESS REQUEST
                    </span>
                  </div>

                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Verification Notice:</strong> Government access is subject to organization verification and administrator approval.
                    </span>
                  </div>

                  <form onSubmit={handleOfficialSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Full Name *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={officialData.full_name}
                          onChange={(e) => setOfficialData({...officialData, full_name: e.target.value})}
                          placeholder="e.g. Dr. Subhashree Dash"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Official Gov Email *
                        </label>
                        <input 
                          type="email" 
                          required
                          value={officialData.official_email}
                          onChange={(e) => setOfficialData({...officialData, official_email: e.target.value})}
                          placeholder="official@odisha.gov.in"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Mobile Number *
                        </label>
                        <input 
                          type="tel" 
                          required
                          value={officialData.mobile_number}
                          onChange={(e) => setOfficialData({...officialData, mobile_number: e.target.value})}
                          placeholder="10-digit number"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Password *
                        </label>
                        <input 
                          type="password" 
                          required
                          value={officialData.password}
                          onChange={(e) => setOfficialData({...officialData, password: e.target.value})}
                          placeholder="Min 8 characters"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Department / Ministry *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={officialData.department}
                          onChange={(e) => setOfficialData({...officialData, department: e.target.value})}
                          placeholder="Dept of Agriculture"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Official Designation *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={officialData.designation}
                          onChange={(e) => setOfficialData({...officialData, designation: e.target.value})}
                          placeholder="District Agricultural Officer"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Jurisdiction District *
                        </label>
                        <select 
                          value={officialData.requested_district}
                          onChange={(e) => setOfficialData({...officialData, requested_district: e.target.value})}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        >
                          {Object.keys(ODISHA_LOCATIONS).map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                          Invitation Code (Optional)
                        </label>
                        <input 
                          type="text" 
                          value={officialData.invitation_code}
                          onChange={(e) => setOfficialData({...officialData, invitation_code: e.target.value})}
                          placeholder="e.g. ODISHA-AGRI-2026"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-[#475569] mb-1">
                        Reason for Access Request *
                      </label>
                      <textarea 
                        required
                        rows={2}
                        value={officialData.reason}
                        onChange={(e) => setOfficialData({...officialData, reason: e.target.value})}
                        placeholder="Explain your operational responsibility and required access scope..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#008C45] to-[#007338] hover:from-[#007a3c] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting Official Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Official Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* OFFICIAL SUBMITTED PENDING SCREEN */}
              {officialSubmitted && (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-[#0f172a]">
                    Access Request Submitted
                  </h2>
                  <div className="mt-2.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono text-amber-800 font-bold">
                    STATUS: PENDING ADMINISTRATOR APPROVAL
                  </div>
                  <p className="text-[#64748b] text-xs sm:text-sm mt-3 max-w-sm leading-relaxed">
                    Your official access request for <strong>{officialData.official_email}</strong> has been logged. An administrator will review your credentials before authorized portal access is granted.
                  </p>
                  <Link
                    to="/login"
                    className="mt-6 px-6 py-2.5 rounded-xl bg-[#008C45] hover:bg-[#007338] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-md transition-all"
                  >
                    Return to Sign In
                  </Link>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default SignupPage;
