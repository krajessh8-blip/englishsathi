import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MapPin,
  Lock,
} from 'lucide-react';
import {
  registerSchoolService,
  checkUdiseAvailability,
  RegisteredSchoolData,
} from '../../services/schoolService';

export type { RegisteredSchoolData };

export interface SchoolRegisterProps {
  onNavigateHome?: () => void;
  onRegisterSuccess?: (schoolData: RegisteredSchoolData) => void;
}

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar',
  'Akola',
  'Amravati',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Chhatrapati Sambhajinagar',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai City',
  'Mumbai Suburban',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Dharashiv (Osmanabad)',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
];

// Fresh start: no hardcoded legacy schools
const KNOWN_VERIFIED_SCHOOLS: Record<string, { name: string; city: string; district: string }> = {};

export const SchoolRegister: React.FC<SchoolRegisterProps> = ({
  onNavigateHome = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  },
  onRegisterSuccess,
}) => {
  // 1. School Details State
  const [udiseCode, setUdiseCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [category, setCategory] = useState('Zilla Parishad / Government');
  const [medium, setMedium] = useState('Semi-English');
  const [district, setDistrict] = useState('Beed');
  const [taluka, setTaluka] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [studentStrength, setStudentStrength] = useState('150-300');

  // 2. Principal Details State
  const [principalName, setPrincipalName] = useState('');
  const [principalPhone, setPrincipalPhone] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');
  const [principalDesignation, setPrincipalDesignation] = useState('Headmaster / मुख्याध्यापक');
  const [principalPassword, setPrincipalPassword] = useState('');
  const [principalConfirmPassword, setPrincipalConfirmPassword] = useState('');
  const [showPrincipalPass, setShowPrincipalPass] = useState(false);
  const [showPrincipalConfirmPass, setShowPrincipalConfirmPass] = useState(false);

  // 3. Coordinator Details State
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorPhone, setCoordinatorPhone] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [coordinatorSubject, setCoordinatorSubject] = useState('English Teacher / इंग्रजी शिक्षक');
  const [coordinatorPassword, setCoordinatorPassword] = useState('');
  const [showCoordinatorPass, setShowCoordinatorPass] = useState(false);

  // UI / Status State
  const [udiseVerifiedInfo, setUdiseVerifiedInfo] = useState<string | null>(null);
  const [udiseVerifyError, setUdiseVerifyError] = useState<string | null>(null);
  const [udiseDuplicateError, setUdiseDuplicateError] = useState<string | null>(null);
  const [isVerifyingUdise, setIsVerifyingUdise] = useState(false);
  const [isUdiseTouched, setIsUdiseTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<RegisteredSchoolData | null>(null);

  // UDISE Code Real-time Validation Checks
  const cleanUdise = udiseCode.replace(/\D/g, '');
  const isUdiseLengthValid = cleanUdise.length === 11;
  const isMaharashtraCode = cleanUdise.startsWith('27');

  // Compute inline error message for UDISE input
  let udiseInlineError: string | null = null;
  if (udiseDuplicateError) {
    udiseInlineError = udiseDuplicateError;
  } else if (isUdiseTouched) {
    if (!cleanUdise) {
      udiseInlineError = 'School UDISE code is required. Please enter an 11-digit numeric code.';
    } else if (cleanUdise.length < 11) {
      udiseInlineError = `UDISE code must be exactly 11 digits (currently ${cleanUdise.length} of 11 entered — ${11 - cleanUdise.length} more needed).`;
    } else if (cleanUdise.length > 11 || !/^\d{11}$/.test(cleanUdise)) {
      udiseInlineError = 'UDISE code must contain exactly 11 numeric digits only.';
    }
  }

  // Live duplicate check as user types 11 digits
  useEffect(() => {
    let active = true;
    if (cleanUdise.length === 11) {
      setIsVerifyingUdise(true);
      checkUdiseAvailability(cleanUdise)
        .then((result) => {
          if (!active) return;
          setIsVerifyingUdise(false);
          if (result.isDuplicate) {
            const err = result.marathiError || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.';
            setUdiseDuplicateError(err);
            setUdiseVerifiedInfo(null);
            setUdiseVerifyError(err);
          } else {
            setUdiseDuplicateError(null);
            setUdiseVerifyError(null);
            setUdiseVerifiedInfo('✓ UDISE Code available for registration (हा UDISE कोड नोंदणीसाठी उपलब्ध आहे)');
          }
        })
        .catch(() => {
          if (active) setIsVerifyingUdise(false);
        });
    } else {
      setUdiseDuplicateError(null);
      if (cleanUdise.length > 0 && cleanUdise.length < 11) {
        setUdiseVerifiedInfo(null);
      }
    }
    return () => {
      active = false;
    };
  }, [cleanUdise]);

  const handleUdiseChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 11);
    setUdiseCode(digitsOnly);
    setUdiseVerifiedInfo(null);
    setUdiseVerifyError(null);
    setUdiseDuplicateError(null);
  };

  const handleVerifyUdiseClick = async () => {
    setIsUdiseTouched(true);
    if (!cleanUdise) {
      setUdiseVerifyError('Please enter an 11-digit UDISE code.');
      return;
    }
    if (cleanUdise.length !== 11) {
      setUdiseVerifyError(`UDISE code must be exactly 11 digits (current: ${cleanUdise.length}).`);
      return;
    }

    setIsVerifyingUdise(true);
    setUdiseVerifyError(null);

    try {
      const check = await checkUdiseAvailability(cleanUdise);
      setIsVerifyingUdise(false);
      if (check.isDuplicate) {
        const msg = check.marathiError || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.';
        setUdiseDuplicateError(msg);
        setUdiseVerifyError(msg);
        setUdiseVerifiedInfo(null);
      } else {
        setUdiseDuplicateError(null);
        setUdiseVerifyError(null);
        setUdiseVerifiedInfo('✓ Valid 11-digit UDISE Code available for registration (हा UDISE कोड नोंदणीसाठी उपलब्ध आहे)');
      }
    } catch {
      setIsVerifyingUdise(false);
    }
  };

  // Form Submit with Comprehensive Validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsUdiseTouched(true);

    // 1. Validate UDISE Code (must be exactly 11 numeric digits)
    if (!/^\d{11}$/.test(cleanUdise)) {
      setFormError('School UDISE code must be exactly 11 numeric digits (उदा. 27330308103).');
      const inputEl = document.getElementById('inputSchoolUdise');
      if (inputEl) {
        inputEl.focus();
      }
      return;
    }

    // 2. Validate School Details
    if (!schoolName.trim()) {
      setFormError('Please enter the School Name (शाळेचे नाव).');
      return;
    }
    if (!city.trim()) {
      setFormError('Please enter School City / Village (शहर / गाव).');
      return;
    }

    // 3. Validate Principal Details
    if (!principalName.trim()) {
      setFormError('Please enter Principal / Headmaster Full Name.');
      return;
    }
    const cleanPrincipalPhone = principalPhone.replace(/\D/g, '');
    if (cleanPrincipalPhone.length < 10) {
      setFormError('Principal Mobile Number must be 10 digits.');
      return;
    }
    if (!principalPassword || principalPassword.length < 6) {
      setFormError('Principal Portal Password must be at least 6 characters.');
      return;
    }
    if (principalPassword !== principalConfirmPassword) {
      setFormError('Principal Password and Confirm Password do not match.');
      return;
    }

    // 4. Validate Classroom Details
    if (!coordinatorName.trim()) {
      setFormError('Please enter Classroom In-Charge Full Name.');
      return;
    }
    const cleanCoordPhone = coordinatorPhone.replace(/\D/g, '');
    if (cleanCoordPhone.length < 10) {
      setFormError('Classroom In-Charge Mobile Number must be 10 digits.');
      return;
    }
    if (!coordinatorPassword || coordinatorPassword.length < 6) {
      setFormError('Classroom Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    const schoolRecord: RegisteredSchoolData = {
      udiseCode: cleanUdise,
      schoolName: schoolName.trim(),
      category,
      medium,
      state: 'Maharashtra',
      district,
      taluka: taluka.trim() || district,
      city: city.trim(),
      pincode: pincode.trim() || '431517',
      schoolEmail: schoolEmail.trim() || `${cleanUdise}@school.gov.in`,
      schoolPhone: schoolPhone.trim() || principalPhone,
      principalName: principalName.trim(),
      principalPhone: cleanPrincipalPhone,
      principalEmail: principalEmail.trim() || `principal_${cleanUdise}@school.edu`,
      principalPassword,
      coordinatorName: coordinatorName.trim(),
      coordinatorPhone: cleanCoordPhone,
      coordinatorEmail: coordinatorEmail.trim() || `coordinator_${cleanUdise}@school.edu`,
      coordinatorPassword,
      studentStrength,
      registeredDate: new Date().toISOString().split('T')[0],
    };

    try {
      // Trigger registration service call
      const response = await registerSchoolService(schoolRecord);

      if (response.success) {
        setSuccessData({
          ...schoolRecord,
          status: 'PENDING',
        });
        if (onRegisterSuccess) {
          onRegisterSuccess({
            ...schoolRecord,
            status: 'PENDING',
          });
        }
      } else {
        if (response.isDuplicate) {
          const msg = response.marathiError || response.message || 'हा UDISE कोड आधीच नोंदणीकृत किंवा मंजुरीसाठी प्रलंबित आहे. कृपया वेगळा UDISE कोड वापरा.';
          setUdiseDuplicateError(msg);
          setUdiseVerifyError(msg);
        }
        setFormError(response.marathiError || response.message || 'नोंदणी प्रक्रिया पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setFormError('नोंदणी प्रक्रिया पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-600/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btnBackToLoginTop"
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Login Page</span>
          </button>
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-base font-bold shadow-xs">
              🏫
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                School Registration (UDISE+)
              </h1>
              <p className="text-[10px] sm:text-[11px] text-orange-400 font-medium">
                महाराष्ट्र शासन • शालेय शिक्षण डिजिटल इंग्रजी उपक्रम
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Class 5–12 Curriculum
          </span>
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-bold cursor-pointer transition-colors"
          >
            Existing School Login →
          </button>
        </div>
      </header>

      {/* Main Registration Container */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title Banner */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold mb-2">
              <span>🏛️ Official School Portal Enrollment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              School Details &amp; Registration
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
              Enter your verified 11-digit School UDISE code and contact information to setup the
              classroom practice lab, teacher dashboards, and student roster.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-300">Fast Activation</div>
              <div className="text-[11px] text-emerald-400 font-semibold">✓ Instant Portal Ready</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              ⚡
            </div>
          </div>
        </div>

        {/* Global Error Banner if validation fails */}
        {formError && (
          <div className="mb-6 p-4 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-sm flex items-start justify-between gap-3 shadow-xl animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-bold text-red-200">Registration Requirement</p>
                <p className="text-xs text-red-300/90 mt-0.5">{formError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ======================================================== */}
          {/* SECTION 1: SCHOOL DETAILS & UDISE VERIFICATION           */}
          {/* ======================================================== */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 text-xl shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    1. School Details &amp; UDISE Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    शाळेचा प्राथमिक तपशील आणि 11 अंकी युडायस कोड पडताळणी
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                Step 1 of 3
              </span>
            </div>

            {/* UDISE Code Field with Live Validation & Lookup */}
            <div className="mb-6 p-4 sm:p-5 bg-slate-950/80 border border-orange-500/30 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label htmlFor="inputSchoolUdise" className="text-xs sm:text-sm font-black text-slate-200 flex items-center gap-1.5">
                  <span>SCHOOL UDISE CODE (11 Digits) / युडायस कोड</span>
                  <span className="text-orange-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
                      isUdiseLengthValid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isUdiseTouched && udiseInlineError
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-slate-800 text-amber-400'
                    }`}
                  >
                    {cleanUdise.length} / 11 Digits
                    {!isUdiseLengthValid && cleanUdise.length > 0 && (
                      <span className="ml-1 text-[10px] text-amber-300">
                        (need {11 - cleanUdise.length})
                      </span>
                    )}
                  </span>
                  {isMaharashtraCode && cleanUdise.length >= 2 && (
                    <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      Maharashtra (Code: 27)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="inputSchoolUdise"
                    maxLength={11}
                    value={udiseCode}
                    onChange={(e) => handleUdiseChange(e.target.value)}
                    onBlur={() => setIsUdiseTouched(true)}
                    placeholder="Enter 11 digit UDISE (e.g. 27330308103)"
                    className={`w-full px-4 py-3 rounded-xl font-mono text-base sm:text-lg text-white placeholder:text-slate-500 focus:outline-hidden transition-all shadow-inner border-2 ${
                      isUdiseTouched && udiseInlineError
                        ? 'bg-red-950/25 border-red-500 text-red-100 focus:border-red-400 focus:ring-2 focus:ring-red-500/30'
                        : isUdiseLengthValid
                        ? 'bg-emerald-950/20 border-emerald-500/80 text-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-700 focus:bg-slate-950 focus:border-orange-500'
                    }`}
                    aria-invalid={!!(isUdiseTouched && udiseInlineError)}
                    aria-describedby={isUdiseTouched && udiseInlineError ? 'udiseInlineValidationMessage' : undefined}
                    required
                  />
                  {isUdiseLengthValid && (
                    <div className="absolute right-3.5 top-3.5 text-emerald-400 flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {isUdiseTouched && udiseInlineError && (
                    <div className="absolute right-3.5 top-3.5 text-red-400 flex items-center gap-1 text-xs font-bold">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  id="btnVerifyUdise"
                  onClick={handleVerifyUdiseClick}
                  disabled={isVerifyingUdise || cleanUdise.length === 0}
                  className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-950/50"
                >
                  <Search className="w-4 h-4" />
                  <span>{isVerifyingUdise ? 'Verifying...' : 'Verify UDISE'}</span>
                </button>
              </div>

              {/* UDISE Inline Validation Error Message */}
              {isUdiseTouched && udiseInlineError && (
                <div
                  id="udiseInlineValidationMessage"
                  className="mt-3 p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-red-300">{udiseInlineError}</p>
                    <p className="text-[11px] text-red-300/80">
                      शाळेचा UDISE कोड अचूक ११ अंकी असावा (उदा. 27330308103). कृपया पूर्ण ११ आकडे प्रविष्ट करा.
                    </p>
                  </div>
                </div>
              )}

              {/* UDISE Verified Success Feedback Notice */}
              {!udiseInlineError && udiseVerifiedInfo && (
                <div
                  id="udiseVerifiedSuccessBanner"
                  className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-300">{udiseVerifiedInfo}</p>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">
                      UDISE कोड यशस्वीरीत्या सत्यापित झाला. / UDISE code verified successfully.
                    </p>
                  </div>
                </div>
              )}

              {/* General Verification Error (if Verify button was pressed) */}
              {!udiseInlineError && udiseVerifyError && (
                <div
                  id="udiseVerifyErrorBanner"
                  className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{udiseVerifyError}</span>
                </div>
              )}
            </div>

            {/* School Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="sm:col-span-2">
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  School Full Name / शाळेचे संपूर्ण नाव <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  id="inputSchoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Zilla Parishad High School, Ambajogai"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  School Category / प्रकार <span className="text-orange-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="Zilla Parishad / Government">Zilla Parishad / Govt School</option>
                  <option value="Government Aided">Government Aided (अनुदानित)</option>
                  <option value="Mahanagarpalika / Municipal">Mahanagarpalika / Municipal</option>
                  <option value="Ashram Shala / Tribal">Ashram Shala / Tribal Welfare</option>
                  <option value="Private Unaided">Private Unaided</option>
                  <option value="Central / Navodaya">Central / Navodaya Vidyalaya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Instruction Medium / माध्यम
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="Semi-English">Semi-English (सेमी-इंग्रजी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="English">English Medium</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Urdu">Urdu (उर्दू)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  District / जिल्हा <span className="text-orange-400">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-orange-500 transition-colors cursor-pointer"
                >
                  {MAHARASHTRA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Taluka / Block / तालुका
                </label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder="e.g. Ambajogai, Haveli, etc."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  City / Village / गाव <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ambajogai"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Pincode / पिनकोड
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 431517"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Student Strength (Class 5–10)
                </label>
                <select
                  value={studentStrength}
                  onChange={(e) => setStudentStrength(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="Under 100">Under 100 Students</option>
                  <option value="100-300">100 – 300 Students</option>
                  <option value="300-600">300 – 600 Students</option>
                  <option value="600+">600+ Students</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  School Email / शाळेचा ईमेल
                </label>
                <input
                  type="email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  placeholder="school@smartenglish.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  School Phone / संपर्क क्र.
                </label>
                <input
                  type="tel"
                  value={schoolPhone}
                  onChange={(e) => setSchoolPhone(e.target.value)}
                  placeholder="02446-248000 or Mobile"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: PRINCIPAL / HEADMASTER DETAILS               */}
          {/* ======================================================== */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-xl shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    2. Principal / Headmaster Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    मुख्याध्यापक तपशील व प्रशासकीय पोर्टल लॉगिन पासवर्ड
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Step 2 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="sm:col-span-2">
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Principal Full Name / मुख्याध्यापकांचे संपूर्ण नाव <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  id="inputPrincipalName"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh V. Patil"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Designation / पदनाम
                </label>
                <input
                  type="text"
                  value={principalDesignation}
                  onChange={(e) => setPrincipalDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Mobile Number / मोबाईल क्र. <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="inputPrincipalPhone"
                    maxLength={10}
                    value={principalPhone}
                    onChange={(e) => setPrincipalPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Official Email / ईमेल
                </label>
                <input
                  type="email"
                  value={principalEmail}
                  onChange={(e) => setPrincipalEmail(e.target.value)}
                  placeholder="principal@school.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-200">
                    Principal Portal Password <span className="text-orange-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPrincipalPass(!showPrincipalPass)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    {showPrincipalPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPrincipalPass ? 'text' : 'password'}
                    id="inputPrincipalPass"
                    value={principalPassword}
                    onChange={(e) => setPrincipalPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrincipalPass(!showPrincipalPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPrincipalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-200">
                    Confirm Password / पुष्टी करा <span className="text-orange-400">*</span>
                  </label>
                  {principalPassword && principalConfirmPassword && (
                    <span
                      className={`text-[10px] font-bold ${
                        principalPassword === principalConfirmPassword ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {principalPassword === principalConfirmPassword ? '✓ Match' : '✗ Do not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPrincipalConfirmPass ? 'text' : 'password'}
                    value={principalConfirmPassword}
                    onChange={(e) => setPrincipalConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrincipalConfirmPass(!showPrincipalConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPrincipalConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: CLASSROOM IN-CHARGE DETAILS                  */}
          {/* ======================================================== */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 text-xl shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    3. Classroom In-Charge Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    शाळेतील वर्ग इंग्रजी सराव व व्यवस्थापन लॉगिन
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Step 3 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="sm:col-span-2">
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Classroom In-Charge Name / शिक्षकाचे नाव <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  id="inputCoordinatorName"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  placeholder="e.g. Smt. Sunita M. Shinde"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Subject / Role / विषय
                </label>
                <input
                  type="text"
                  value={coordinatorSubject}
                  onChange={(e) => setCoordinatorSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Mobile Number / मोबाईल <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="inputCoordinatorPhone"
                    maxLength={10}
                    value={coordinatorPhone}
                    onChange={(e) => setCoordinatorPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="97XXXXXXXX"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-200 block mb-1.5">
                  Email Address / ईमेल
                </label>
                <input
                  type="email"
                  value={coordinatorEmail}
                  onChange={(e) => setCoordinatorEmail(e.target.value)}
                  placeholder="classroom@school.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-200">
                    Classroom Password / वर्ग पासवर्ड <span className="text-orange-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCoordinatorPass(!showCoordinatorPass)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    {showCoordinatorPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showCoordinatorPass ? 'text' : 'password'}
                    id="inputCoordinatorPass"
                    value={coordinatorPassword}
                    onChange={(e) => setCoordinatorPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCoordinatorPass(!showCoordinatorPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showCoordinatorPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SUBMIT BUTTON & MAIN PAGE NAVIGATION                     */}
          {/* ======================================================== */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              id="btnGoMainPageBottom"
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Main Page / मुख्य पृष्ठ</span>
            </button>

            <button
              type="submit"
              id="btnRegisterSchoolSubmit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-400 hover:to-amber-500 shadow-xl shadow-orange-950/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Registering School...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5" />
                  <span>Submit Registration / शाळा नोंदणी करा ➔</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* SUCCESS CONFIRMATION MODAL */}
      {successData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-orange-500/40 rounded-3xl p-6 sm:p-8 text-left shadow-2xl flex flex-col my-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 mx-auto text-3xl mb-4 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white text-center">
              School Successfully Registered!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 text-center mt-1">
              शाळा यशस्वीरीत्या नोंदणीकृत झाली आहे. आपले खाते सक्रिय झाले आहे.
            </p>

            <div className="mt-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">School Name:</span>
                <span className="text-xs font-bold text-white text-right">{successData.schoolName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">School UDISE:</span>
                <span className="text-xs font-mono font-bold text-orange-400">{successData.udiseCode}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Principal:</span>
                <span className="text-xs font-semibold text-white">{successData.principalName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Classroom In-Charge:</span>
                <span className="text-xs font-semibold text-white">{successData.coordinatorName}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl text-blue-200 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Students and teachers from your school can now select UDISE <strong>{successData.udiseCode}</strong> on the login page.
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                id="btnSuccessGoHome"
                onClick={onNavigateHome}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-400 hover:to-amber-500 shadow-xl shadow-orange-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to Login Page / मुख्य पृष्ठावर जा ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-20 w-full border-t border-slate-800 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
        <p>© 2026 Smart English Sathi • All Maharashtra Schools Portal</p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
        >
          ← Return to Login Screen
        </button>
      </footer>
    </div>
  );
};

export default SchoolRegister;
