import React from 'react';
import teacherAvatarImg from '../assets/images/female_teacher_avatar_1788522111841.jpg';
import riyaAvatarImg from '../assets/images/girl_student_avatar_1788522138532.jpg';
import { speakText } from '../utils/speech';
import { X, Volume2, Sparkles, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarShowcaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleTeacherIntro = () => {
    speakText(
      'Namaste and welcome! I am Teacher Anjali, your AI English mentor. Together with Riya, we will master twenty real-life school conversations with impeccable pronunciation.',
      { who: 'teacher', rate: 0.88 }
    );
  };

  const handleRiyaIntro = () => {
    speakText(
      'Hello friends! I am Riya. You and I will practice talking to Teacher Anjali in English. Step into my shoes and let us learn together!',
      { who: 'riya', rate: 0.95 }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">AI Characters Showcase</h3>
              <p className="text-xs text-blue-100 font-medium">
                Meet your AI Female Teacher &amp; Girl Student
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Character Profiles */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/50">
          {/* 1. Teacher Anjali */}
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-3 group">
              <img
                src={teacherAvatarImg}
                alt="AI Avatar Teacher Anjali"
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border-3 border-blue-400"
              />
              <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-white shadow-xs">
                AI Mentor
              </span>
            </div>

            <h4 className="text-base font-extrabold text-blue-950">Teacher Anjali</h4>
            <p className="text-xs font-semibold text-blue-600 mb-2">Class Educator &amp; Mentor</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Features stylish glasses, neat hair bun, and a formal educational blazer. She models patient, encouraging, standard Indian English pronunciation.
            </p>

            <button
              onClick={handleTeacherIntro}
              className="mt-auto w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Hear Teacher Intro</span>
            </button>
          </div>

          {/* 2. Riya */}
          <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-3 group">
              <img
                src={riyaAvatarImg}
                alt="AI Avatar Riya Student"
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border-3 border-pink-400"
              />
              <span className="absolute -bottom-2 -right-2 bg-pink-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-white shadow-xs">
                AI Student
              </span>
            </div>

            <h4 className="text-base font-extrabold text-pink-950">Riya</h4>
            <p className="text-xs font-semibold text-pink-600 mb-2">Enthusiastic School Student</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Features neat twin braids with signature bright blue ribbon bows and a crisp school uniform. In Stage 3, you step into Riya’s role to speak!
            </p>

            <button
              onClick={handleRiyaIntro}
              className="mt-auto w-full py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-pink-600" />
              <span>Hear Riya Intro</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            3D AI Character Avatars Active Across All 20 Situations
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
