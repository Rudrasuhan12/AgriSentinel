import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthVisualPanel } from '../components/auth/AuthVisualPanel';

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-charcoal-950 text-sand-50 selection:bg-lime-dim selection:text-lime-accent">
      
      {/* Left 50-55% Visual Panel */}
      <div className="w-full lg:w-[50%] shrink-0">
        <AuthVisualPanel />
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-[50%] min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-14 relative bg-gradient-to-b from-charcoal-900 via-charcoal-950 to-charcoal-950">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl">
          <div className="p-8 sm:p-10 rounded-3xl bg-forest-950/75 border border-teal-500/30 shadow-2xl backdrop-blur-xl relative">
            
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

            {/* STEP 0: ROLE SELECTION ("How will you use AgriSentinel?") */}
            {selectedRole === null && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-widest text-lime-accent mb-3">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>ONBOARDING WORKFLOW</span>
                  </div>
                  <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                    How will you use AgriSentinel?
                  </h1>
                  <p className="text-sm text-sand-300 mt-2">
                    Select your registration path to access tailored agricultural tools or official assessment workflows.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Option A: Farmer Card */}
                  <div 
                    onClick={() => setSelectedRole('FARMER')}
                    className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-forest-900/60 border-2 border-emerald-500/40 hover:border-lime-accent hover:shadow-subtle-glow cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-900 border border-emerald-400/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Tractor className="w-6 h-6 text-lime-accent" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-900/80 border border-emerald-600 text-lime-accent font-semibold">
                        INSTANT REGISTRATION
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-lime-accent transition-colors">
                      Farmer
                    </h3>
                    <p className="text-xs sm:text-sm text-sand-300 mt-1 leading-relaxed">
                      Register your agricultural fields, manage harvest records and access field assessment insights.
                    </p>
                    <div className="mt-4 pt-3 border-t border-emerald-900/80 flex items-center justify-between text-xs font-mono text-lime-accent font-semibold">
                      <span>Register as Farmer</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Option B: Government Official Card */}
                  <div 
                    onClick={() => setSelectedRole('GOVERNMENT_OFFICIAL')}
                    className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/80 to-charcoal-900/60 border-2 border-teal-500/40 hover:border-teal-400 hover:shadow-lg cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-900 border border-teal-400/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Landmark className="w-6 h-6 text-cyan-300" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-semibold">
                        REQUIRES APPROVAL
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan-300 transition-colors">
                      Government Official
                    </h3>
                    <p className="text-xs sm:text-sm text-sand-300 mt-1 leading-relaxed">
                      Access authorized agricultural assessment records, review field information and monitor reports.
                    </p>
                    <div className="mt-4 pt-3 border-t border-teal-900/80 flex items-center justify-between text-xs font-mono text-cyan-300 font-semibold">
                      <span>Request Official Access</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center text-xs text-sand-400 font-mono">
                  Already have an account?{' '}
                  <Link to="/login" className="text-lime-accent hover:underline font-bold">
                    Sign in here
                  </Link>
                </div>
              </motion.div>
            )}

            {/* FARMER REGISTRATION MULTI-STEP FLOW */}
            {selectedRole === 'FARMER' && !farmerSuccess && (
              <motion.div
                key="farmer-flow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Stepper Progress Bar */}
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-forest-800">
                  <button 
                    onClick={() => {
                      if (farmerStep > 1) setFarmerStep(farmerStep - 1);
                      else setSelectedRole(null);
                    }}
                    className="flex items-center gap-1 text-xs text-teal-300 hover:text-white font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-lime-accent">
                    <span>Step {farmerStep} of 4:</span>
                    <strong className="text-white">
                      {farmerStep === 1 && "Personal Info"}
                      {farmerStep === 2 && "Field Location"}
                      {farmerStep === 3 && "Agriculture Data"}
                      {farmerStep === 4 && "Consent & Verification"}
                    </strong>
                  </div>
                </div>

                {/* STEP 1: PERSONAL INFORMATION */}
                {farmerStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={farmerData.full_name} 
                        onChange={(e) => setFarmerData({...farmerData, full_name: e.target.value})}
                        placeholder="e.g. Ramesh Chandra Sahoo"
                        className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Mobile Number *
                        </label>
                        <input 
                          type="tel" 
                          required
                          value={farmerData.mobile_number} 
                          onChange={(e) => setFarmerData({...farmerData, mobile_number: e.target.value})}
                          placeholder="10-digit number (e.g. 9437123456)"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Email (Optional)
                        </label>
                        <input 
                          type="email" 
                          value={farmerData.email} 
                          onChange={(e) => setFarmerData({...farmerData, email: e.target.value})}
                          placeholder="farmer@example.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Password *
                        </label>
                        <input 
                          type="password" 
                          required
                          value={farmerData.password} 
                          onChange={(e) => setFarmerData({...farmerData, password: e.target.value})}
                          placeholder="Min 8 characters"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Confirm Password *
                        </label>
                        <input 
                          type="password" 
                          required
                          value={farmerData.confirm_password} 
                          onChange={(e) => setFarmerData({...farmerData, confirm_password: e.target.value})}
                          placeholder="Re-enter password"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                        Preferred Language
                      </label>
                      <select 
                        value={farmerData.preferred_language}
                        onChange={(e) => setFarmerData({...farmerData, preferred_language: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
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
                      className="w-full mt-4 py-3 rounded-xl bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow"
                    >
                      <span>Continue to Location</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: LOCATION INFORMATION (Odisha with Dependent Dropdowns) */}
                {farmerStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          State
                        </label>
                        <input 
                          type="text" 
                          disabled 
                          value={farmerData.state} 
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-950 border border-forest-800 text-sm text-sand-400 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          District *
                        </label>
                        <select 
                          value={farmerData.district}
                          onChange={(e) => {
                            const newDist = e.target.value;
                            const firstBlock = ODISHA_LOCATIONS[newDist]?.[0] || 'Block';
                            setFarmerData({...farmerData, district: newDist, sub_district: firstBlock});
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        >
                          {Object.keys(ODISHA_LOCATIONS).map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Sub-District / Block *
                        </label>
                        <select 
                          value={farmerData.sub_district}
                          onChange={(e) => setFarmerData({...farmerData, sub_district: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        >
                          {(ODISHA_LOCATIONS[farmerData.district] || []).map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          PIN Code *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={farmerData.pin_code}
                          onChange={(e) => setFarmerData({...farmerData, pin_code: e.target.value})}
                          placeholder="6-digit PIN (e.g. 754202)"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Village / Mauza *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={farmerData.village}
                          onChange={(e) => setFarmerData({...farmerData, village: e.target.value})}
                          placeholder="Village name"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Gram Panchayat (Optional)
                        </label>
                        <input 
                          type="text" 
                          value={farmerData.gram_panchayat}
                          onChange={(e) => setFarmerData({...farmerData, gram_panchayat: e.target.value})}
                          placeholder="GP name"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
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
                      className="w-full mt-4 py-3 rounded-xl bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow"
                    >
                      <span>Continue to Agricultural Info</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 3: AGRICULTURAL INFORMATION */}
                {farmerStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                        Primary Harvest Crop
                      </label>
                      <select 
                        value={farmerData.primary_crop}
                        onChange={(e) => setFarmerData({...farmerData, primary_crop: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                      >
                        <option value="Paddy (Swarna - MTU 7029)">Paddy (Swarna - MTU 7029)</option>
                        <option value="Paddy (Pooja - CR 1009)">Paddy (Pooja - CR 1009)</option>
                        <option value="Paddy (Lalat)">Paddy (Lalat)</option>
                        <option value="Paddy (Hasanta)">Paddy (Hasanta)</option>
                        <option value="Other Paddy Variety">Other Paddy Variety</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Land Ownership Type
                        </label>
                        <select 
                          value={farmerData.land_ownership_type}
                          onChange={(e) => setFarmerData({...farmerData, land_ownership_type: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        >
                          <option value="Owner">Owner / Cultivator</option>
                          <option value="Tenant">Tenant Farmer</option>
                          <option value="Sharecropper">Sharecropper</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Approx. Total Area (Hectares)
                        </label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0.1"
                          value={farmerData.approximate_land_area}
                          onChange={(e) => setFarmerData({...farmerData, approximate_land_area: parseFloat(e.target.value) || 1.0})}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Farming Category
                        </label>
                        <select 
                          value={farmerData.farming_category}
                          onChange={(e) => setFarmerData({...farmerData, farming_category: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        >
                          <option value="Marginal">Marginal (&lt; 1 Ha)</option>
                          <option value="Small">Small (1 - 2 Ha)</option>
                          <option value="Medium">Medium (2 - 10 Ha)</option>
                          <option value="Large">Large (&gt; 10 Ha)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1.5">
                          Number of Field Parcels
                        </label>
                        <input 
                          type="number" 
                          min="1" 
                          max="20"
                          value={farmerData.number_of_fields}
                          onChange={(e) => setFarmerData({...farmerData, number_of_fields: parseInt(e.target.value, 10) || 1})}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-forest-700 text-sm text-sand-50 focus:border-lime-accent font-mono"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-olive-400 font-mono">
                      * Field boundaries and parcel polygons can be drawn interactively on satellite maps after account registration.
                    </p>

                    <button
                      type="button"
                      onClick={() => setFarmerStep(4)}
                      className="w-full mt-4 py-3 rounded-xl bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow"
                    >
                      <span>Continue to Consent & Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 4: CONSENT & VERIFICATION */}
                {farmerStep === 4 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-charcoal-900/90 border border-forest-800 space-y-3 font-mono text-xs text-sand-300">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={farmerData.consent_terms}
                          onChange={(e) => setFarmerData({...farmerData, consent_terms: e.target.checked})}
                          className="mt-0.5 w-4 h-4 rounded accent-lime-accent bg-charcoal-950 border-forest-700"
                        />
                        <span>I accept the <strong>Terms & Conditions</strong> of the AgriSentinel agricultural platform.</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={farmerData.consent_privacy}
                          onChange={(e) => setFarmerData({...farmerData, consent_privacy: e.target.checked})}
                          className="mt-0.5 w-4 h-4 rounded accent-lime-accent bg-charcoal-950 border-forest-700"
                        />
                        <span>I acknowledge the <strong>Privacy Notice</strong> regarding agricultural data governance.</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={farmerData.consent_field_data}
                          onChange={(e) => setFarmerData({...farmerData, consent_field_data: e.target.checked})}
                          className="mt-0.5 w-4 h-4 rounded accent-lime-accent bg-charcoal-950 border-forest-700"
                        />
                        <span>I consent to <strong>UAV aerial imagery capture</strong> and photogrammetric heap volume processing for my registered parcels.</span>
                      </label>
                    </div>

                    {/* Development Mock OTP Notification */}
                    <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-600/50 text-xs font-mono text-teal-200">
                      <div className="flex items-center gap-1.5 font-bold text-lime-accent mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Development Mode OTP Verification</span>
                      </div>
                      <div>Default mock verification OTP is pre-filled: <strong>123456</strong></div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFarmerSubmit}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-accent hover:from-emerald-400 hover:to-lime-400 text-charcoal-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow active:scale-98 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-charcoal-950" />
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
              </motion.div>
            )}

            {/* FARMER SUCCESS ANIMATION */}
            {farmerSuccess && (
              <motion.div
                key="farmer-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-lime-accent flex items-center justify-center mb-5 shadow-subtle-glow">
                  <CheckCircle2 className="w-10 h-10 text-lime-accent" />
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  Welcome to AgriSentinel!
                </h2>
                <p className="text-sand-300 text-sm mt-2 max-w-sm">
                  Your farmer account has been created successfully. Redirecting to your agricultural dashboard...
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-lime-accent">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Farmer Portal...</span>
                </div>
              </motion.div>
            )}

            {/* GOVERNMENT ACCESS REQUEST FORM */}
            {selectedRole === 'GOVERNMENT_OFFICIAL' && !officialSubmitted && (
              <motion.div
                key="official-flow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6 flex items-center justify-between pb-3 border-b border-forest-800">
                  <button 
                    onClick={() => setSelectedRole(null)}
                    className="flex items-center gap-1 text-xs text-teal-300 hover:text-white font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Roles</span>
                  </button>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/90 border border-amber-600 text-amber-300 font-semibold">
                    OFFICIAL ACCESS REQUEST
                  </span>
                </div>

                <div className="mb-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs font-mono text-amber-200 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Verification Notice:</strong> Government access is subject to organization verification and administrator approval.
                  </span>
                </div>

                <form onSubmit={handleOfficialSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={officialData.full_name}
                        onChange={(e) => setOfficialData({...officialData, full_name: e.target.value})}
                        placeholder="e.g. Dr. Subhashree Dash"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Official Gov Email *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={officialData.official_email}
                        onChange={(e) => setOfficialData({...officialData, official_email: e.target.value})}
                        placeholder="official@odisha.gov.in"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Mobile Number *
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={officialData.mobile_number}
                        onChange={(e) => setOfficialData({...officialData, mobile_number: e.target.value})}
                        placeholder="10-digit number"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Password *
                      </label>
                      <input 
                        type="password" 
                        required
                        value={officialData.password}
                        onChange={(e) => setOfficialData({...officialData, password: e.target.value})}
                        placeholder="Min 8 characters"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Department / Ministry *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={officialData.department}
                        onChange={(e) => setOfficialData({...officialData, department: e.target.value})}
                        placeholder="Dept of Agriculture"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Official Designation *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={officialData.designation}
                        onChange={(e) => setOfficialData({...officialData, designation: e.target.value})}
                        placeholder="District Agricultural Officer"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Jurisdiction District *
                      </label>
                      <select 
                        value={officialData.requested_district}
                        onChange={(e) => setOfficialData({...officialData, requested_district: e.target.value})}
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      >
                        {Object.keys(ODISHA_LOCATIONS).map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                        Invitation Code (If applicable)
                      </label>
                      <input 
                        type="text" 
                        value={officialData.invitation_code}
                        onChange={(e) => setOfficialData({...officialData, invitation_code: e.target.value})}
                        placeholder="e.g. ODISHA-AGRI-2026"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-teal-200/90 mb-1">
                      Reason for Access Request *
                    </label>
                    <textarea 
                      required
                      rows={2}
                      value={officialData.reason}
                      onChange={(e) => setOfficialData({...officialData, reason: e.target.value})}
                      placeholder="Explain your operational responsibility and required access scope..."
                      className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-forest-700 text-xs text-sand-50 font-mono focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-charcoal-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-charcoal-950" />
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
              </motion.div>
            )}

            {/* OFFICIAL SUBMITTED PENDING SCREEN */}
            {officialSubmitted && (
              <motion.div
                key="official-pending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-5">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="font-display font-bold text-2xl text-white">
                  Access Request Submitted
                </h2>
                <div className="mt-3 px-3 py-1 rounded bg-amber-950/80 border border-amber-600 text-xs font-mono text-amber-300">
                  STATUS: PENDING ADMINISTRATOR APPROVAL
                </div>
                <p className="text-sand-300 text-xs sm:text-sm mt-3 max-w-sm leading-relaxed">
                  Your official access request for <strong>{officialData.official_email}</strong> has been logged. An administrator will review your credentials before authorized portal access is granted.
                </p>
                <Link
                  to="/login"
                  className="mt-6 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-850 text-sand-100 font-mono text-xs uppercase tracking-wider border border-forest-700"
                >
                  Return to Sign In
                </Link>
              </motion.div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
