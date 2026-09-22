import React, { useState, useEffect } from 'react';
import { AppRole, AuthUser } from '../../types';
import {
  INITIAL_ROLE_CREDENTIALS,
  verifyCredentials,
  verifyAdminCredentialsSecurely,
  getAdminLockoutStatus,
  saveAuthUser,
} from '../../data/authConfig';
import {
  Lock,
  Unlock,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  targetRole: AppRole;
  currentRole: AppRole;
  onClose: () => void;
  onSwitchSuccess: (newUser: AuthUser) => void;
  onLogoutToLoginScreen: () => void;
}

export const SwitchRoleModal: React.FC<Props> = ({
  isOpen,
  targetRole,
  currentRole,
  onClose,
  onSwitchSuccess,
  onLogoutToLoginScreen,
}) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockCountdown, setLockCountdown] = useState<number>(0);

  const targetConfig = INITIAL_ROLE_CREDENTIALS[targetRole];

  useEffect(() => {
    setPasswordInput('');
    setErrorMessage(null);
    setShowPassword(false);
    setIsSubmitting(false);
    setIsVerified(false);
    setIsLocked(false);
    setLockCountdown(0);
  }, [targetRole, isOpen]);

  // Handle countdown timer for rate limiting lockout
  useEffect(() => {
    if (!isLocked || lockCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockCountdown]);

  if (!isOpen) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerified(true);

    let newUser: AuthUser;
    if (targetRole === 'admin') {
      newUser = {
        role: 'admin',
        roleType: 'super_admin',
        isSuperAdmin: true,
        name: 'Super Admin (Owner)',
        marathiName: 'सुपर ॲडमिन (प्रणाली मालक)',
        identifier: 'SUPER-ADM (Owner)',
        title: 'Super Administrator & Multi-School Authority',
        avatar: '👑',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else {
      newUser = {
        role: targetRole,
        name: targetConfig.defaultUserName,
        marathiName: targetConfig.defaultUserMr,
        identifier: targetConfig.identifier,
        title: targetConfig.title,
        avatar: targetConfig.avatarEmoji,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    saveAuthUser(newUser);
    onSwitchSuccess(newUser);
    onClose();
  };

  const handleVerifyAndSwitch = handleVerify;
  const handleSubmit = handleVerify;

  const formatLockTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div
          className={`p-4 sm:p-5 text-white bg-linear-to-r ${targetConfig.colorScheme.gradient} relative flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-xs">
              {targetRole === 'admin' ? '👑' : targetConfig.avatarEmoji}
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                {targetRole === 'admin' ? 'Administrator Security Check' : 'Role Security Check'}
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {targetRole === 'admin' ? 'Switch to Administrator' : `Switch to ${targetConfig.roleNameEn}`}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {targetRole === 'admin' ? 'प्रशासक सुरक्षित प्रवेश' : targetConfig.roleNameMr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="text-xs text-slate-600 font-medium leading-relaxed">
            <span>
              Please enter your admin credentials below to securely switch to the{' '}
              <strong className="text-slate-900">{targetRole === 'admin' ? 'Super Admin' : targetConfig.roleNameEn}</strong> portal.
            </span>
          </div>

          <div>
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Password</span>
            </label>

            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                autoComplete="new-password"
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLocked || isSubmitting}
                placeholder="Enter your admin password"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-50 border-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 ${
                  errorMessage
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-slate-300 focus:border-blue-600'
                }`}
                autoFocus
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked || isSubmitting}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {errorMessage}
                  {isLocked && lockCountdown > 0 && ` (${formatLockTime(lockCountdown)} remaining)`}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogoutToLoginScreen();
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
            >
              Log Out to Main Screen
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                onClick={handleVerifyAndSwitch}
                className={`px-4 py-2 rounded-xl text-xs font-black text-white shadow-xs flex items-center gap-1.5 cursor-pointer bg-linear-to-r ${targetConfig.colorScheme.gradient} hover:brightness-105`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Verify & Switch</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
