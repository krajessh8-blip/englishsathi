import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Home,
  CheckCircle2,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '../../types';

interface AdminLoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  onNavigateHome: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);

  // Check rate limit status on mount
  useEffect(() => {
    fetch('/api/auth/admin-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.isLocked && data.secondsRemaining > 0) {
          setLockoutCountdown(data.secondsRemaining);
        }
        setStatusChecked(true);
      })
      .catch(() => setStatusChecked(true));
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutCountdown > 0) return;

    setErrorMessage(null);
    const trimmed = password.trim();
    if (!trimmed) {
      setErrorMessage('Please enter the Super Admin secured master password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isLocked) {
          setLockoutCountdown(data.secondsRemaining || 300);
          setErrorMessage(data.message || 'Too many attempts. Locked out for 5 minutes.');
        } else {
          setErrorMessage(data.message || 'Invalid administrator password. Access denied.');
        }
        setIsSubmitting(false);
        return;
      }

      // Successful Super Admin / Admin Authentication
      const user: AuthUser = data.user || {
        role: 'admin',
        roleType: 'super_admin',
        isSuperAdmin: true,
        name: 'Super Admin (System Owner)',
        marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
        identifier: 'SUPER-ADMIN-2026',
        title: 'Super Administrator & Multi-School Authority',
        avatar: '👑',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Save to localStorage for role guard and persistence
      localStorage.setItem('user', user.name);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('smart_english_app_role', 'admin');
      localStorage.setItem('mvm_auth_active_user_v2', JSON.stringify(user));

      // Route to /admin
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }

      onLoginSuccess(user);
    } catch (err: any) {
      // Offline fallback: Check known master key if network failed
      if (trimmed === 'Admin@smart2026' || trimmed === 'Admin@Smart2026') {
        const fallbackUser: AuthUser = {
          role: 'admin',
          roleType: 'super_admin',
          isSuperAdmin: true,
          name: 'Super Admin (Owner)',
          marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
          identifier: 'SUPER-ADMIN-2026',
          title: 'Super Administrator & Multi-School Authority',
          avatar: '👑',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        localStorage.setItem('user', fallbackUser.name);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('smart_english_app_role', 'admin');
        localStorage.setItem('mvm_auth_active_user_v2', JSON.stringify(fallbackUser));

        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/admin');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        onLoginSuccess(fallbackUser);
        return;
      }

      setErrorMessage('Server authentication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setPassword('Admin@smart2026');
    setErrorMessage(null);
  };

  return (
    <div className="bg-[#020617] min-h-screen w-full flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans text-slate-100 p-4 sm:p-8">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-xl shadow-lg">
            🛡️
          </div>
          <div>
            <h1 className="text-white font-black text-lg sm:text-xl tracking-tight">
              Smart English Sathi
            </h1>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">
              Restricted Administrative Gateway
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </button>
      </header>

      {/* Main Form Center Box */}
      <main className="w-full max-w-md mx-auto my-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Title Area */}
          <div className="text-center space-y-2 relative z-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400/40 text-white flex items-center justify-center text-2xl shadow-xl">
              👑
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-black uppercase tracking-wider">
              <span>Secret Admin Route: /stc-admin-secure-2026</span>
            </div>
            <h2 className="text-2xl font-black text-white">Super Admin Access</h2>
            <p className="text-xs text-slate-400">
              System Owner &amp; Institution Administration Portal. Please enter master credentials.
            </p>
          </div>

          {/* Lockout Warning */}
          {lockoutCountdown > 0 && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-black text-red-300 text-sm">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Security Lockout Active</span>
              </div>
              <p>
                Too many failed attempts. Try again in{' '}
                <span className="font-mono font-bold text-white text-sm">{lockoutCountdown}s</span>.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && lockoutCountdown <= 0 && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Master Security Password / मुख्य पासवर्ड
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={lockoutCountdown > 0 || isSubmitting}
                  placeholder="Enter secured admin password"
                  autoFocus
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/90 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* CapsLock Warning */}
              {isCapsLockOn && (
                <p className="mt-1 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  ⚠️ CapsLock is ON
                </p>
              )}
            </div>

            {/* Quick Demo Autofill */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">Authorized testing demo:</span>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer text-xs"
              >
                Use Demo Admin Key
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btnSubmitAdminLogin"
              disabled={lockoutCountdown > 0 || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                lockoutCountdown > 0 || isSubmitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Security Token...' : 'Authenticate & Enter /admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Audit Log Security Badge */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-1 text-[11px] text-slate-500">
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>All authentication events are logged into security audit trail.</span>
            </div>
            <p>Access without authorization is strictly prohibited.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-slate-900 text-center text-xs text-slate-600">
        Smart English Sathi • Multi-School Spoken English Educational Operating System
      </footer>
    </div>
  );
};
