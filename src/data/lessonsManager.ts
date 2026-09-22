import { SITUATIONS } from './situations';
import { Situation, ConversationLine } from '../types';
import { getSituationLevel } from './levels';

const LESSONS_STORAGE_KEY = 'smart_english_sathi_lessons_data_v3';
const LEGACY_STORAGE_KEY_V2 = 'smart_english_sathi_lessons_data_v2';
const LEGACY_STORAGE_KEY_V1 = 'smart_english_sathi_lessons_data';
const LEGACY_STORAGE_KEY_ORIGINAL = 'mvm_kenedi_lessons_data';

/**
 * Hard protection rule:
 * Situations 1-5 for every level (Level 1 to 10) are permanently published and protected.
 * Any save, update, or bulk paste attempting to alter situation_no 1-5 must be rejected.
 */
export function isProtectedSituation(s: Partial<Situation>): boolean {
  if (typeof s.situation_no === 'number') {
    return s.situation_no >= 1 && s.situation_no <= 5;
  }
  if (typeof s.id === 'number' && s.id >= 1 && s.id <= 50) {
    return true;
  }
  return false;
}

/**
 * Checks whether a situation is published and visible to students.
 * Only situations with status === 'published' are accessible to students.
 * Any draft situation (including situations 6–40) remains completely invisible to students.
 */
export function isLessonPublished(s: Partial<Situation>): boolean {
  return s.status === 'published';
}

/**
 * Filters a list of situations for student consumption.
 * Strictly verifies status === 'published'.
 */
export function filterPublishedLessons(lessons: Situation[]): Situation[] {
  return lessons.filter((s) => s.status === 'published');
}

/**
 * Returns canonical immutable published Situations 1-5 for all 10 levels (50 total).
 */
export function getCanonicalPublishedSituations(): Situation[] {
  return SITUATIONS.map((s) => {
    const lvl = s.level || getSituationLevel(s.id);
    const sitNo = ((s.id - 1) % 5) + 1;
    return {
      ...s,
      level: lvl,
      situation_no: sitNo,
      status: 'published' as const,
      lessonId: s.lessonId || s.id,
      youtubeLink: s.youtubeLink || `https://www.youtube.com/watch?v=smart_lesson_${s.id}`,
      access: (s.access || (s.id <= 5 ? 'free' : 'paid')) as 'free' | 'paid',
      schoolId: s.schoolId !== undefined ? s.schoolId : null,
      isActive: true,
      char1_role: s.char1_role || 'teacher',
      char1_name: s.char1_name || 'Teacher Anjali',
      char1_image: s.char1_image || 'teacher',
      char2_role: s.char2_role || 'student',
      char2_name: s.char2_name || 'Riya',
      char2_image: s.char2_image || 'riya',
      lines: s.lines || s.dialogs.map((d) => ({
        id: d.id,
        speaker: d.who,
        text: d.text,
        marathi: d.marathi,
        hindi: d.hindi,
      })),
      difficulty:
        s.difficulty ||
        (lvl <= 2
          ? 'Beginner'
          : lvl <= 4
          ? 'Intermediate'
          : lvl <= 7
          ? 'Advanced'
          : 'Expert'),
      updatedAt: s.updatedAt || '2026-09-10',
    };
  });
}

/**
 * Creates an empty draft situation object according to exact user specifications:
 * - status: "draft"
 * - title: ""
 * - char1_role: ""
 * - char1_name: ""
 * - char1_image: ""
 * - char2_role: ""
 * - char2_name: ""
 * - char2_image: ""
 * - lines: 20 empty objects total
 * - correct level and situation_no
 */
