import { AchievementBadge } from '../types';

export const SITUATION_BADGES: AchievementBadge[] = [
  {
    id: 'badge-1-sit',
    title: 'First Steps Orator',
    marathiTitle: 'पहिले पाऊल वक्ता',
    description: 'Completed your 1st spoken English situation with Teacher Anjali & Riya.',
    marathiDesc: 'तुमचा पहिला इंग्रजी संभाषण प्रसंग यशस्वीरीत्या पूर्ण केला.',
    icon: '🌱',
    category: 'milestone',
    targetSituations: 1,
    colorScheme: 'bronze',
    xpReward: 50,
  },
  {
    id: 'badge-5-sit',
    title: 'High Five Achiever',
    marathiTitle: '५ प्रसंग पूर्ण (प्राथमिक यश)',
    description: 'Completed 5 situations! Mastered Group A everyday school greetings & basic classroom conversations.',
    marathiDesc: '५ प्रसंग पूर्ण! दैनंदिन वर्ग आणि शाळा संभाषणात उत्तम प्रगती केली.',
    icon: '🥉',
    category: 'milestone',
    targetSituations: 5,
    colorScheme: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-10-sit',
    title: 'Halfway Champion',
    marathiTitle: '१० प्रसंग विजेता (अर्धा टप्पा)',
    description: 'Completed 10 situations! Conquered Group A & B, ready for library, sports ground, and science lab talks.',
    marathiDesc: 'अर्धा टप्पा पार! १० संभाषण प्रसंग पूर्ण करून आत्मविश्वास वाढवला.',
    icon: '🥈',
    category: 'milestone',
    targetSituations: 10,
    colorScheme: 'silver',
    xpReward: 300,
  },
  {
    id: 'badge-15-sit',
    title: 'Senior Communicator',
    marathiTitle: '१५ प्रसंग पूर्ण (प्रगत संभाषणकार)',
    description: 'Completed 15 situations! Capable of debating, career discussions, and principal office dialogues.',
    marathiDesc: '१५ प्रसंग पूर्ण! माध्यमिक व उच्च माध्यमिक स्तरावर उत्तम इंग्रजी संभाषण कौशल्य.',
    icon: '💎',
    category: 'milestone',
    targetSituations: 15,
    colorScheme: 'emerald',
    xpReward: 500,
  },
  {
    id: 'badge-20-sit',
    title: 'Grand School Orator',
    marathiTitle: 'सर्व २० प्रसंग (सुवर्ण वक्ता)',
    description: 'Mastered all 20 situations! Supreme Spoken English honor of Smart English Sathi.',
    marathiDesc: 'अभिनंदन! शाळेचे सर्व २० प्रसंग पूर्ण करून सुवर्ण वक्ता बहुमान पटकावला.',
    icon: '👑',
    category: 'milestone',
    targetSituations: 20,
    colorScheme: 'gold',
    xpReward: 1000,
  },
  {
    id: 'badge-100-pts',
    title: 'Century Speaker',
    marathiTitle: '१०० गुण संपादन',
    description: 'Earned 100+ speaking score points in vocabulary and role play stages.',
    marathiDesc: 'शब्दसंग्रह व संवादामध्ये १०० पेक्षा जास्त गुण मिळवले.',
    icon: '⭐',
    category: 'mastery',
    targetScore: 100,
    colorScheme: 'amber',
    xpReward: 75,
  },
  {
    id: 'badge-300-pts',
    title: 'Vocabulary Titan',
    marathiTitle: '३०० गुण संपादन',
    description: 'Earned 300+ points across all three learning stages.',
    marathiDesc: 'सराव व चाचण्यांमध्ये ३०० पेक्षा जास्त गुण संपादन केले.',
    icon: '🏆',
    category: 'mastery',
    targetScore: 300,
    colorScheme: 'amber',
    xpReward: 150,
  },
  {
    id: 'badge-600-pts',
    title: 'Valedictorian Honors',
    marathiTitle: '६००+ गुण (सर्वोच्च गुणवत्ता)',
    description: 'Earned 600+ points with exemplary pronunciation and role play confidence.',
    marathiDesc: '६०० हून अधिक गुण मिळवून उत्कृष्ट इंग्रजी उच्चार व संभाषण सिद्ध केले.',
    icon: '🎖️',
    category: 'mastery',
    targetScore: 600,
    colorScheme: 'purple',
    xpReward: 300,
  },
];

