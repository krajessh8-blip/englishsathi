export type GroupId = 'A' | 'B' | 'C' | 'D';

export interface Group {
  id: GroupId;
  name: string;
  level: string;
  classes: string;
  description: string;
  color: string;
  badgeBg: string;
}

export interface Level {
  id: number;
  name: string;
  subtitle: string;
  class: string;
  situations: number;
  color: string;
  description?: string;
}

export interface DialogLine {
  id: number;
  who: 'teacher' | 'riya';
  text: string;
  marathi: string;
  hindi?: string;
}

export interface VocabItem {
  word: string;
  partOfSpeech: string;
  meaning: string;
  marathi: string;
  hindi?: string;
  example: string;
}

export interface FillBlankQuestion {
  id: number;
  speaker: 'teacher' | 'riya';
  fullSentence: string;
  missingWord: string;
  marathi: string;
  hindi?: string;
  options?: string[];
}

export interface RolePlayScriptStep {
  step: number;
  teacherPrompt: string;
  teacherMarathi: string;
  teacherHindi?: string;
  suggestedRiyaReplies: string[];
  keyWordsNeeded: string[];
  encouragement: string;
}

export interface ConversationLine {
  id?: number;
  speaker?: string;
  role?: string;
  text?: string;
  marathi?: string;
  hindi?: string;
  [key: string]: any;
}

export type SituationStatus = 'published' | 'draft';

export interface Situation {
  id: number;
  level: number; // 1 to 10
  situation_no?: number; // 1 to 40 per level
  status?: SituationStatus; // 'published' | 'draft'
  char1_role?: string;
  char1_name?: string;
  char1_image?: string;
  char2_role?: string;
  char2_name?: string;
  char2_image?: string;
  lines?: ConversationLine[]; // 20 empty objects for drafts
  lessonId?: number | string;
  youtubeLink?: string;
  access?: 'free' | 'paid';
  schoolId?: string | null;
  group?: GroupId; // Kept for backwards compatibility and migration
  title: string;
  subtitle: string;
  setting: string;
  dialogs: DialogLine[];
  vocabulary: VocabItem[];
  questions: FillBlankQuestion[];
  roleplaySteps: RolePlayScriptStep[];
  isActive?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  updatedAt?: string;
}

// ==========================================
// FIRESTORE MULTI-SCHOOL COLLECTION TYPES
// ==========================================

export type SchoolPlan = 'free' | 'paid';

export interface SchoolDoc {
  schoolId: string; // Document ID, e.g. "smart_school_01"
  schoolName: string; // e.g. "Smart English Sathi Model School"
  city: string; // e.g. "Pune"
  principalId: string | null; // UID of principal
  totalStudents: number;
  plan: SchoolPlan; // 'free' | 'paid'
  schoolCode: string; // 6-character unique code, e.g. "SES001"
  createdAt: string; // ISO 8601 string or Timestamp
}

export type UserRole = 'student' | 'individual' | 'principal' | 'admin';

export interface UserDoc {
  uid: string; // Document ID (Firebase Auth UID)
  email: string;
  name: string;
  role: UserRole;
  schoolId: string | null; // For student/principal; null for individual learners
  principalId?: string | null;
  class?: string | null; // For student, e.g. "Class 10"
  isPaid: boolean;
  validTill: string | null; // ISO date string or null
  trialStart: string | null; // ISO date string
  trialEnd: string | null; // 10 min demo expiration timestamp
  createdAt: string; // ISO 8601 string or Timestamp
}

export interface LessonDoc {
  lessonId: number | string; // Document ID or unique numeric ID
  title: string;
  youtubeLink?: string; // YouTube video explanation/demonstration
  level?: number; // 1 to 10
  group?: GroupId; // 'A' | 'B' | 'C' | 'D'
  access: 'free' | 'paid';
  schoolId: string | null; // null for all schools; schoolId for custom school lessons
  subtitle?: string;
  setting?: string;
  dialogs?: DialogLine[];
  vocabulary?: VocabItem[];
  questions?: FillBlankQuestion[];
  roleplaySteps?: RolePlayScriptStep[];
  isActive?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt?: string;
}

export type CashRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CashRequestDoc {
  id?: string; // Document ID
  userId: string;
  schoolId: string;
  status: CashRequestStatus;
  requestedAt: string; // ISO 8601 string or Timestamp
  amount?: number;
  approvedAt?: string;
  notes?: string;
}

export type AppRole = 'student' | 'principal' | 'admin' | 'classroom';
export type RoleType = 'super_admin' | 'coordinator' | 'principal' | 'student' | 'classroom';
export type StudentApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AuthUser {
  role: AppRole;
  roleType?: RoleType;
  isSuperAdmin?: boolean;
  udiseCode?: string;
  schoolName?: string;
  name: string;
  marathiName?: string;
  identifier: string; // e.g., 'STD-101', 'PRIN-01', 'ADM-01'
  title: string;
  avatar: string;
  loginTime?: string;
}