export function createEmptyDraft(level: number, situation_no: number): Situation {
  return {
    id: level * 1000 + situation_no,
    level,
    situation_no,
    status: 'draft',
    title: '',
    char1_role: '',
    char1_name: '',
    char1_image: '',
    char2_role: '',
    char2_name: '',
    char2_image: '',
    lines: Array.from({ length: 20 }, () => ({})),
    subtitle: '',
    setting: '',
    dialogs: [],
    vocabulary: [],
    questions: [],
    roleplaySteps: [],
    isActive: false,
    access: 'free',
    schoolId: null,
    difficulty:
      level <= 2
        ? 'Beginner'
        : level <= 4
        ? 'Intermediate'
        : level <= 7
        ? 'Advanced'
        : 'Expert',
    updatedAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Loads all 400 situations (40 per level across 10 levels):
 * - Situations 1-5 for each level are ALWAYS published & protected (from canonical master data)
 * - Situations 6-40 for each level are loaded from storage or initialized as empty drafts
 */
export function getStoredLessons(): Situation[] {
  const publishedMaster = getCanonicalPublishedSituations();
  const publishedKeyMap = new Map<string, Situation>();
  publishedMaster.forEach((p) => {
    publishedKeyMap.set(`${p.level}-${p.situation_no}`, p);
  });

  if (typeof window === 'undefined') {
    // Generate full 400 situations in SSR/server mode
    return assembleAllSituations(publishedKeyMap, new Map());
  }

  try {
    const saved =
      localStorage.getItem(LESSONS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY_V2) ||
      localStorage.getItem(LEGACY_STORAGE_KEY_V1) ||
      localStorage.getItem(LEGACY_STORAGE_KEY_ORIGINAL);

    const savedMap = new Map<string, Situation>();

    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (!item) return;
          const lvl = item.level || (typeof item.id === 'number' ? getSituationLevel(item.id) : undefined);
          const sitNo =
            item.situation_no !== undefined
              ? item.situation_no
              : typeof item.id === 'number' && item.id <= 50
              ? ((item.id - 1) % 5) + 1
              : undefined;

          if (lvl && sitNo) {
            savedMap.set(`${lvl}-${sitNo}`, item);
          } else if (item.id) {
            savedMap.set(`id-${item.id}`, item);
          }
        });
      }
    }

    const allSituations = assembleAllSituations(publishedKeyMap, savedMap);
    // Sync back to current storage key
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(allSituations));
    return allSituations;
  } catch (err) {
    console.error('Error loading stored lessons:', err);
    return assembleAllSituations(publishedKeyMap, new Map());
  }
}

/**
 * Assembles 400 situations (Levels 1 to 10, Situations 1 to 40).
 * Enforces Situations 1-5 are strictly canonical published content.
 */
function assembleAllSituations(
  publishedMap: Map<string, Situation>,
  savedMap: Map<string, Situation>
): Situation[] {
  const result: Situation[] = [];

  for (let level = 1; level <= 10; level++) {
    // Situations 1 to 5: Published (immutable)
    for (let sitNo = 1; sitNo <= 5; sitNo++) {
      const key = `${level}-${sitNo}`;
      const canonical = publishedMap.get(key);
      if (canonical) {
        result.push(canonical);
      } else {
        // Fallback calculation for canonical published
        const fallbackId = (level - 1) * 5 + sitNo;
        const base = SITUATIONS.find((s) => s.id === fallbackId) || SITUATIONS[0];
        result.push({
          ...base,
          id: fallbackId,
          level,
          situation_no: sitNo,
          status: 'published',
          isActive: true,
        });
      }
    }

    // Situations 6 to 40: Draft slots (load saved if exists, otherwise empty draft)
    for (let sitNo = 6; sitNo <= 40; sitNo++) {
      const key = `${level}-${sitNo}`;
      const saved = savedMap.get(key);
      if (saved) {
        result.push({
          ...createEmptyDraft(level, sitNo),
          ...saved,
          id: saved.id || level * 1000 + sitNo,
          level,
          situation_no: sitNo,
          status: saved.status || 'draft',
          lines: Array.isArray(saved.lines) && saved.lines.length === 20
            ? saved.lines
            : Array.from({ length: 20 }, (_, idx) => (saved.lines?.[idx] || {})),
        });
      } else {
        result.push(createEmptyDraft(level, sitNo));
      }
    }
  }

  return result;
}

/**
 * Saves lessons with strict Hard Protection Rule:
 * Any modification targeting Situations 1-5 is automatically rejected / reverted to canonical published content.
 */
export function saveLessons(lessons: Situation[]): void {
  if (typeof window === 'undefined') return;
  try {
    const canonicalList = getCanonicalPublishedSituations();
    const canonicalMap = new Map<string, Situation>();
    canonicalList.forEach((c) => canonicalMap.set(`${c.level}-${c.situation_no}`, c));

    // Sanitize incoming array to enforce protection of Situations 1-5
    const protectedLessons = lessons.map((item) => {
      const isProtected =
        (item.situation_no && item.situation_no >= 1 && item.situation_no <= 5) ||
        (item.id >= 1 && item.id <= 50 && (!item.situation_no || item.situation_no <= 5));

      if (isProtected) {
        const sitNo = item.situation_no || ((item.id - 1) % 5) + 1;
        const lvl = item.level || getSituationLevel(item.id);
        const canonical = canonicalMap.get(`${lvl}-${sitNo}`);
        if (canonical) {
          return canonical; // Enforce immutable original content
        }
      }
      return item;
    });

    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(protectedLessons));
  } catch (err) {
    console.error('Failed to save lessons to localStorage', err);
  }
}

/**
 * Resets lessons: Preserves Situations 1-5 intact as published, and clears Situations 6-40 back to empty drafts.
 */