// Specific grammar-themed badges earned upon completing 100% of the topics in each level
export const GRAMMAR_LEVEL_BADGES: AchievementBadge[] = [
  {
    id: 'badge-grammar-lvl-1',
    title: 'Phonics & Alphabet Pioneer',
    marathiTitle: 'अक्षर व ध्वनी प्रणेता (स्तर १)',
    description: 'Mastered 100% of Level 1 Grammar topics (Alphabets, Vowels, Naming Words & First Sentences)!',
    marathiDesc: 'स्तर १ चे सर्व १००% व्याकरण घटक (मुळाक्षरे, स्वर, नामे आणि सोपी वाक्ये) यशस्वीरीत्या पूर्ण केले!',
    icon: '🔤',
    category: 'grammar',
    targetGrammarLevel: 1,
    colorScheme: 'blue',
    xpReward: 100,
  },
  {
    id: 'badge-grammar-lvl-2',
    title: 'Noun & Article Champion',
    marathiTitle: 'नाम व उपपद विजेता (स्तर २)',
    description: 'Mastered 100% of Level 2 Grammar topics (Nouns, Pronouns, Articles & Singular/Plural)!',
    marathiDesc: 'स्तर २ चे सर्व १००% व्याकरण घटक (नामे, सर्वनामे, उपपदे व एकवचन-अनेकवचन) पूर्ण केले!',
    icon: '📚',
    category: 'grammar',
    targetGrammarLevel: 2,
    colorScheme: 'blue',
    xpReward: 150,
  },
  {
    id: 'badge-grammar-lvl-3',
    title: 'Sentence Architect',
    marathiTitle: 'वाक्य रचनाकार (स्तर ३)',
    description: 'Mastered 100% of Level 3 Grammar topics (Action Verbs, Tenses, Conjunctions & Adjectives)!',
    marathiDesc: 'स्तर ३ चे सर्व १००% व्याकरण घटक (क्रियापदे, काळ व वाक्यरचना) पूर्ण केले!',
    icon: '🏛️',
    category: 'grammar',
    targetGrammarLevel: 3,
    colorScheme: 'emerald',
    xpReward: 200,
  },
  {
    id: 'badge-grammar-lvl-4',
    title: 'Tense Master',
    marathiTitle: 'काळ पारंगत (स्तर ४ कालखंड अधिपती)',
    description: 'Mastered 100% of Level 4 Grammar topics (Present, Past, Future, Continuous & Perfect Tenses)!',
    marathiDesc: 'अभिनंदन! स्तर ४ चे सर्व काळ १००% अचूकतेने पूर्ण करून "काळ पारंगत" किताब जिंकला!',
    icon: '⏳',
    category: 'grammar',
    targetGrammarLevel: 4,
    colorScheme: 'emerald',
    xpReward: 300,
  },
  {
    id: 'badge-grammar-lvl-5',
    title: 'Voice & Modal Virtuoso',
    marathiTitle: 'प्रयोग व सहाय्यक क्रियापद प्रवीण (स्तर ५)',
    description: 'Mastered 100% of Level 5 Grammar topics (Active & Passive Voice, Modals, Degrees of Comparison)!',
    marathiDesc: 'स्तर ५ चे १००% घटक (कर्तरी-कर्मणी प्रयोग, मोडाल्स, तुलनात्मक रूपे) पूर्ण केले!',
    icon: '🎭',
    category: 'grammar',
    targetGrammarLevel: 5,
    colorScheme: 'amber',
    xpReward: 350,
  },
  {
    id: 'badge-grammar-lvl-6',
    title: 'Clause & Syntax Captain',
    marathiTitle: 'उपनाम व वाक्यविचार कर्णधार (स्तर ६)',
    description: 'Mastered 100% of Level 6 Grammar topics (Subordinate Clauses, Conditionals & Complex Syntax)!',
    marathiDesc: 'स्तर ६ चे १००% घटक (गौण वाक्ये, अट दर्शक वाक्ये व संयुक्त रचना) पूर्ण केले!',
    icon: '🧭',
    category: 'grammar',
    targetGrammarLevel: 6,
    colorScheme: 'amber',
    xpReward: 400,
  },
  {
    id: 'badge-grammar-lvl-7',
    title: 'Speech & Transformation Sage',
    marathiTitle: 'अप्रत्यक्ष कथन व रूपांतरण महर्षी (स्तर ७)',
    description: 'Mastered 100% of Level 7 Grammar topics (Reported Speech, Question Tags & Board Exam Grammar)!',
    marathiDesc: 'स्तर ७ चे १००% घटक (अप्रत्यक्ष कथन, प्रश्न विचारणे व बोर्ड परीक्षा व्याकरण) पूर्ण केले!',
    icon: '📜',
    category: 'grammar',
    targetGrammarLevel: 7,
    colorScheme: 'purple',
    xpReward: 500,
  },
  {
    id: 'badge-grammar-lvl-8',
    title: 'Advanced Syntax Artisan',
    marathiTitle: 'प्रगत रचना शिल्पकार (स्तर ८)',
    description: 'Mastered 100% of Level 8 Grammar topics (Non-finite Verbs, Gerunds, Participles & Synthesis)!',
    marathiDesc: 'स्तर ८ चे १००% घटक (कृदंत, धातुसाधित नामे व वाक्य संश्लेषण) पूर्ण केले!',
    icon: '🖋️',
    category: 'grammar',
    targetGrammarLevel: 8,
    colorScheme: 'purple',
    xpReward: 600,
  },
  {
    id: 'badge-grammar-lvl-9',
    title: 'Academic Stylist',
    marathiTitle: 'शैक्षणिक इंग्रजी शैलीकार (स्तर ९)',
    description: 'Mastered 100% of Level 9 Grammar topics (Discourse Markers, Inversion, Subjunctive & Academic Tone)!',
    marathiDesc: 'स्तर ९ चे १००% घटक (शैक्षणिक निबंध, वाक्य विपर्यास व उच्च इंग्रजी शैली) पूर्ण केले!',
    icon: '🎓',
    category: 'grammar',
    targetGrammarLevel: 9,
    colorScheme: 'indigo',
    xpReward: 750,
  },
  {
    id: 'badge-grammar-lvl-10',
    title: 'Grammar Guru',
    marathiTitle: 'इंग्रजी व्याकरण गुरु (सर्वोच्च महाविद्वान)',
    description: 'Supreme honor! Mastered 100% of Level 10 Professional, Competitive & Mastery Grammar curriculum!',
    marathiDesc: 'सर्वोच्च बहुमान! स्तर १० चे सर्व १००% प्रगत व स्पर्धा परीक्षा व्याकरण पूर्ण करून "व्याकरण गुरु" किताब पटकावला!',
    icon: '👑',
    category: 'grammar',
    targetGrammarLevel: 10,
    colorScheme: 'gold',
    xpReward: 1000,
  },
];