export interface StudentPendingRecord {
  id: string;
  udiseCode: string;
  schoolName: string;
  name: string;
  className: string;
  rollNo: string;
  section: string;
  mobile: string;
  date: string;
  status: StudentApprovalStatus;
  password?: string;
}

export interface PendingSchoolGroup {
  udiseCode: string;
  schoolName: string;
  city?: string;
  district?: string;
  pendingCount: number;
  students: StudentPendingRecord[];
}

export type SchoolPendingGroup = PendingSchoolGroup;

export interface Student {
  id: string;
  udiseCode?: string; // 11-digit school UDISE code
  schoolName?: string;
  approvalStatus?: StudentApprovalStatus;
  registrationDate?: string;
  rollNo: string;
  name: string;
  gender: 'female' | 'male' | 'other';
  grade: string; // e.g., 'Class 5', 'Class 7', 'Class 10', 'Class 12'
  section: string; // 'A', 'B', 'C'
  groupId: GroupId;
  levelId?: number; // 1 to 10
  parentName: string;
  parentPhone: string;
  completedSituationIds: number[];
  totalScore: number;
  speechFluencyScore: number; // 0-100
  vocabMasteryScore: number; // 0-100
  roleplayAccuracy: number; // 0-100
  attendanceRate: number; // 0-100
  lastActiveDate: string;
  status: 'active' | 'needs_attention' | 'excellent';
  teacherNotes?: string;
  // Grammar progress
  grammarProgressPercent?: number;
  grammarQuizScore?: number;
  speakingGrammarScore?: number;
  writingGrammarScore?: number;
  listeningGrammarScore?: number;
  weakGrammarTopics?: string[];
  strongGrammarTopics?: string[];
  completedGrammarTopicIds?: string[];
}

export type AdminTab = 'overview' | 'pending-approvals' | 'students' | 'lessons' | 'reports' | 'grammar' | 'security';
export type PrincipalTab = 'overview' | 'learning-analytics' | 'classes' | 'students' | 'reports' | 'grammar' | 'watchlist';

// Grammar Module Types
export interface GrammarExample {
  type?: 'positive' | 'negative' | 'question' | 'general';
  sentence: string;
  marathi: string;
  hindi?: string;
  note?: string;
}

export interface CommonMistake {
  incorrect: string;
  correct: string;
  why: string;
  marathiWhy?: string;
}

export interface SpeakingPrompt {
  prompt: string;
  marathiPrompt: string;
  hindiPrompt?: string;
  suggestedAnswer: string;
  targetPattern: string;
  hints: string[];
}

export interface WritingExercise {
  id: number;
  type: 'fill_blank' | 'reorder' | 'sentence_make';
  question: string;
  marathiHelper?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marathiExplanation?: string;
}

export interface GrammarTopic {
  id: string; // e.g. 'g1-1'
  level_id: number; // 1 to 10
  topic_number: number; // 1 to 50
  title_en: string;
  title_mr: string;
  title_hi?: string;
  explanation_en: string;
  explanation_mr: string;
  explanation_hi?: string;
  examples: GrammarExample[];
  common_mistakes?: CommonMistake[];
  speaking_practice: SpeakingPrompt;
  writing_practice: WritingExercise[];
  quiz: GrammarQuizQuestion[];
  listen_sentences?: { en: string; mr: string; hi?: string }[];
  audio_url?: string;
  image_url?: string;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
}

export interface GrammarProgressRecord {
  id: string;
  student_id: string;
  grammar_topic_id: string;
  completed: boolean;
  listening_score: number; // 0-100
  speaking_score: number; // 0-100
  writing_score: number; // 0-100
  quiz_score: number; // 0-100
  accuracy: number; // 0-100
  last_attempt?: string;
  completed_at?: string;
}

export interface StudentGrammarSummary {
  completedTopicsCount: number;
  totalTopicsCount: number;
  grammarQuizScore: number;
  speakingGrammarScore: number;
  writingGrammarScore: number;
  listeningGrammarScore: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  overallProgressPercent: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  marathiTitle: string;
  description: string;
  marathiDesc: string;
  icon: string;
  category: 'milestone' | 'mastery' | 'grammar' | 'special';
  targetSituations?: number;
  targetScore?: number;
  targetGrammarLevel?: number; // 1 to 10: requires 100% of topics in this level
  targetGrammarTopics?: number;
  colorScheme: 'bronze' | 'silver' | 'gold' | 'emerald' | 'purple' | 'amber' | 'indigo' | 'blue';
  xpReward: number;
}

export interface DailyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  practiceHistory: string[]; // List of YYYY-MM-DD
  practicedToday: boolean;
  totalDaysPracticed: number;
}