export function resetLessonsToDefault(): Situation[] {
  const publishedMaster = getCanonicalPublishedSituations();
  const publishedKeyMap = new Map<string, Situation>();
  publishedMaster.forEach((p) => {
    publishedKeyMap.set(`${p.level}-${p.situation_no}`, p);
  });

  const fresh = assembleAllSituations(publishedKeyMap, new Map());
  if (typeof window !== 'undefined') {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  parsedSituations: Situation[];
  summary: {
    level: number;
    count: number;
    situationNumbers: number[];
  };
}

/**
 * Validates pasted bulk data for a specific Level:
 * - Allow updates only for Situations 6–40
 * - Reject any attempt to modify Situations 1–5
 * - Never overwrite published content
 * - Validate that situation numbers are between 6 and 40
 * - Prevent duplicate situation numbers
 * - Show clear validation errors
 */
export function validateBulkPastedData(level: number, rawInput: string): ValidationResult {
  const errors: string[] = [];
  const parsedSituations: Situation[] = [];
  const seenSitNos = new Set<number>();

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      errors: ['Pasted content is empty. Please enter JSON data containing situations 6 to 40.'],
      parsedSituations: [],
      summary: { level, count: 0, situationNumbers: [] },
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err: any) {
    return {
      valid: false,
      errors: [
        `JSON Syntax Error: ${err?.message || 'Invalid JSON format'}. Please ensure quotes and brackets are properly formatted.`,
      ],
      parsedSituations: [],
      summary: { level, count: 0, situationNumbers: [] },
    };
  }

  // Normalize parsed data into an array
  let rawList: any[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    // If keyed by situation number e.g. { "6": { ... }, "7": { ... } }
    rawList = Object.entries(parsed as Record<string, unknown>).map(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        const objVal = val as Record<string, any>;
        return {
          situation_no: objVal.situation_no ?? parseInt(key, 10),
          ...objVal,
        };
      }
      return val;
    });
  } else {
    return {
      valid: false,
      errors: ['Input must be a JSON array of situation objects or an object keyed by situation number.'],
      parsedSituations: [],
      summary: { level, count: 0, situationNumbers: [] },
    };
  }

  if (rawList.length === 0) {
    return {
      valid: false,
      errors: ['The pasted JSON array is empty. No situations found.'],
      parsedSituations: [],
      summary: { level, count: 0, situationNumbers: [] },
    };
  }

  rawList.forEach((item, index) => {
    const itemLabel = `Item #${index + 1}`;

    if (!item || typeof item !== 'object') {
      errors.push(`${itemLabel}: Entry is not a valid object.`);
      return;
    }

    const sitNo = Number(item.situation_no);
    if (isNaN(sitNo)) {
      errors.push(`${itemLabel}: Missing or invalid "situation_no". Each entry must include "situation_no" between 6 and 40.`);
      return;
    }

    // Hard Protection Rule 1: Reject any modification to Situations 1-5
    if (sitNo >= 1 && sitNo <= 5) {
      errors.push(
        `❌ PROTECTED CONTENT VIOLATION: Situation #${sitNo} is an existing published conversation. Situations 1–5 are permanently locked and cannot be modified or overwritten.`
      );
      return;
    }

    // Range Validation: Only 6 to 40
    if (sitNo < 6 || sitNo > 40) {
      errors.push(
        `❌ OUT OF RANGE: Situation #${sitNo} is outside the allowed range. Bulk Paste only accepts situation numbers from 6 to 40.`
      );
      return;
    }

    // Duplicate Check
    if (seenSitNos.has(sitNo)) {
      errors.push(
        `❌ DUPLICATE SITUATION: Situation #${sitNo} appears more than once in the pasted data. Each situation number must be unique.`
      );
      return;
    }
    seenSitNos.add(sitNo);

    // Optional level check
    if (item.level !== undefined && Number(item.level) !== level) {
      errors.push(
        `⚠️ LEVEL MISMATCH: Situation #${sitNo} has level "${item.level}", but this section is for Level ${level}.`
      );
      return;
    }

    // Standardize lines array (ensure 20 objects)
    let standardizedLines: ConversationLine[] = [];
    if (Array.isArray(item.lines)) {
      standardizedLines = Array.from({ length: 20 }, (_, idx) => item.lines[idx] || {});
    } else if (Array.isArray(item.dialogs)) {
      standardizedLines = Array.from({ length: 20 }, (_, idx) => {
        const d = item.dialogs[idx];
        if (d) {
          return {
            id: d.id || idx + 1,
            speaker: d.who || d.speaker || '',
            text: d.text || '',
            marathi: d.marathi || '',
            hindi: d.hindi || '',
          };
        }
        return {};
      });
    } else {
      standardizedLines = Array.from({ length: 20 }, () => ({}));
    }

    // Build valid Situation object
    const situationObj: Situation = {
      id: level * 1000 + sitNo,
      level,
      situation_no: sitNo,
      status: item.status === 'published' ? 'published' : 'draft',
      title: typeof item.title === 'string' ? item.title.trim() : '',
      char1_role: typeof item.char1_role === 'string' ? item.char1_role.trim() : '',
      char1_name: typeof item.char1_name === 'string' ? item.char1_name.trim() : '',
      char1_image: typeof item.char1_image === 'string' ? item.char1_image.trim() : '',
      char2_role: typeof item.char2_role === 'string' ? item.char2_role.trim() : '',
      char2_name: typeof item.char2_name === 'string' ? item.char2_name.trim() : '',
      char2_image: typeof item.char2_image === 'string' ? item.char2_image.trim() : '',
      lines: standardizedLines,
      subtitle: typeof item.subtitle === 'string' ? item.subtitle.trim() : '',
      setting: typeof item.setting === 'string' ? item.setting.trim() : '',
      dialogs: Array.isArray(item.dialogs) ? item.dialogs : [],
      vocabulary: Array.isArray(item.vocabulary) ? item.vocabulary : [],
      questions: Array.isArray(item.questions) ? item.questions : [],
      roleplaySteps: Array.isArray(item.roleplaySteps) ? item.roleplaySteps : [],
      isActive: item.status === 'published' || item.isActive === true,
      difficulty: item.difficulty || (level <= 2 ? 'Beginner' : level <= 4 ? 'Intermediate' : level <= 7 ? 'Advanced' : 'Expert'),
      access: item.access || 'free',
      schoolId: item.schoolId ?? null,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    parsedSituations.push(situationObj);
  });

  const sortedNos = Array.from(seenSitNos).sort((a, b) => a - b);

  return {
    valid: errors.length === 0,
    errors,
    parsedSituations: errors.length === 0 ? parsedSituations : [],
    summary: {
      level,
      count: parsedSituations.length,
      situationNumbers: sortedNos,
    },
  };
}