export const ALL_BADGES: AchievementBadge[] = [
  ...SITUATION_BADGES,
  ...GRAMMAR_LEVEL_BADGES,
];

export function getGrammarBadgeForLevel(levelId: number): AchievementBadge | undefined {
  return GRAMMAR_LEVEL_BADGES.find((b) => b.targetGrammarLevel === levelId);
}

export function isBadgeUnlocked(
  badge: AchievementBadge,
  completedCount: number,
  score: number,
  completedGrammarLevels?: number[] | Set<number>
): boolean {
  if (badge.category === 'grammar' && badge.targetGrammarLevel !== undefined) {
    if (completedGrammarLevels) {
      const set = completedGrammarLevels instanceof Set
        ? completedGrammarLevels
        : new Set(completedGrammarLevels);
      return set.has(badge.targetGrammarLevel);
    }
    return false;
  }
  if (badge.targetSituations !== undefined && completedCount >= badge.targetSituations) {
    return true;
  }
  if (badge.targetScore !== undefined && score >= badge.targetScore) {
    return true;
  }
  return false;
}

export function getBadgeProgress(
  badge: AchievementBadge,
  completedCount: number,
  score: number,
  grammarProgress?: { current: number; max: number; percent: number }
): { current: number; max: number; percent: number } {
  if (badge.category === 'grammar') {
    if (grammarProgress) return grammarProgress;
    return { current: 0, max: 100, percent: 0 };
  }
  if (badge.targetSituations !== undefined) {
    const current = Math.min(completedCount, badge.targetSituations);
    const max = badge.targetSituations;
    const percent = Math.min(100, Math.round((current / max) * 100));
    return { current, max, percent };
  }
  if (badge.targetScore !== undefined) {
    const current = Math.min(score, badge.targetScore);
    const max = badge.targetScore;
    const percent = Math.min(100, Math.round((current / max) * 100));
    return { current, max, percent };
  }
  return { current: 0, max: 1, percent: 0 };
}

export function getNextMilestone(completedCount: number): {
  target: number;
  remaining: number;
  badge: AchievementBadge | undefined;
} {
  const milestones = [1, 5, 10, 15, 20];
  const nextTarget = milestones.find((m) => m > completedCount) || 20;
  const remaining = Math.max(0, nextTarget - completedCount);
  const badge = SITUATION_BADGES.find((b) => b.targetSituations === nextTarget);

  return { target: nextTarget, remaining, badge };
}
