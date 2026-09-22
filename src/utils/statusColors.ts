/**
 * Standard semantic status UI color palettes and styling helpers.
 * Ensures consistent, accessible, and high-contrast status presentation across the app.
 */

export type StudentStatusType = 'excellent' | 'active' | 'needs_attention';
export type LessonStatusType = 'published' | 'draft';
export type DifficultyType = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type PracticeStatusType = 'active' | 'completed' | 'ready';
export type RequestStatusType = 'pending' | 'approved' | 'rejected';

/**
 * Returns Tailwind classes for Student Status badges.
 */
export function getStudentStatusBadge(status: StudentStatusType | string) {
  switch (status) {
    case 'excellent':
      return {
        label: 'Excellent',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        dotPulse: false,
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
      };
    case 'needs_attention':
      return {
        label: 'Needs Attention',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        dotPulse: false,
        className: 'bg-amber-50 text-amber-800 border border-amber-300',
      };
    case 'active':
    default:
      return {
        label: 'Active',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-300',
        dot: 'bg-sky-500',
        dotPulse: false,
        className: 'bg-sky-50 text-sky-700 border border-sky-300',
      };
  }
}

/**
 * Returns Tailwind classes for Curriculum / Situation Status badges.
 */
export function getLessonStatusBadge(status: LessonStatusType | string, isProtected: boolean = false) {
  if (isProtected) {
    return {
      label: 'Protected Core',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      dot: 'bg-amber-500',
      className: 'bg-amber-50 text-amber-800 border border-amber-300',
    };
  }

  switch (status) {
    case 'published':
      return {
        label: 'Published',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-300',
        dot: 'bg-slate-400',
        className: 'bg-slate-100 text-slate-600 border border-slate-300',
      };
  }
}

/**
 * Returns Tailwind classes for Difficulty badges.
 */
export function getDifficultyBadge(difficulty: DifficultyType | string) {
  switch (difficulty) {
    case 'Expert':
      return {
        label: 'Expert',
        className: 'bg-purple-50 text-purple-700 border border-purple-300',
        dot: 'bg-purple-500',
      };
    case 'Advanced':
      return {
        label: 'Advanced',
        className: 'bg-amber-50 text-amber-700 border border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'Intermediate':
      return {
        label: 'Intermediate',
        className: 'bg-sky-50 text-sky-700 border border-sky-300',
        dot: 'bg-sky-500',
      };
    case 'Beginner':
    default:
      return {
        label: 'Beginner',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
        dot: 'bg-emerald-500',
      };
  }
}

/**
 * Returns Tailwind classes for Cash / Verification Requests.
 */
export function getRequestStatusBadge(status: RequestStatusType | string) {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
        dot: 'bg-emerald-500',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700 border border-rose-300',
        dot: 'bg-rose-500',
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-800 border border-amber-300',
        dot: 'bg-amber-500',
      };
  }
}
