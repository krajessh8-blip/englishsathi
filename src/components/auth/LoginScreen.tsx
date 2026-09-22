import React, { useState, useEffect, useRef } from 'react';
import { AppRole, AuthUser } from '../../types';
import {
  INITIAL_ROLE_CREDENTIALS,
  verifyCredentials,
  saveAuthUser,
  getLockoutStatus,
} from '../../data/authConfig';
import {
  Unlock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  UserCheck,
  X,
  Camera,
  QrCode,
  Sparkles,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import jsQR from 'jsqr';

import { playChimeSound } from '../../utils/howlerAudio';
import { ManagedSchool, getStoredManagedSchools } from '../../data/superAdminData';

interface Props {
  onLoginSuccess: (user: AuthUser) => void;
  initialRole?: AppRole;
  isAdminMode?: boolean;
  onNavigateRegister?: () => void;
}

type RoleId = 'student' | 'individual' | 'principal' | 'admin' | 'super_admin' | 'classroom' | 'coordinator';

interface RoleConfig {
  id: RoleId;
  title: string;
  marathiTitle: string;
  badge: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  badgeColor: string;
  defaultEmail: string;
  buttonLabel: string;
  description: string;
}

const ALL_ROLES: RoleConfig[] = [
  {
    id: 'student',
    title: 'Student Login',
    marathiTitle: 'शाळेचा विद्यार्थी प्रवेश',
    badge: 'Class 5–12',
    emoji: '🎓',
    gradient: 'from-green-600 to-emerald-700',
    borderColor: 'border-emerald-400/30',
    badgeColor: 'bg-black/25 text-emerald-200 border-emerald-300/30',
    defaultEmail: 'student@smartenglish.edu',
    buttonLabel: 'Student Sign In →',
    description: 'Classroom practice lab & 60 lessons',
  },
  {
    id: 'individual',
    title: 'Individual Learner',
    marathiTitle: 'स्वतंत्र शिकणारा',
    badge: 'Solo Speaking',
    emoji: '👤',
    gradient: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-400/30',
    badgeColor: 'bg-black/25 text-blue-200 border-blue-300/30',
    defaultEmail: 'learner@smartenglish.edu',
    buttonLabel: 'Learner Sign In →',
    description: 'For parents, professionals & solo learners',
  },
  {
    id: 'classroom',
    title: 'Classroom / Principal',
    marathiTitle: 'वर्ग / मुख्याध्यापक लॉगिन',
    badge: 'School & Classroom',
    emoji: '🏫',
    gradient: 'from-orange-600 to-amber-700',
    borderColor: 'border-orange-400/30',
    badgeColor: 'bg-black/25 text-orange-200 border-orange-300/30',
    defaultEmail: 'classroom@smartenglish.edu',
    buttonLabel: 'Classroom Sign In →',
    description: 'Whole-class smart board group practice & progress monitoring',
  },
];

export const LoginScreen: React.FC<Props> = ({
  onLoginSuccess,
  isAdminMode = false,
  onNavigateRegister,
}) => {
  const [roleCredentials, setRoleCredentials] = useState<Record<RoleId, { username: string; password: string; showPassword: boolean }>>({
    student: { username: 'student@smartenglish.edu', password: '', showPassword: false },
    individual: { username: 'learner@smartenglish.edu', password: '', showPassword: false },
    principal: { username: 'principal@smartenglish.edu', password: '', showPassword: false },
    classroom: { username: 'classroom@smartenglish.edu', password: '', showPassword: false },
    coordinator: { username: 'classroom@smartenglish.edu', password: '', showPassword: false },
    admin: { username: '', password: '', showPassword: false },
    super_admin: { username: '', password: '', showPassword: false },
  });

  const [activeModalRole, setActiveModalRole] = useState<RoleId>('student');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState<boolean>(false);

  // Registered Schools Directory for multi-school tenancy
  const [registeredSchools, setRegisteredSchools] = useState<ManagedSchool[]>(() => {
    const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);
    return getStoredManagedSchools().filter((s) => !TEST_UDISES.has(s.udiseCode));
  });

  // Fetch registered schools from server on mount
  useEffect(() => {
    const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);
    fetch('/api/schools')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.schools)) {
          const valid = d.schools.filter((s: any) => s.udiseCode && !TEST_UDISES.has(s.udiseCode));
          setRegisteredSchools((prev) => {
            const map = new Map<string, ManagedSchool>();
            prev.filter((s) => !TEST_UDISES.has(s.udiseCode)).forEach((s) => map.set(s.udiseCode, s));
            valid.forEach((s: any) => {
              if (!map.has(s.udiseCode)) {
                map.set(s.udiseCode, {
                  udiseCode: s.udiseCode,
                  schoolName: s.schoolName || `School ${s.udiseCode}`,
                  city: s.city || '',
                  district: s.district || '',
                  state: s.state || 'Maharashtra',
                  principalName: s.principalName || '',
                  principalEmail: s.principalEmail || '',
                  principalPhone: s.principalPhone || '',
                  totalStudents: 0,
                  approvedStudents: 0,
                  pendingStudents: 0,
                  activeSessions: 0,
                  registeredDate: s.registeredDate || '',
                  status: 'ACTIVE',
                });
              }
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Classroom & School Access Modal State
  const [schoolModalTab, setSchoolModalTab] = useState<'classroom' | 'principal'>('classroom');
  const [coordUdise, setCoordUdise] = useState<string>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mvm_active_udise') : '';
    const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);
    return stored && !TEST_UDISES.has(stored) ? stored : '';
  });
  const [coordEmail, setCoordEmail] = useState<string>('');
  const [coordPassword, setCoordPassword] = useState<string>('');
  const [showCoordPass, setShowCoordPass] = useState<boolean>(false);

  const [princUdise, setPrincUdise] = useState<string>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mvm_active_udise') : '';
    const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);
    return stored && !TEST_UDISES.has(stored) ? stored : '';
  });
  const [princEmail, setPrincEmail] = useState<string>('');
  const [princPassword, setPrincPassword] = useState<string>('');
  const [showPrincPass, setShowPrincPass] = useState<boolean>(false);

  // Task 2: Individual Learner State
  const [individualMode, setIndividualMode] = useState<'register' | 'login'>('register');
  const [indEmail, setIndEmail] = useState<string>('learner@smartenglish.edu');
  const [indPassword, setIndPassword] = useState<string>('');
  const [indConfirmPassword, setIndConfirmPassword] = useState<string>('');
  const [showIndPass, setShowIndPass] = useState<boolean>(false);
  const [showIndConfirmPass, setShowIndConfirmPass] = useState<boolean>(false);

  // Task 3: School Student Registration State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [studentModalTab, setStudentModalTab] = useState<'register' | 'login'>('login');
  const [studentUdise, setStudentUdise] = useState<string>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mvm_active_udise') : '';
    const TEST_UDISES = new Set(['27330308103', '27251401201', '27240804302', '27210103401', '27340506202']);
    return stored && !TEST_UDISES.has(stored) ? stored : '';
  });
  const [studentFullName, setStudentFullName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('10');
  const [studentStream, setStudentStream] = useState<string>('');
  const [studentRollNo, setStudentRollNo] = useState<string>('');
  const [studentDivision, setStudentDivision] = useState<string>('A');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState<string>('');
  const [showStudentPass, setShowStudentPass] = useState<boolean>(false);
  const [showStudentConfirmPass, setShowStudentConfirmPass] = useState<boolean>(false);

  // Existing Student Login State (Student ID / Roll No)
  const [studentLoginEmail, setStudentLoginEmail] = useState<string>('');

  // QR Scanner States
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<string>('Align QR code inside frame');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check lockout status periodically
  useEffect(() => {
    const checkLock = () => {
      const status = getLockoutStatus();
      if (status.isLocked) {
        setLockoutCountdown(status.secondsRemaining);
      } else {
        setLockoutCountdown(0);
      }
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup camera stream on unmount or when modal closes
  useEffect(() => {
    if (!isQrModalOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isQrModalOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraStatus('Requesting camera access...');
    setIsScanning(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser device.');
      setCameraStatus('Camera not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraStatus('Camera active • Align QR code');
        scanFrame();
      }
    } catch (err) {
      console.warn('Camera access denied or error:', err);
      setCameraError(
        'Camera permission was denied or is blocked in this window. You can click a demo school QR below to test instantly!'
      );
      setCameraStatus('Camera permission required');
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleQrSuccess(code.data);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const playSuccessChime = () => {
    playChimeSound();
  };

  const handleQrSuccess = (qrContent: string) => {
    stopCamera();
    playSuccessChime();
    setCameraStatus('✅ QR Code Recognized!');

    let schoolId = 'smart_school_01';
    const lower = qrContent.toLowerCase();
    if (lower.includes('kbp') || lower.includes('702')) {
      schoolId = 'kbp_vidyalaya_satara';
    } else if (lower.includes('dnyan') || lower.includes('310')) {
      schoolId = 'dnyan_mandir_karad';
    } else if (lower.includes('shivaji') || lower.includes('409')) {
      schoolId = 'shree_shivaji_phaltan';
    }

    setTimeout(() => {
      onLoginSuccess({
        role: 'student',
        name: `Student (${schoolId})`,
        identifier: schoolId,
        title: 'Student Explorer',
        avatar: '🎒',
      });
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const updateCredential = (roleId: RoleId, field: 'username' | 'password', val: string) => {
    setRoleCredentials((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [field]: val,
      },
    }));
  };

  const toggleShowPassword = (roleId: RoleId) => {
    setRoleCredentials((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        showPassword: !prev[roleId].showPassword,
      },
    }));
  };

  const authenticateRole = (roleId: RoleId, customUser?: string, customPass?: string) => {
    setErrorMessage(null);
    const creds = roleCredentials[roleId];
    const username = (customUser ?? creds?.username ?? '').trim() || ALL_ROLES.find((r) => r.id === roleId)?.defaultEmail || '';
    const password = (customPass ?? creds?.password ?? '').trim();

    if (!password) {
      setErrorMessage(`Please enter password / कृपया पासवर्ड टाका (${roleId.replace('_', ' ').toUpperCase()})`);
      return;
    }

    const displayName = username.includes('@') ? username.split('@')[0] : username;
    let user: AuthUser;

    if (roleId === 'principal') {
      user = {
        role: 'principal',
        name: 'Principal Sumant D. Dalvi',
        marathiName: 'प्राचार्य सुमंत डी. दळवी',
        identifier: username || 'PRI-001',
        title: 'School Principal & Academic Head',
        avatar: '🏫',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else if (roleId === 'admin') {
      const isCoord = username.toLowerCase().includes('coord') || username.toLowerCase().includes('class');
      if (isCoord) {
        user = {
          role: 'classroom',
          roleType: 'classroom',
          name: displayName || 'Classroom Teacher',
          marathiName: 'वर्ग शिक्षक (सामूहिक सराव)',
          identifier: username || 'CLASS-01',
          title: 'Classroom Whole-Class Practice Mode',
          avatar: '🏫',
          udiseCode: '27330308103',
          schoolName: 'Smart English Sathi Model School',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        user = {
          role: 'admin',
          name: 'System Administrator',
          marathiName: 'प्रशासक',
          identifier: username || 'ADM-01',
          title: 'System Administrator',
          avatar: '🛡️',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    } else if (roleId === 'classroom' || roleId === 'coordinator') {
      user = {
        role: 'classroom',
        roleType: 'classroom',
        name: displayName || 'Classroom Teacher',
        marathiName: 'वर्ग शिक्षक (सामूहिक सराव)',
        identifier: username || 'CLASS-01',
        title: 'Classroom Whole-Class Practice Mode',
        avatar: '🏫',
        udiseCode: '27330308103',
        schoolName: 'Smart English Sathi Model School',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else if (roleId === 'super_admin') {
      user = {
        role: 'admin',
        roleType: 'super_admin',
        isSuperAdmin: true,
        name: 'Super Admin (Owner)',
        marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
        identifier: username || 'SUPER-ADM (Owner)',
        title: 'Super Administrator & Multi-School Authority',
        avatar: '👑',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else if (roleId === 'individual') {
      user = {
        role: 'student',
        name: displayName || 'Individual Learner',
        marathiName: 'स्वतंत्र शिकणारा',
        identifier: username,
        title: 'Solo English Learner',
        avatar: '👤',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else {
      user = {
        role: 'student',
        name: displayName || 'Student',
        marathiName: 'विद्यार्थी',
        identifier: username,
        title: 'Classroom Student • Practice Lab',
        avatar: '🎓',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    localStorage.setItem('user', username);
    localStorage.setItem('role', user.role);
    localStorage.setItem('smart_english_app_role', user.role);
    saveAuthUser(user);
    playSuccessChime();
    if (user.role === 'classroom' && typeof window !== 'undefined') {
      window.history.pushState({}, '', '/classroom');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onLoginSuccess(user);
  };

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = indEmail.trim();
    if (individualMode === 'register') {
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setErrorMessage('Please enter a valid email address / कृपया वैध ईमेल आयडी टाका.');
        return;
      }
      if (indPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters / पासवर्ड किमान ६ अक्षरांचा असावा.');
        return;
      }
      if (indPassword !== indConfirmPassword) {
        setErrorMessage('Passwords do not match / पासवर्ड जुळत नाहीत. कृपया खात्री करा.');
        return;
      }

      const displayName = trimmedEmail.split('@')[0];
      const user: AuthUser = {
        role: 'student',
        name: displayName || 'Individual Learner',
        marathiName: 'स्वतंत्र शिकणारा',
        identifier: trimmedEmail,
        title: 'Solo English Learner (No UDISE)',
        avatar: '👤',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      localStorage.setItem('user', trimmedEmail);
      localStorage.setItem('role', 'student');
      saveAuthUser(user);
      playSuccessChime();
      onLoginSuccess(user);
    } else {
      if (!trimmedEmail) {
        setErrorMessage('Please enter email address / कृपया ईमेल टाका.');
        return;
      }
      if (!indPassword) {
        setErrorMessage('Please enter password / कृपया पासवर्ड टाका.');
        return;
      }

      const displayName = trimmedEmail.includes('@') ? trimmedEmail.split('@')[0] : trimmedEmail;
      const user: AuthUser = {
        role: 'student',
        name: displayName || 'Individual Learner',
        marathiName: 'स्वतंत्र शिकणारा',
        identifier: trimmedEmail,
        title: 'Solo English Learner',
        avatar: '👤',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      localStorage.setItem('user', trimmedEmail);
      localStorage.setItem('role', 'student');
      saveAuthUser(user);
      playSuccessChime();
      onLoginSuccess(user);
    }
  };

  const handleStudentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUdise = studentUdise.trim();
    if (trimmedUdise.length !== 11 || !/^\d{11}$/.test(trimmedUdise)) {
      setErrorMessage('UDISE code must be exactly 11 digits / युडायस कोड अचूक ११ अंकी असावा.');
      return;
    }
    const trimmedName = studentFullName.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter Student Full Name / विद्यार्थ्याचे पूर्ण नाव टाका.');
      return;
    }
    const trimmedEmail = studentEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Valid Email required / कृपया वैध ईमेल आयडी टाका.');
      return;
    }
    const isHigherSec = studentClass === '11' || studentClass === '12';
    if (isHigherSec && !studentStream) {
      setErrorMessage('Please select Stream / कृपया शाखा निवडा.');
      return;
    }
    const trimmedRoll = studentRollNo.trim();
    if (!trimmedRoll) {
      setErrorMessage('Please enter Roll Number / हजेरी क्रमांक टाका.');
      return;
    }
    if (studentPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters / पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      setErrorMessage('Passwords do not match / पासवर्ड जुळत नाहीत. कृपया खात्री करा.');
      return;
    }

    const classDisplay = isHigherSec 
      ? `Class ${studentClass} (${studentStream.split(' ')[0]})` 
      : `Class ${studentClass}`;

    const schoolObj = registeredSchools.find((s) => s.udiseCode === trimmedUdise);
    const resolvedSchoolName = schoolObj ? schoolObj.schoolName : `School UDISE ${trimmedUdise}`;

    const user: AuthUser = {
      role: 'student',
      name: trimmedName,
      marathiName: 'विद्यार्थी',
      identifier: `${trimmedUdise}-C${studentClass}-${studentDivision}-${trimmedRoll}`,
      title: `${resolvedSchoolName} • ${classDisplay} (${studentDivision}) • Roll ${trimmedRoll}`,
      avatar: '🎓',
      udiseCode: trimmedUdise,
      schoolName: resolvedSchoolName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem('user', trimmedName);
    localStorage.setItem('role', 'student');
    localStorage.setItem('mvm_active_udise', trimmedUdise);
    localStorage.setItem('mvm_active_school_name', resolvedSchoolName);
    saveAuthUser(user);
    playSuccessChime();
    setIsStudentModalOpen(false);
    onLoginSuccess(user);
  };

  const handleStudentLoginModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedLoginEmail = studentLoginEmail.trim();
    if (!trimmedLoginEmail) {
      setErrorMessage('Student ID / Roll No is mandatory / विद्यार्थी आयडी किंवा हजेरी क्रमांक आवश्यक आहे.');
      return;
    }
    const trimmedUdise = studentUdise.trim();
    if (!trimmedUdise) {
      setErrorMessage('Please select your school from the dropdown / कृपया शाळेची निवड करा.');
      return;
    }
    if (trimmedUdise.length !== 11 || !/^\d{11}$/.test(trimmedUdise)) {
      setErrorMessage('UDISE code must be exactly 11 digits / युडायस कोड अचूक ११ अंकी असावा.');
      return;
    }
    if (!studentPassword) {
      setErrorMessage('Please enter student password / कृपया पासवर्ड टाका.');
      return;
    }

    const schoolObj = registeredSchools.find((s) => s.udiseCode === trimmedUdise);
    const resolvedSchoolName = schoolObj ? schoolObj.schoolName : `School UDISE ${trimmedUdise}`;
    const displayName = trimmedLoginEmail.includes('@') ? trimmedLoginEmail.split('@')[0] : trimmedLoginEmail;

    const user: AuthUser = {
      role: 'student',
      name: displayName || 'Classroom Student',
      marathiName: 'विद्यार्थी',
      identifier: `${trimmedUdise}-${trimmedLoginEmail}`,
      title: `${resolvedSchoolName} • ID: ${trimmedLoginEmail}`,
      avatar: '🎓',
      udiseCode: trimmedUdise,
      schoolName: resolvedSchoolName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem('user', user.name);
    localStorage.setItem('role', 'student');
    localStorage.setItem('mvm_active_udise', trimmedUdise);
    localStorage.setItem('mvm_active_school_name', resolvedSchoolName);
    saveAuthUser(user);
    playSuccessChime();
    setIsStudentModalOpen(false);
    onLoginSuccess(user);
  };

  const handleClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUdise = coordUdise.trim();
    if (!trimmedUdise) {
      setErrorMessage('Please select or enter school UDISE / कृपया शाळेचा युडायस कोड निवडा.');
      return;
    }
    if (trimmedUdise.length !== 11 || !/^\d{11}$/.test(trimmedUdise)) {
      setErrorMessage('UDISE code must be exactly 11 digits / युडायस कोड अचूक ११ अंकी असावा.');
      return;
    }
    const trimmedEmail = coordEmail.trim();
    if (!trimmedEmail) {
      setErrorMessage('Classroom Username / Email is required / वर्ग युझरनेम किंवा ईमेल आवश्यक आहे.');
      return;
    }
    if (!coordPassword) {
      setErrorMessage('Please enter password / कृपया पासवर्ड टाका.');
      return;
    }

    const schoolObj = registeredSchools.find((s) => s.udiseCode === trimmedUdise);
    const resolvedSchoolName = schoolObj ? schoolObj.schoolName : `School UDISE ${trimmedUdise}`;
    const displayName = trimmedEmail.includes('@') ? trimmedEmail.split('@')[0] : trimmedEmail;

    const user: AuthUser = {
      role: 'classroom',
      roleType: 'classroom',
      name: displayName || 'Classroom Teacher',
      marathiName: 'वर्ग शिक्षक (सामूहिक सराव)',
      identifier: trimmedEmail || `CLASS-${trimmedUdise}`,
      title: `${resolvedSchoolName} • Classroom Practice`,
      avatar: '🏫',
      udiseCode: trimmedUdise,
      schoolName: resolvedSchoolName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem('user', user.name);
    localStorage.setItem('role', 'classroom');
    localStorage.setItem('smart_english_app_role', 'classroom');
    localStorage.setItem('mvm_active_udise', trimmedUdise);
    localStorage.setItem('mvm_active_school_name', resolvedSchoolName);
    saveAuthUser(user);
    playSuccessChime();
    setIsQuickModalOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/classroom');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onLoginSuccess(user);
  };

  const handleDemoClassroomLogin = () => {
    setErrorMessage(null);
    const demoSchool = registeredSchools[0];
    const demoUdise = demoSchool ? demoSchool.udiseCode : coordUdise || '27123456789';
    const demoName = demoSchool ? demoSchool.schoolName : 'Registered School';

    const user: AuthUser = {
      role: 'classroom',
      roleType: 'classroom',
      name: 'Classroom Teacher (Whole-Class Practice)',
      marathiName: 'वर्ग शिक्षक (स्मार्ट बोर्ड सराव)',
      identifier: 'classroom@smartenglish.edu',
      title: `${demoName} • Classroom Practice`,
      avatar: '🏫',
      udiseCode: demoUdise,
      schoolName: demoName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem('user', user.name);
    localStorage.setItem('role', 'classroom');
    localStorage.setItem('smart_english_app_role', 'classroom');
    localStorage.setItem('mvm_active_udise', demoUdise);
    localStorage.setItem('mvm_active_school_name', demoName);
    saveAuthUser(user);
    playSuccessChime();
    setIsQuickModalOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/classroom');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onLoginSuccess(user);
  };

  const handlePrincipalModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUdise = princUdise.trim();
    if (!trimmedUdise) {
      setErrorMessage('Please select or enter school UDISE / कृपया शाळेचा युडायस कोड निवडा.');
      return;
    }
    if (trimmedUdise.length !== 11 || !/^\d{11}$/.test(trimmedUdise)) {
      setErrorMessage('UDISE code must be exactly 11 digits / युडायस कोड अचूक ११ अंकी असावा.');
      return;
    }
    const trimmedEmail = princEmail.trim();
    if (!trimmedEmail) {
      setErrorMessage('Principal Email / Mobile is required / मुख्याध्यापक ईमेल किंवा मोबाईल आवश्यक आहे.');
      return;
    }
    if (!princPassword) {
      setErrorMessage('Please enter password / कृपया पासवर्ड टाका.');
      return;
    }

    const schoolObj = registeredSchools.find((s) => s.udiseCode === trimmedUdise);
    const resolvedSchoolName = schoolObj ? schoolObj.schoolName : `School UDISE ${trimmedUdise}`;
    const displayName = trimmedEmail.includes('@') ? trimmedEmail.split('@')[0] : trimmedEmail;

    const user: AuthUser = {
      role: 'principal',
      roleType: 'principal',
      name: displayName || schoolObj?.principalName || 'School Principal',
      marathiName: 'प्राचार्य / मुख्याध्यापक',
      identifier: trimmedEmail || `PRI-${trimmedUdise}`,
      title: `${resolvedSchoolName} • School Principal`,
      avatar: '🏫',
      udiseCode: trimmedUdise,
      schoolName: resolvedSchoolName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem('user', user.name);
    localStorage.setItem('role', 'principal');
    localStorage.setItem('smart_english_app_role', 'principal');
    localStorage.setItem('mvm_active_udise', trimmedUdise);
    localStorage.setItem('mvm_active_school_name', resolvedSchoolName);
    saveAuthUser(user);
    playSuccessChime();
    setIsQuickModalOpen(false);
    onLoginSuccess(user);
  };

  const handleDemoPrincipalLogin = () => {
    setErrorMessage(null);
    const demoSchool = registeredSchools[0];
    const demoUdise = demoSchool ? demoSchool.udiseCode : princUdise || '27123456789';
    const demoName = demoSchool ? demoSchool.schoolName : 'Registered School';

    const user: AuthUser = {
      role: 'principal',
      roleType: 'principal',
      name: demoSchool?.principalName || 'Principal Sumant D. Dalvi',
      marathiName: 'प्राचार्य / मुख्याध्यापक',
      identifier: 'principal@smartenglish.edu',
      title: `${demoName} • School Principal`,
      avatar: '🏫',
      udiseCode: demoUdise,
      schoolName: demoName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem('user', user.name);
    localStorage.setItem('role', 'principal');
    localStorage.setItem('smart_english_app_role', 'principal');
    localStorage.setItem('mvm_active_udise', demoUdise);
    localStorage.setItem('mvm_active_school_name', demoName);
    saveAuthUser(user);
    playSuccessChime();
    setIsQuickModalOpen(false);
    onLoginSuccess(user);
  };

  return (
    <div className="bg-[#020617] min-h-screen w-full overflow-x-hidden text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 2xl:w-[600px] 2xl:h-[600px] rounded-full bg-emerald-600/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 2xl:w-[600px] 2xl:h-[600px] rounded-full bg-teal-600/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 2xl:w-[600px] 2xl:h-[600px] rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      {/* Header - Full width */}
      <header className="relative z-10 w-full px-6 lg:px-16 xl:px-24 py-6 flex justify-between items-center border-b border-slate-900/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-green-500 rounded-xl 2xl:rounded-2xl flex items-center justify-center text-2xl 2xl:text-3xl shadow-lg">
            🗣️
          </div>
          <div>
            <h1 className="text-white text-2xl lg:text-3xl 2xl:text-4xl font-bold">
              Smart English Sathi
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex gap-3">
            <span className="px-4 py-2 2xl:px-6 2xl:py-3 bg-slate-800 rounded-full text-slate-300 text-sm 2xl:text-base font-semibold">
              20 Situations
            </span>
            <span className="px-4 py-2 2xl:px-6 2xl:py-3 bg-slate-800 rounded-full text-slate-300 text-sm 2xl:text-base font-semibold">
              Class 5-12
            </span>
          </div>
          <button
            type="button"
            id="btnGoSchoolRegisterHeader"
            onClick={() => {
              if (onNavigateRegister) {
                onNavigateRegister();
              } else if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/register');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="px-3.5 py-2 2xl:px-5 2xl:py-2.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 rounded-xl text-xs 2xl:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🏫 School Register (UDISE)</span>
          </button>
          <button
            type="button"
            id="btnHeaderClassroomSignIn"
            onClick={() => {
              setSchoolModalTab('classroom');
              setIsQuickModalOpen(true);
              setErrorMessage(null);
            }}
            className="px-4 py-2 2xl:px-6 2xl:py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs 2xl:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Classroom / Principal Sign in</span>
            <span className="text-[11px] opacity-80 font-normal">/ वर्ग / मुख्याध्यापक लॉगिन</span>
          </button>
        </div>
      </header>

      {/* Global Error Banner if any */}
      {errorMessage && (
        <div className="relative z-20 max-w-xl mx-auto mt-4 px-4 w-full">
          <div className="p-3.5 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-sm flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Section */}
      <div className="relative z-10 flex-1 w-full px-6 lg:px-12 xl:px-20 py-8 lg:py-12 flex flex-col justify-center">
        {/* Split hero with 50% left, 2 cards on right */}
        <div className="w-full flex flex-col lg:flex-row gap-12 items-center">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-left">
              <h2 className="text-4xl lg:text-6xl xl:text-7xl font-black text-white leading-tight">
                Speak English in <span className="text-green-400">20 Days</span>
              </h2>
              <p className="text-slate-400 text-lg lg:text-xl mt-6 max-w-2xl leading-relaxed">
                Real school situations - From classroom to playground. Learn with Marathi + English.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="px-5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium shadow-sm">
                  📚 60 Lessons
                </span>
                <span className="px-5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium shadow-sm">
                  🎯 Solo Speaking Lab
                </span>
                <span className="px-5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium shadow-sm">
                  🏫 For All Schools
                </span>
              </div>
            </div>

            {/* Right: Student Portal Sign In (School Student + Individual Learner) */}
            <div className="w-full lg:w-1/2 flex flex-col items-start gap-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* CARD 1: SCHOOL STUDENT REGISTRATION & SIGN IN (With UDISE) */}
              <div
                id="cardSchoolStudent"
                className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col justify-between"
              >
                {/* Header Banner */}
                <div className="px-5 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0">
                      🎓
                    </div>
                    <div>
                      <h2 className="text-base font-black tracking-tight leading-tight text-white">
                        School Student (With UDISE)
                      </h2>
                      <p className="text-[11px] text-amber-200 font-medium">
                        शाळेचा विद्यार्थी • UDISE द्वारे नोंदणी व लॉगिन
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-amber-300 border border-amber-400/30">
                    Class 1–12
                  </span>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Role Dropdown */}
                    <div>
                      <label className="text-xs font-black text-slate-200 block mb-1">
                        Select Role / आपली भूमिका निवडा <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          disabled
                          value="student"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-bold text-sm text-white focus:outline-hidden appearance-none cursor-default"
                        >
                          <option value="student">🎓 School Student (शाळेचा विद्यार्थी)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Toggle: New Registration vs Existing Login */}
                    <div className="flex gap-2.5 my-1">
                      <button
                        type="button"
                        id="tabStudentCardRegister"
                        onClick={() => setStudentModalTab('register')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          studentModalTab === 'register'
                            ? 'bg-white text-emerald-700 shadow-md'
                            : 'bg-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✨ New Registration
                      </button>
                      <button
                        type="button"
                        id="tabStudentCardLogin"
                        onClick={() => setStudentModalTab('login')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          studentModalTab === 'login'
                            ? 'bg-white text-emerald-700 shadow-md'
                            : 'bg-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        🔑 Existing Login
                      </button>
                    </div>

                    {studentModalTab === 'register' ? (
                      /* REGISTER AS STUDENT FORM: EXACT 7 FIELDS IN ORDER */
                      <form onSubmit={handleStudentRegisterSubmit} className="space-y-3 pt-1">
                        {/* 1. SCHOOL UDISE CODE / SELECT SCHOOL */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              SELECT SCHOOL / शाळा निवडा <span className="text-emerald-400">*</span>
                            </label>
                            {registeredSchools.length > 0 && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                                {registeredSchools.length} {registeredSchools.length === 1 ? 'School' : 'Schools'}
                              </span>
                            )}
                          </div>
                          {registeredSchools.length > 0 ? (
                            <div className="relative">
                              <select
                                value={studentUdise}
                                onChange={(e) => setStudentUdise(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer appearance-none pr-8"
                                required
                              >
                                <option value="">-- Select Your School / शाळा निवडा --</option>
                                {registeredSchools.map((sch) => (
                                  <option key={sch.udiseCode} value={sch.udiseCode}>
                                    {sch.schoolName} ({sch.udiseCode})
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                                ▼
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <input
                                type="text"
                                maxLength={11}
                                value={studentUdise}
                                onChange={(e) => setStudentUdise(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 11-digit UDISE (e.g. 27123456789)"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                                required
                              />
                            </div>
                          )}
                          {studentUdise && registeredSchools.find((s) => s.udiseCode === studentUdise) && (
                            <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-1.5">
                              <span>🏫</span>
                              <span className="font-bold truncate">
                                {registeredSchools.find((s) => s.udiseCode === studentUdise)?.schoolName}
                              </span>
                              <span className="text-emerald-500">•</span>
                              <span className="font-mono text-emerald-400">UDISE: {studentUdise}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. STUDENT FULL NAME / विद्यार्थ्याचे पूर्ण नाव * */}
                        <div>
                          <label className="text-xs font-black text-slate-200 block mb-1">
                            STUDENT FULL NAME / विद्यार्थ्याचे पूर्ण नाव <span className="text-emerald-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={studentFullName}
                            onChange={(e) => setStudentFullName(e.target.value)}
                            placeholder="Riya Sharma / आर्यन जाधव"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>

                        {/* 3. EMAIL ID / ईमेल आयडी * - NEW ADD */}
                        <div>
                          <label className="text-xs font-black text-slate-200 block mb-1">
                            EMAIL ID / ईमेल आयडी <span className="text-emerald-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="student@email.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                            required
                          />
                          <p className="text-[10px] text-slate-400 mt-0.5">Valid Email required for account verification &amp; login</p>
                        </div>

                        {/* 4. CLASS / इयत्ता * (Dropdown 1 to 12) */}
                        <div>
                          <label className="text-xs font-black text-slate-200 block mb-1">
                            CLASS / इयत्ता (1 ते 12) <span className="text-emerald-400">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={studentClass}
                              onChange={(e) => setStudentClass(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-bold text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer"
                            >
                              <option value="1">Class 1 (इयत्ता १ ली)</option>
                              <option value="2">Class 2 (इयत्ता २ री)</option>
                              <option value="3">Class 3 (इयत्ता ३ री)</option>
                              <option value="4">Class 4 (इयत्ता ४ थी)</option>
                              <option value="5">Class 5 (इयत्ता ५ वी)</option>
                              <option value="6">Class 6 (इयत्ता ६ वी)</option>
                              <option value="7">Class 7 (इयत्ता ७ वी)</option>
                              <option value="8">Class 8 (इयत्ता ८ वी)</option>
                              <option value="9">Class 9 (इयत्ता ९ वी)</option>
                              <option value="10">Class 10 (इयत्ता १० वी)</option>
                              <option value="11">Class 11 (इयत्ता ११ वी)</option>
                              <option value="12">Class 12 (इयत्ता १२ वी)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                              ▼
                            </div>
                          </div>
                        </div>

                        {/* -> STREAM / शाखा * - Conditional Required when Class 11 or 12 */}
                        {(studentClass === '11' || studentClass === '12') && (
                          <div className="animate-in fade-in duration-200 p-3 bg-amber-950/30 rounded-2xl border border-orange-500/40">
                            <label className="text-xs font-black text-amber-300 block mb-1">
                              STREAM / शाखा <span className="text-orange-400">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={studentStream}
                                onChange={(e) => setStudentStream(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-orange-500 font-bold text-sm text-white focus:bg-slate-900 focus:outline-hidden appearance-none cursor-pointer"
                                required
                              >
                                <option value="">Select Stream</option>
                                <option value="Arts (कला शाखा)">Arts (कला शाखा)</option>
                                <option value="Commerce (वाणिज्य शाखा)">Commerce (वाणिज्य शाखा)</option>
                                <option value="Science (विज्ञान शाखा)">Science (विज्ञान शाखा)</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-orange-400 text-xs font-bold">
                                ▼
                              </div>
                            </div>
                            <p className="text-[11px] text-amber-300/80 mt-1">Required for Junior College (Class 11 &amp; 12)</p>
                          </div>
                        )}

                        {/* 5. ROLL NO. & DIV / हजेरी क्रमांक आणि तुकडी * (2 side-by-side) */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-black text-slate-200 block mb-1">
                              ROLL NO. / हजेरी क्रमांक <span className="text-emerald-400">*</span>
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={studentRollNo}
                              onChange={(e) => setStudentRollNo(e.target.value)}
                              placeholder="e.g. 15"
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black text-slate-200 block mb-1">
                              DIV / तुकडी <span className="text-emerald-400">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={studentDivision}
                                onChange={(e) => setStudentDivision(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-bold text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer"
                              >
                                <option value="A">Division A (तुकडी अ)</option>
                                <option value="B">Division B (तुकडी ब)</option>
                                <option value="C">Division C (तुकडी क)</option>
                                <option value="D">Division D (तुकडी ड)</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                                ▼
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 6. CREATE PASSWORD / पासवर्ड तयार करा * */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              CREATE PASSWORD / पासवर्ड तयार करा <span className="text-emerald-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowStudentPass(!showStudentPass)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                            >
                              {showStudentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{showStudentPass ? 'Hide' : 'Show'}</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showStudentPass ? 'text' : 'password'}
                              value={studentPassword}
                              onChange={(e) => setStudentPassword(e.target.value)}
                              placeholder="Create password (min 6 chars)"
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors pr-10"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowStudentPass(!showStudentPass)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* 7. CONFIRM PASSWORD / पासवर्ड पुन्हा टाका * */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              CONFIRM PASSWORD / पासवर्ड पुन्हा टाका <span className="text-emerald-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowStudentConfirmPass(!showStudentConfirmPass)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                            >
                              {showStudentConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{showStudentConfirmPass ? 'Hide' : 'Show'}</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showStudentConfirmPass ? 'text' : 'password'}
                              value={studentConfirmPassword}
                              onChange={(e) => setStudentConfirmPassword(e.target.value)}
                              placeholder="Re-enter password to confirm"
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors pr-10"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowStudentConfirmPass(!showStudentConfirmPass)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {showStudentConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Green Button: "Register as Student / नोंदणी करा ➔" */}
                        <button
                          type="submit"
                          id="btnStudentCardRegister"
                          className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                          <span>Register as Student / नोंदणी करा ➔</span>
                        </button>
                      </form>
                    ) : (
                      /* EXISTING STUDENT LOGIN FORM: First Select School -> Then Student ID -> Then Password */
                      <form onSubmit={handleStudentLoginModalSubmit} className="space-y-3 pt-1">
                        {/* 1. SELECT SCHOOL DROPDOWN (FIRST) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              SELECT SCHOOL / शाळा निवडा <span className="text-emerald-400">*</span>
                            </label>
                            {registeredSchools.length > 0 && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                                {registeredSchools.length} {registeredSchools.length === 1 ? 'School' : 'Schools'}
                              </span>
                            )}
                          </div>
                          {registeredSchools.length > 0 ? (
                            <div className="relative">
                              <select
                                id="studentSelectSchoolDropdown"
                                value={studentUdise}
                                onChange={(e) => setStudentUdise(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer appearance-none pr-8"
                                required
                              >
                                <option value="">-- Select Your School / शाळा निवडा --</option>
                                {registeredSchools.map((sch) => (
                                  <option key={sch.udiseCode} value={sch.udiseCode}>
                                    {sch.schoolName} ({sch.udiseCode})
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                                ▼
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-xs">
                                <span className="font-bold">⚠️ No schools registered yet.</span>
                                <span className="block text-[11px] text-amber-300/80 mt-0.5">
                                  Register a school in Super Admin or enter 11-digit UDISE:
                                </span>
                              </div>
                              <input
                                type="text"
                                maxLength={11}
                                value={studentUdise}
                                onChange={(e) => setStudentUdise(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 11-digit UDISE (e.g. 27123456789)"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                                required
                              />
                            </div>
                          )}
                          {studentUdise && registeredSchools.find((s) => s.udiseCode === studentUdise) && (
                            <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-1.5">
                              <span>🏫</span>
                              <span className="font-bold truncate">
                                {registeredSchools.find((s) => s.udiseCode === studentUdise)?.schoolName}
                              </span>
                              <span className="text-emerald-500">•</span>
                              <span className="font-mono text-emerald-400">UDISE: {studentUdise}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. STUDENT ID / ROLL NO (THEN ASK STUDENT ID) */}
                        <div>
                          <label className="text-xs font-black text-slate-200 block mb-1">
                            STUDENT ID / ROLL NO / विद्यार्थी आयडी किंवा हजेरी क्रमांक <span className="text-emerald-400">*</span>
                          </label>
                          <input
                            type="text"
                            id="inputStudentIdCard"
                            value={studentLoginEmail}
                            onChange={(e) => setStudentLoginEmail(e.target.value)}
                            placeholder="e.g. STD-101 or Roll No / हजेरी क्र."
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>

                        {/* 3. PASSWORD */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              PASSWORD / पासवर्ड <span className="text-emerald-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowStudentPass(!showStudentPass)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                            >
                              {showStudentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{showStudentPass ? 'Hide' : 'Show'}</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showStudentPass ? 'text' : 'password'}
                              id="inputStudentPasswordCard"
                              value={studentPassword}
                              onChange={(e) => setStudentPassword(e.target.value)}
                              placeholder="Enter password / पासवर्ड टाका"
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowStudentPass(!showStudentPass)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* 4. SUBMIT */}
                        <button
                          type="submit"
                          id="btnStudentCardLogin"
                          className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-400 hover:to-amber-500 active:scale-[0.99] transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer mt-2"
                        >
                          <span>Student Sign In / लॉगिन करा ➔</span>
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="pt-2">
                    {/* QR Scanner trigger */}
                    <button
                      id="scan-qr-btn"
                      type="button"
                      onClick={() => {
                        setIsQrModalOpen(true);
                        setTimeout(() => startCamera(), 100);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 text-slate-300 hover:text-white text-xs font-medium hover:bg-black/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📷 Scan QR to Join Class</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: INDIVIDUAL LEARNER REGISTRATION (No UDISE) - Task 2 */}
              <div
                id="cardIndividualLearner"
                className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col justify-between"
              >
                {/* Header Banner */}
                <div className="px-5 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0">
                      👤
                    </div>
                    <div>
                      <h2 className="text-base font-black tracking-tight leading-tight text-white">
                        Secure Individual Login Portal (No UDISE needed)
                      </h2>
                      <p className="text-[11px] text-amber-200 font-medium">
                        सुरक्षित वैयक्तिक लॉगिन • कोणताही UDISE आवश्यक नाही / No UDISE needed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Container */}
                <form
                  onSubmit={handleIndividualSubmit}
                  className="p-5 space-y-3.5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Toggle: New Registration vs Existing Login */}
                    <div className="flex gap-2.5 my-1">
                      <button
                        type="button"
                        id="tabIndividualRegister"
                        onClick={() => setIndividualMode('register')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          individualMode === 'register'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'bg-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✨ New Registration
                      </button>
                      <button
                        type="button"
                        id="tabIndividualLogin"
                        onClick={() => setIndividualMode('login')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          individualMode === 'login'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'bg-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        🔑 Existing Login
                      </button>
                    </div>

                    {/* IF register mode: Email Address, Create Password, Confirm Password */}
                    {individualMode === 'register' ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-black text-slate-200 block mb-1">
                            Email Address / ईमेल आयडी <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="inputIndRegEmail"
                            value={indEmail}
                            onChange={(e) => setIndEmail(e.target.value)}
                            placeholder="e.g. aarav.learner@gmail.com / तुमचा ईमेल आयडी"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              Create Password (पासवर्ड) <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowIndPass(!showIndPass)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                            >
                              {showIndPass ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            type={showIndPass ? 'text' : 'password'}
                            id="inputIndRegPassword"
                            value={indPassword}
                            onChange={(e) => setIndPassword(e.target.value)}
                            placeholder="Create your password / पासवर्ड टाका (min 6 chars)"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              Confirm Password / पासवर्डची पुष्टी करा <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowIndConfirmPass(!showIndConfirmPass)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                            >
                              {showIndConfirmPass ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            type={showIndConfirmPass ? 'text' : 'password'}
                            id="inputIndRegConfirmPassword"
                            value={indConfirmPassword}
                            onChange={(e) => setIndConfirmPassword(e.target.value)}
                            placeholder="Confirm your password / पासवर्डची पुष्टी करा *"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      /* IF login mode: Email Address, Password */
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-black text-slate-200 block mb-1">
                            Email Address / ईमेल आयडी <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="inputIndLoginEmail"
                            value={indEmail}
                            onChange={(e) => setIndEmail(e.target.value)}
                            placeholder="e.g. aarav.learner@gmail.com / तुमचा ईमेल"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-black text-slate-200">
                              Password / पासवर्ड <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowIndPass(!showIndPass)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                            >
                              {showIndPass ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            type={showIndPass ? 'text' : 'password'}
                            id="inputIndLoginPassword"
                            value={indPassword}
                            onChange={(e) => setIndPassword(e.target.value)}
                            placeholder="Enter your password / तुमचा पासवर्ड टाका"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:outline-hidden transition-colors"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons: Orange gradient button for Register, Blue button for Login */}
                  <div className="pt-2">
                    {individualMode === 'register' ? (
                      <button
                        type="submit"
                        id="btnIndRegisterSubmit"
                        className="w-full py-3.5 px-5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-400 hover:to-amber-500 active:scale-[0.99] transition-all shadow-lg shadow-orange-700/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Register &amp; Start Learning / प्रवेश करा</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        id="btnIndLoginSubmit"
                        className="w-full py-3.5 px-5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 active:scale-[0.99] transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Login &amp; Continue / लॉगिन करा</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task 3: School Student Registration Modal (With UDISE) */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 text-left shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 text-2xl shrink-0">
                  🎓
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    School Student Registration
                  </h3>
                  <p className="text-xs text-slate-400">
                    शाळेचा विद्यार्थी नोंदणी पोर्टल • 11 Digit UDISE Required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Register vs Existing Login */}
            <div className="mt-4 flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStudentModalTab('register')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentModalTab === 'register'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ New Student Registration (नोंदणी)
              </button>
              <button
                type="button"
                onClick={() => setStudentModalTab('login')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  studentModalTab === 'login'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔑 Existing Student Login (लॉगिन)
              </button>
            </div>

            {/* Top Blue info box with SCHOOL UDISE CODE checkmark */}
            <div className="mt-4 p-3.5 bg-blue-950/80 border border-blue-500/50 rounded-2xl flex items-start gap-3 text-blue-200">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-sm">
                ✓
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">SCHOOL UDISE CODE VERIFIED ✓</span>
                <span className="text-blue-300 leading-relaxed">
                  Enter your official 11-digit school UDISE code to connect directly with your classroom teacher &amp; curriculum.
                </span>
              </div>
            </div>

            {studentModalTab === 'register' ? (
              /* A) NEW STUDENT REGISTRATION FORM (नोंदणी): Exact 7 fields + Green gradient button */
              <form onSubmit={handleStudentRegisterSubmit} className="mt-4 space-y-3.5">
                {/* 1. SELECT REGISTERED SCHOOL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      SELECT SCHOOL / शाळा निवडा <span className="text-emerald-400">*</span>
                    </label>
                    {registeredSchools.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        {registeredSchools.length} {registeredSchools.length === 1 ? 'School' : 'Schools'}
                      </span>
                    )}
                  </div>
                  {registeredSchools.length > 0 ? (
                    <div className="relative">
                      <select
                        value={studentUdise}
                        onChange={(e) => setStudentUdise(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer appearance-none pr-8"
                        required
                      >
                        <option value="">-- Select Your School / शाळा निवडा --</option>
                        {registeredSchools.map((sch) => (
                          <option key={sch.udiseCode} value={sch.udiseCode}>
                            {sch.schoolName} ({sch.udiseCode})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      maxLength={11}
                      value={studentUdise}
                      onChange={(e) => setStudentUdise(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 11-digit UDISE (e.g. 27123456789)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                      required
                    />
                  )}
                  {studentUdise && registeredSchools.find((s) => s.udiseCode === studentUdise) && (
                    <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <span>🏫</span>
                      <span className="font-bold truncate">
                        {registeredSchools.find((s) => s.udiseCode === studentUdise)?.schoolName}
                      </span>
                      <span className="text-emerald-500">•</span>
                      <span className="font-mono text-emerald-400">UDISE: {studentUdise}</span>
                    </div>
                  )}
                </div>

                {/* 2. STUDENT FULL NAME / विद्यार्थ्याचे पूर्ण नाव * */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    STUDENT FULL NAME / विद्यार्थ्याचे पूर्ण नाव <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    placeholder="Riya Sharma / आर्यन जाधव"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                    required
                  />
                </div>

                {/* 3. EMAIL ID / ईमेल आयडी * - NEW FIELD */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    EMAIL ID / ईमेल आयडी <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Valid Email required for account verification &amp; login</p>
                </div>

                {/* 4. CLASS / इयत्ता * */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    CLASS / इयत्ता (1 ते 12) <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-bold text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer"
                    >
                      <option value="1">Class 1 (इयत्ता १ ली)</option>
                      <option value="2">Class 2 (इयत्ता २ री)</option>
                      <option value="3">Class 3 (इयत्ता ३ री)</option>
                      <option value="4">Class 4 (इयत्ता ४ थी)</option>
                      <option value="5">Class 5 (इयत्ता ५ वी)</option>
                      <option value="6">Class 6 (इयत्ता ६ वी)</option>
                      <option value="7">Class 7 (इयत्ता ७ वी)</option>
                      <option value="8">Class 8 (इयत्ता ८ वी)</option>
                      <option value="9">Class 9 (इयत्ता ९ वी)</option>
                      <option value="10">Class 10 (इयत्ता १० वी)</option>
                      <option value="11">Class 11 (इयत्ता ११ वी)</option>
                      <option value="12">Class 12 (इयत्ता १२ वी)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                      ▼
                    </div>
                  </div>
                </div>

                {/* -> STREAM / शाखा * - NEW CONDITIONAL DROPDOWN for Class 11 or 12 */}
                {(studentClass === '11' || studentClass === '12') && (
                  <div className="animate-in fade-in duration-200 p-3 bg-amber-950/30 rounded-2xl border border-orange-500/40">
                    <label className="text-xs font-black text-amber-300 block mb-1">
                      STREAM / शाखा <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={studentStream}
                        onChange={(e) => setStudentStream(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-orange-500 font-bold text-sm text-white focus:bg-slate-900 focus:outline-hidden appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select Stream</option>
                        <option value="Arts (कला शाखा)">Arts (कला शाखा)</option>
                        <option value="Commerce (वाणिज्य शाखा)">Commerce (वाणिज्य शाखा)</option>
                        <option value="Science (विज्ञान शाखा)">Science (विज्ञान शाखा)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-orange-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-300/80 mt-1">Required for Junior College (Class 11 &amp; 12)</p>
                  </div>
                )}

                {/* 5. ROLL NO. & DIV / हजेरी क्रमांक आणि तुकडी * */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-200 block mb-1">
                      ROLL NO. / हजेरी क्रमांक <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={studentRollNo}
                      onChange={(e) => setStudentRollNo(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-200 block mb-1">
                      DIV / तुकडी <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={studentDivision}
                        onChange={(e) => setStudentDivision(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-bold text-sm text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden appearance-none cursor-pointer"
                      >
                        <option value="A">Division A (तुकडी अ)</option>
                        <option value="B">Division B (तुकडी ब)</option>
                        <option value="C">Division C (तुकडी क)</option>
                        <option value="D">Division D (तुकडी ड)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. CREATE PASSWORD / पासवर्ड तयार करा * */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      CREATE PASSWORD / पासवर्ड तयार करा <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStudentPass(!showStudentPass)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                    >
                      {showStudentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showStudentPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showStudentPass ? 'text' : 'password'}
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Create password (min 6 characters)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPass(!showStudentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>
                </div>

                {/* 7. CONFIRM PASSWORD / पासवर्ड पुन्हा टाका * */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      CONFIRM PASSWORD / पासवर्ड पुन्हा टाका <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStudentConfirmPass(!showStudentConfirmPass)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                    >
                      {showStudentConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showStudentConfirmPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showStudentConfirmPass ? 'text' : 'password'}
                      value={studentConfirmPassword}
                      onChange={(e) => setStudentConfirmPassword(e.target.value)}
                      placeholder="Re-enter password to confirm"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentConfirmPass(!showStudentConfirmPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showStudentConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bottom: Green gradient button "🚀 Register as Student (नोंदणी करा)" */}
                <button
                  type="submit"
                  id="btnStudentModalRegisterSubmit"
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>🚀 Register as Student (नोंदणी करा)</span>
                </button>
              </form>
            ) : (
              /* B) EXISTING STUDENT LOGIN FORM (लॉगिन): Select School dropdown first -> then Student ID -> then Password */
              <form onSubmit={handleStudentLoginModalSubmit} className="mt-4 space-y-3.5">
                {/* 1. SELECT SCHOOL (FIRST) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      SELECT SCHOOL / शाळा निवडा <span className="text-orange-400">*</span>
                    </label>
                    {registeredSchools.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        {registeredSchools.length} {registeredSchools.length === 1 ? 'School' : 'Schools'}
                      </span>
                    )}
                  </div>
                  {registeredSchools.length > 0 ? (
                    <div className="relative">
                      <select
                        id="modalStudentSelectSchool"
                        value={studentUdise}
                        onChange={(e) => setStudentUdise(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white focus:bg-slate-900 focus:border-orange-500 focus:outline-hidden transition-colors cursor-pointer appearance-none pr-8"
                        required
                      >
                        <option value="">-- Select Your School / शाळा निवडा --</option>
                        {registeredSchools.map((sch) => (
                          <option key={sch.udiseCode} value={sch.udiseCode}>
                            {sch.schoolName} ({sch.udiseCode})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        maxLength={11}
                        value={studentUdise}
                        onChange={(e) => setStudentUdise(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 11-digit UDISE (e.g. 27123456789)"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-orange-500 focus:outline-hidden transition-colors"
                        required
                      />
                    </div>
                  )}
                  {studentUdise && registeredSchools.find((s) => s.udiseCode === studentUdise) && (
                    <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <span>🏫</span>
                      <span className="font-bold truncate">
                        {registeredSchools.find((s) => s.udiseCode === studentUdise)?.schoolName}
                      </span>
                      <span className="text-emerald-500">•</span>
                      <span className="font-mono text-emerald-400">UDISE: {studentUdise}</span>
                    </div>
                  )}
                </div>

                {/* 2. STUDENT ID / ROLL NO (THEN ASK STUDENT ID) */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    STUDENT ID / ROLL NO / विद्यार्थी आयडी किंवा हजेरी क्रमांक <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="inputModalStudentId"
                    value={studentLoginEmail}
                    onChange={(e) => setStudentLoginEmail(e.target.value)}
                    placeholder="Enter Student ID or Roll No / विद्यार्थी आयडी"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-orange-500 focus:outline-hidden transition-colors"
                    required
                  />
                </div>

                {/* 3. Password / पासवर्ड * */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      Password / पासवर्ड <span className="text-orange-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStudentPass(!showStudentPass)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                    >
                      {showStudentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showStudentPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showStudentPass ? 'text' : 'password'}
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Enter student password"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-slate-700 font-medium text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-orange-500 focus:outline-hidden transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPass(!showStudentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Button: Orange gradient "🚀 Student Login & Continue / लॉगिन करा" */}
                <button
                  type="submit"
                  id="btnStudentModalLoginSubmit"
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-400 hover:to-amber-500 shadow-xl shadow-orange-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 active:scale-[0.99]"
                >
                  <span>🚀 Student Login &amp; Continue / लॉगिन करा</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Camera Scanning Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl 2xl:max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-left shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl 2xl:text-2xl font-bold text-white">
                    Scan QR to Join Class
                  </h3>
                  <p className="text-xs 2xl:text-sm text-slate-400">
                    शिक्षकांच्या स्क्रीनवरील QR कोड स्कॅन करा
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </button>
            </div>

            {/* Visible UI Area: Scanning Instructions */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
              <h4 className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Instructions for Students • सूचना</span>
              </h4>
              <ol className="mt-2 text-xs 2xl:text-sm space-y-1.5 list-decimal list-inside text-emerald-100/90 leading-relaxed">
                <li>Ask your teacher to display your class QR code on the screen or blackboard.</li>
                <li>Hold your camera steady and center the QR code within the green reticle box below.</li>
                <li>The scanner will instantly recognize your school code and unlock your 20 situations!</li>
              </ol>
            </div>

            {/* Camera Feed & Overlay Area */}
            <div className="mt-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm 2xl:max-w-md aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl flex items-center justify-center">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Hidden Canvas used for frame decoding */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Scanning Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  {/* Animated Laser Scan Line */}
                  <div className="laser-line absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]" />

                  {/* Reticle Corner Brackets */}
                  <div className="w-56 h-56 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg shadow-sm" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg shadow-sm" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg shadow-sm" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg shadow-sm" />
                  </div>
                </div>

                {/* Camera Status Pill */}
                <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs border border-white/20 text-[11px] 2xl:text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{cameraStatus}</span>
                </div>
              </div>

              {/* Camera Error Message */}
              {cameraError && (
                <div className="mt-3 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 p-3 rounded-xl text-center w-full max-w-sm">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Quick Demo School QR Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 font-semibold mb-2 text-center">
                Or tap to simulate teacher's classroom QR code:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQrSuccess('SES001 - Smart English Sathi Model School')}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-base">🏫</span>
                  <div>
                    <strong className="block text-emerald-400">Smart English Sathi (SES001)</strong>
                    <span className="text-[10px] text-slate-400">Model School</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQrSuccess('KBP702 - Karmaveer Bhaurao Patil Vidyalaya')}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-base">🏫</span>
                  <div>
                    <strong className="block text-blue-400">KBP Vidyalaya (KBP702)</strong>
                    <span className="text-[10px] text-slate-400">Satara</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs 2xl:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom & Principal Access Modal */}
      {isQuickModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="login-card auth-card relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 text-2xl shrink-0">
                  🏫
                </div>
                <div>
                  <h3 className="text-lg 2xl:text-xl font-bold text-white">Classroom / Principal Sign in</h3>
                  <p className="text-xs 2xl:text-sm text-slate-400">
                    वर्ग / मुख्याध्यापक लॉगिन • School UDISE Access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setIsQuickModalOpen(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Classroom Login vs Principal Login */}
            <div className="mt-4 grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                id="tabModalClassroom"
                onClick={() => {
                  setSchoolModalTab('classroom');
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  schoolModalTab === 'classroom'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>📺 Classroom Login / वर्ग लॉगिन</span>
              </button>
              <button
                type="button"
                id="tabModalPrincipal"
                onClick={() => {
                  setSchoolModalTab('principal');
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  schoolModalTab === 'principal'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>📊 Principal Login / मुख्याध्यापक</span>
              </button>
            </div>

            {/* Role Explanation Card */}
            <div className={`mt-3 p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
              schoolModalTab === 'classroom'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-blue-950/40 border-blue-500/30 text-blue-200'
            }`}>
              <span className="text-lg shrink-0 mt-0.5">
                {schoolModalTab === 'classroom' ? '📺' : '📊'}
              </span>
              <div>
                <p className="font-bold text-sm">
                  {schoolModalTab === 'classroom'
                    ? 'Classroom Group Practice (Route: /classroom)'
                    : 'Principal Progress Dashboard (Read-Only)'}
                </p>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  {schoolModalTab === 'classroom'
                    ? 'For Teacher to run WHOLE-CLASS group practice for all students together on smart board.'
                    : 'For Principal who ONLY sees student progress dashboard, read-only, no lessons.'}
                </p>
              </div>
            </div>

            {/* Error Message if any in modal */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs 2xl:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {schoolModalTab === 'classroom' ? (
              /* TAB 1: Classroom Login (वर्ग लॉगिन) */
              <form onSubmit={handleClassroomSubmit} className="mt-4 space-y-4">
                {/* 1. SCHOOL UDISE CODE (11 Digits) * */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    SCHOOL UDISE CODE (11 Digits) / युडायस कोड <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={coordUdise}
                    onChange={(e) => setCoordUdise(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 27330308103"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                  {coordUdise.length > 0 && coordUdise.length < 11 && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      ⚠️ {11 - coordUdise.length} more digits needed (11 digits required)
                    </p>
                  )}
                  {coordUdise.length === 11 && (
                    <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>11-Digit UDISE Verified</span>
                    </p>
                  )}
                </div>

                {/* 2. Classroom Username or Email * */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    Classroom Username or Email <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={coordEmail}
                    onChange={(e) => setCoordEmail(e.target.value)}
                    placeholder="classroom@school.edu or class-teacher"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                {/* 3. Password / पासवर्ड * */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      Password / पासवर्ड <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCoordPass(!showCoordPass)}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                    >
                      {showCoordPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showCoordPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCoordPass ? 'text' : 'password'}
                      value={coordPassword}
                      onChange={(e) => setCoordPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCoordPass(!showCoordPass)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showCoordPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Button: Green gradient "Launch Whole-Class Practice (/classroom)" */}
                <button
                  type="submit"
                  id="btnModalClassroomLogin"
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-5 active:scale-[0.99]"
                >
                  <span>Launch Classroom Practice (/classroom) / वर्ग सराव सुरू करा</span>
                </button>

                {/* Demo Classroom Login */}
                <button
                  type="button"
                  id="btnModalDemoClassroomLogin"
                  onClick={handleDemoClassroomLogin}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <span>⚡ 1-Click Demo Classroom Login (Whole-Class Smart Board)</span>
                </button>
              </form>
            ) : (
              /* TAB 2: Principal Login (मुख्याध्यापक लॉगिन) */
              <form onSubmit={handlePrincipalModalSubmit} className="mt-4 space-y-4">
                {/* 1. SCHOOL UDISE CODE (11 Digits) * */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    SCHOOL UDISE CODE (11 Digits) / युडायस कोड <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={princUdise}
                    onChange={(e) => setPrincUdise(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 27330308103"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                  {princUdise.length > 0 && princUdise.length < 11 && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      ⚠️ {11 - princUdise.length} more digits needed (11 digits required)
                    </p>
                  )}
                  {princUdise.length === 11 && (
                    <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>11-Digit UDISE Verified</span>
                    </p>
                  )}
                </div>

                {/* 2. Principal Email / Mobile * */}
                <div>
                  <label className="text-xs font-black text-slate-200 block mb-1">
                    Principal Email / Mobile <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={princEmail}
                    onChange={(e) => setPrincEmail(e.target.value)}
                    placeholder="principal@school.edu"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                {/* 3. Password / पासवर्ड * */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-200">
                      Password / पासवर्ड <span className="text-blue-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrincPass(!showPrincPass)}
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1"
                    >
                      {showPrincPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPrincPass ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPrincPass ? 'text' : 'password'}
                      value={princPassword}
                      onChange={(e) => setPrincPassword(e.target.value)}
                      placeholder="Enter principal password"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrincPass(!showPrincPass)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPrincPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Button: Blue gradient "Sign In as Principal (Progress Dashboard Only)" */}
                <button
                  type="submit"
                  id="btnModalPrincipalLogin"
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-5 active:scale-[0.99]"
                >
                  <span>Sign In as Principal / मुख्याध्यापक लॉगिन करा</span>
                </button>

                {/* Demo Principal Login */}
                <button
                  type="button"
                  id="btnModalDemoPrincipalLogin"
                  onClick={handleDemoPrincipalLogin}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-blue-200 bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <span>⚡ 1-Click Demo Principal Login (Progress Dashboard Only)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer - Full width */}
      <footer className="relative z-10 w-full px-6 lg:px-16 xl:px-24 py-6 border-t border-slate-900 text-center lg:text-left text-sm 2xl:text-base text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>
          Are you a Principal?{' '}
          <a
            href="/register"
            id="linkPrincipalRegister"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateRegister) {
                onNavigateRegister();
              } else if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/register');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors cursor-pointer"
          >
            Register your school here
          </a>
        </p>
        <p>Smart English Sathi • Multi-School Spoken English Project</p>
      </footer>
    </div>
  );
};
