import React, { useState } from 'react';
import teacherAvatarImg from '../assets/images/female_teacher_avatar_1788522111841.jpg';
import riyaAvatarImg from '../assets/images/girl_student_avatar_1788522138532.jpg';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  speaking?: boolean;
}

export const TeacherAvatar: React.FC<AvatarProps> = ({ size = 'md', className = '', speaking = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const dimMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
        speaking
          ? 'ring-4 ring-blue-400 border-blue-600 scale-105 shadow-md'
          : 'border-blue-200'
      } bg-linear-to-b from-blue-50 to-indigo-100 overflow-hidden ${dimMap[size]} ${className}`}
      title="AI Avatar: Teacher Anjali (Glasses, Bun, Blazer)"
    >
      {!imgFailed ? (
        <img
          src={teacherAvatarImg}
          alt="AI Avatar Teacher Anjali"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Hair Bun at top */}
          <circle cx="50" cy="22" r="14" fill="#2d221e" />
          <ellipse cx="50" cy="20" rx="11" ry="8" fill="#3d302a" />
          <rect x="44" y="60" width="12" height="14" fill="#e8be9e" rx="3" />
          <path d="M 30 74 L 50 82 L 70 74 L 78 100 L 22 100 Z" fill="#1e40af" />
          <path d="M 32 74 L 52 82 L 40 100 L 24 100 Z" fill="#3b82f6" />
          <path d="M 44 80 L 50 82 L 56 80 L 50 92 Z" fill="#e8be9e" />
          <ellipse cx="50" cy="46" rx="20" ry="22" fill="#f5d0b5" />
          <path d="M 28 44 C 28 26 72 26 72 44 C 72 32 60 28 50 28 C 40 28 28 32 28 44 Z" fill="#2d221e" />
          <ellipse cx="42" cy="45" rx="2.5" ry="2" fill="#2b1810" />
          <ellipse cx="58" cy="45" rx="2.5" ry="2" fill="#2b1810" />
          <circle cx="50" cy="41" r="1.5" fill="#dc2626" />
          <rect x="36" y="41" width="12" height="9" rx="3" fill="rgba(255,255,255,0.4)" stroke="#7c3aed" strokeWidth="1.8" />
          <rect x="52" y="41" width="12" height="9" rx="3" fill="rgba(255,255,255,0.4)" stroke="#7c3aed" strokeWidth="1.8" />
          <line x1="48" y1="45" x2="52" y2="45" stroke="#7c3aed" strokeWidth="1.8" />
          <path d="M 45 55 Q 50 59 55 55" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {speaking && (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border border-white"></span>
        </span>
      )}
    </div>
  );
};

export const RiyaAvatar: React.FC<AvatarProps> = ({ size = 'md', className = '', speaking = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const dimMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
        speaking
          ? 'ring-4 ring-pink-400 border-pink-500 scale-105 shadow-md'
          : 'border-pink-200'
      } bg-linear-to-b from-pink-50 to-rose-100 overflow-hidden ${dimMap[size]} ${className}`}
      title="AI Avatar: Riya (Braids, Blue Ribbon Bows, School Uniform)"
    >
      {!imgFailed ? (
        <img
          src={riyaAvatarImg}
          alt="AI Avatar Riya Student"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M 28 48 Q 22 58 24 70 Q 26 80 23 90" stroke="#231713" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="23" cy="90" r="3.5" fill="#231713" />
          <path d="M 23 48 L 17 44 L 19 52 Z" fill="#2563eb" />
          <path d="M 23 48 L 29 44 L 27 52 Z" fill="#2563eb" />
          <circle cx="23" cy="48" r="2.5" fill="#3b82f6" />

          <path d="M 72 48 Q 78 58 76 70 Q 74 80 77 90" stroke="#231713" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="77" cy="90" r="3.5" fill="#231713" />
          <path d="M 77 48 L 71 44 L 73 52 Z" fill="#2563eb" />
          <path d="M 77 48 L 83 44 L 81 52 Z" fill="#2563eb" />
          <circle cx="77" cy="48" r="2.5" fill="#3b82f6" />

          <rect x="45" y="62" width="10" height="12" fill="#f3caa6" rx="2" />
          <path d="M 28 74 L 50 80 L 72 74 L 80 100 L 20 100 Z" fill="#f8fafc" />
          <path d="M 32 74 L 46 82 L 40 74 Z" fill="#1e3a8a" />
          <path d="M 68 74 L 54 82 L 60 74 Z" fill="#1e3a8a" />
          <path d="M 47 80 L 53 80 L 52 98 L 50 100 L 48 98 Z" fill="#dc2626" />
          <polygon points="46,80 54,80 52,85 48,85" fill="#b91c1c" />

          <ellipse cx="50" cy="48" rx="19" ry="20" fill="#fcd9bc" />
          <path d="M 31 46 C 30 28 70 28 69 46 C 66 35 58 32 50 33 C 42 32 34 35 31 46 Z" fill="#231713" />
          <ellipse cx="43" cy="47" rx="2.5" ry="2.5" fill="#1c1917" />
          <ellipse cx="57" cy="47" rx="2.5" ry="2.5" fill="#1c1917" />
          <circle cx="39" cy="51" r="3" fill="#fca5a5" opacity="0.6" />
          <circle cx="61" cy="51" r="3" fill="#fca5a5" opacity="0.6" />
          <path d="M 45 55 Q 50 60 55 55" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {speaking && (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-600 border border-white"></span>
        </span>
      )}
    </div>
  );
};

interface SceneProps {
  situationNumber: number;
  title: string;
  setting: string;
  level: string;
  className?: string;
  activeSpeaker?: 'teacher' | 'riya' | null;
}

export const SceneIllustrationCard: React.FC<SceneProps> = ({
  situationNumber,
  title,
  setting,
  level,
  className = '',
  activeSpeaker = null,
}) => {
  return (
    <div
      id="sceneCard"
      className={`relative overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xs border border-[#E9ECEF] ${className}`}
    >
      {/* Stage Backdrop Banner */}
      <div className="relative p-5 sm:p-6 z-10 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Situation {situationNumber} of 20
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {level}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              🏫 School English
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 line-clamp-2">
            <span>📍</span>
            <span>{setting}</span>
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-700 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200 max-w-fit">
            <span className="font-semibold text-slate-900">Characters:</span>
            <span className="flex items-center gap-1 text-blue-700">
              👩‍🏫 <b>Teacher Anjali</b> (glasses &amp; bun)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-pink-700">
              👧 <b>Riya</b> (twin braids &amp; blue bows)
            </span>
          </div>
        </div>

        {/* Character Interaction Pod with AI Avatars */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shrink-0 shadow-xs">
          <div className="flex flex-col items-center">
            <TeacherAvatar size="lg" speaking={activeSpeaker === 'teacher'} />
            <div className="mt-1.5 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-800">Teacher Anjali</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-sm border border-blue-200 mt-0.5">
                AI Mentor
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-1">
            <div className="text-base text-blue-300 animate-pulse">💬</div>
            <div className="h-8 w-0.5 bg-linear-to-b from-blue-400 to-pink-400 rounded-full my-1"></div>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">dialogue</span>
          </div>

          <div className="flex flex-col items-center">
            <RiyaAvatar size="lg" speaking={activeSpeaker === 'riya'} />
            <div className="mt-1.5 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-800">Riya</span>
              <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-1.5 py-0.2 rounded-sm border border-pink-200 mt-0.5">
                AI Student
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