/**
 * Saves validated situations for a specific level into the lesson registry.
 * Replaces or updates only the draft slots (6 to 40) for that level.
 * Guarantees Situations 1-5 are never changed.
 */
export function applyBulkSituations(
  currentLessons: Situation[],
  level: number,
  newSituations: Situation[]
): { updatedLessons: Situation[]; count: number } {
  // Map of incoming new situations by situation_no
  const updateMap = new Map<number, Situation>();
  newSituations.forEach((sit) => {
    if (sit.situation_no && sit.situation_no >= 6 && sit.situation_no <= 40) {
      updateMap.set(sit.situation_no, sit);
    }
  });

  const matchedSitNos = new Set<number>();

  const updated = currentLessons.map((existing) => {
    const sitLevel = existing.level || getSituationLevel(existing.id);
    const sitNo = existing.situation_no;

    // Reject any modification to situations 1-5
    if (sitNo && sitNo <= 5) {
      return existing;
    }

    if (sitLevel === level && sitNo && updateMap.has(sitNo)) {
      const incoming = updateMap.get(sitNo)!;
      matchedSitNos.add(sitNo);
      return {
        ...existing,
        ...incoming,
        id: existing.id || level * 1000 + sitNo,
        level,
        situation_no: sitNo,
      };
    }

    return existing;
  });

  // Append any new situations that were not already in currentLessons
  updateMap.forEach((incoming, sitNo) => {
    if (!matchedSitNos.has(sitNo)) {
      updated.push({
        ...incoming,
        id: incoming.id || level * 1000 + sitNo,
        level,
        situation_no: sitNo,
      });
    }
  });

  saveLessons(updated);
  return { updatedLessons: updated, count: updateMap.size };
}

/**
 * Generates sample JSON template for situations 6 to 40 for copying / reference.
 */
export function generateSampleJsonTemplate(level: number, count: number = 3): string {
  const sample = Array.from({ length: count }, (_, i) => {
    const sitNo = 6 + i;
    return {
      situation_no: sitNo,
      title: `Sample Situation ${sitNo} - Topic Title`,
      char1_role: 'teacher',
      char1_name: 'Teacher Anjali',
      char1_image: 'teacher',
      char2_role: 'student',
      char2_name: 'Riya',
      char2_image: 'riya',
      status: 'draft',
      lines: [
        { id: 1, speaker: 'teacher', text: `Hello Riya, welcome to situation ${sitNo}.`, marathi: `नमस्ते रिया, प्रसंग ${sitNo} मध्ये तुझे स्वागत आहे.` },
        { id: 2, speaker: 'student', text: 'Thank you teacher! I am ready to practice.', marathi: 'धन्यवाद मॅडम! मी सराव करायला तयार आहे.' },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ],
    };
  });

  return JSON.stringify(sample, null, 2);
}
