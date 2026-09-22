import React, { useState } from 'react';
import { AppRole, AuthUser } from '../../types';
import {
  INITIAL_ROLE_CREDENTIALS,
  getCustomPasswords,
  updateRolePassword,
  resetRolePasswordToDefault,
  calculatePasswordStrength,
  changeAdminPasswordSecurely,
} from '../../data/authConfig';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
}

export const ChangePasswordModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const role = currentUser.role;
  const config = INITIAL_ROLE_CREDENTIALS[role];
  const customPasswords = getCustomPasswords();
  const currentActualPassword = customPasswords[role] || config.defaultPassword;

  const strength = calculatePasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    // If Admin coordinator, update securely via backend API
    if (role === 'admin') {
      setIsSubmitting(true);
      try {
        const res = await changeAdminPasswordSecurely(currentPasswordInput, newPassword);
        if (res.success) {
          setSuccessMsg(res.message || 'Secured admin password updated successfully!');
          setCurrentPasswordInput('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMsg(res.message || 'Current admin password verification failed.');
        }
      } catch {
        setErrorMsg('Network error communicating with authentication service.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate current password for non-admin roles
    if (
      currentPasswordInput !== currentActualPassword &&
      !config.alternateValidPasswords.includes(currentPasswordInput)
    ) {
      setErrorMsg('Current password does not match.');
      return;
    }

    updateRolePassword(role, newPassword);
    setSuccessMsg('Secured password updated successfully!');
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleResetToDefault = () => {
    if (role === 'admin') return;
    resetRolePasswordToDefault(role);
    setSuccessMsg('Password reset to school default.');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 text-white bg-linear-to-r ${config.colorScheme.gradient} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-xs">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Change Secured Password
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {currentUser.name} • {config.roleNameEn}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Password Field */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              Current Password / सध्याचा पासवर्ड
            </label>
            <div className="relative flex items-center">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPasswordInput}
                autoComplete="new-password"
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              New Password / नवीन पासवर्ड
            </label>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                autoComplete="new-password"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Strength:</span>
                  <span className={strength.score >= 3 ? 'text-emerald-700' : 'text-amber-700'}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 transition-all ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              Confirm New Password / पासवर्डची पुष्टी करा
            </label>
            <input
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Saving...' : 'Save New Password / पासवर्ड साठवा'}</span>
            </button>

            {role !== 'admin' && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to School Default</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
