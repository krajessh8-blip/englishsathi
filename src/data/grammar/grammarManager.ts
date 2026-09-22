import { GrammarTopic, GrammarProgressRecord, StudentGrammarSummary, AchievementBadge } from '../../types';
import { buildInitialGrammarTopics } from './grammarContent';
import { getGrammarBadgeForLevel } from '../badges';

const GRAMMAR_STORAGE_KEY = 'smart_english_grammar_topics_v1';
const GRAMMAR_PROGRESS_STORAGE_KEY = 'smart_english_grammar_progress_v1';

/**
 * Loads all grammar topics, initializing with full 10-level curriculum if empty
 */
export function getStoredGrammarTopics(): GrammarTopic[] {
  if (typeof window === 'undefined') return buildInitialGrammarTopics();

  try {
    const raw = localStorage.getItem(GRAMMAR_STORAGE_KEY);
    if (!raw) {
      const initial = buildInitialGrammarTopics();
      localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read grammar topics from storage:', err);
  }

  const initial = buildInitialGrammarTopics();
  try {
    localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

/**
 * Saves all grammar topics to localStorage
 */
export function saveGrammarTopics(topics: GrammarTopic[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(topics));
  } catch (err) {
    console.error('Failed to save grammar topics:', err);
  }
}

/**
 * Get topics for a specific level
 */
export function getTopicsForLevel(levelId: number, onlyPublished: boolean = true): GrammarTopic[] {
  const all = getStoredGrammarTopics();
  return all
    .filter((t) => t.level_id === levelId && (!onlyPublished || t.status === 'published'))
    .sort((a, b) => a.topic_number - b.topic_number);
}

/**
 * Updates or adds a single topic
 */
export function upsertGrammarTopic(topic: GrammarTopic): void {
  const all = getStoredGrammarTopics();
  const idx = all.findIndex((t) => t.id === topic.id);
  if (idx >= 0) {
    all[idx] = { ...topic, updated_at: new Date().toISOString() };
  } else {
    all.push({ ...topic, created_at: new Date().toISOString() });
  }
  saveGrammarTopics(all);
}

/**
 * Delete a topic by ID
 */
export function deleteGrammarTopic(topicId: string): void {
  const all = getStoredGrammarTopics();
  const filtered = all.filter((t) => t.id !== topicId);
  saveGrammarTopics(filtered);
}

/**
 * Toggle publish/draft status
 */
export function toggleTopicStatus(topicId: string): GrammarTopic | null {
  const all = getStoredGrammarTopics();
  const target = all.find((t) => t.id === topicId);
  if (!target) return null;
  target.status = target.status === 'published' ? 'draft' : 'published';
  target.updated_at = new Date().toISOString();
  saveGrammarTopics(all);
  return target;
}

// ----------------------------------------------------
// Student Grammar Progress Tracking
// ----------------------------------------------------

/**
 * Load all grammar progress records
 */
export function getAllGrammarProgress(): GrammarProgressRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GRAMMAR_PROGRESS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading grammar progress:', err);
  }
  return [];
}

/**
 * Get progress for a specific student
 */
export function getStudentGrammarProgress(studentId: string): GrammarProgressRecord[] {
  const all = getAllGrammarProgress();
  return all.filter((p) => p.student_id === studentId);
}

/**
 * Records or updates a student's completion and scores on a topic
 */
export function recordGrammarTopicProgress(record: {
  student_id: string;
  grammar_topic_id: string;
  completed: boolean;
  listening_score?: number;
  speaking_score?: number;
  writing_score?: number;
  quiz_score?: number;
  accuracy?: number;
}): GrammarProgressRecord {
  const all = getAllGrammarProgress();
  const existingIdx = all.findIndex(
    (p) => p.student_id === record.student_id && p.grammar_topic_id === record.grammar_topic_id
  );

  const listening = record.listening_score ?? 100;
  const speaking = record.speaking_score ?? 85;
  const writing = record.writing_score ?? 90;
  const quiz = record.quiz_score ?? 80;
  const computedAccuracy = record.accuracy ?? Math.round((listening + speaking + writing + quiz) / 4);

  const updatedRecord: GrammarProgressRecord = {
    id: `${record.student_id}_${record.grammar_topic_id}`,
    student_id: record.student_id,
    grammar_topic_id: record.grammar_topic_id,
    completed: record.completed,
    listening_score: listening,
    speaking_score: speaking,
    writing_score: writing,
    quiz_score: quiz,
    accuracy: computedAccuracy,
    last_attempt: new Date().toISOString(),
    completed_at: record.completed ? new Date().toISOString() : undefined,
  };

  if (existingIdx >= 0) {
    all[existingIdx] = {
      ...all[existingIdx],
      ...updatedRecord,
      completed: all[existingIdx].completed || record.completed,
    };
  } else {
    all.push(updatedRecord);
  }

  try {
    localStorage.setItem(GRAMMAR_PROGRESS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save grammar progress:', err);
  }

  return updatedRecord;
}

/**
 * Calculate full Grammar Summary for a student
 */
export function calculateStudentGrammarSummary(studentId: string, levelId?: number): StudentGrammarSummary {
  const records = getStudentGrammarProgress(studentId);
  const topics = levelId ? getTopicsForLevel(levelId, true) : getStoredGrammarTopics().filter((t) => t.status === 'published');

  const totalTopicsCount = topics.length > 0 ? topics.length : 5;
  const levelTopicIds = new Set(topics.map((t) => t.id));
  const completedRecords = records.filter(
    (r) => r.completed && (levelId !== undefined ? levelTopicIds.has(r.grammar_topic_id) : true)
  );
  const completedTopicsCount = completedRecords.length;

  if (completedRecords.length === 0) {
    return {
      completedTopicsCount: 0,
      totalTopicsCount,
      grammarQuizScore: 0,
      speakingGrammarScore: 0,
      writingGrammarScore: 0,
      listeningGrammarScore: 0,
      accuracy: 0,
      weakTopics: [],
      strongTopics: [],
      overallProgressPercent: 0,
    };
  }

  const avgQuiz = Math.round(
    completedRecords.reduce((acc, r) => acc + (r.quiz_score || 0), 0) / completedRecords.length
  );
  const avgSpeaking = Math.round(
    completedRecords.reduce((acc, r) => acc + (r.speaking_score || 0), 0) / completedRecords.length
  );
  const avgWriting = Math.round(
    completedRecords.reduce((acc, r) => acc + (r.writing_score || 0), 0) / completedRecords.length
  );
  const avgListening = Math.round(
    completedRecords.reduce((acc, r) => acc + (r.listening_score || 0), 0) / completedRecords.length
  );
  const avgAccuracy = Math.round(
    completedRecords.reduce((acc, r) => acc + (r.accuracy || 0), 0) / completedRecords.length
  );

  const strongTopics: string[] = [];
  const weakTopics: string[] = [];

  completedRecords.forEach((r) => {
    const topic = topics.find((t) => t.id === r.grammar_topic_id);
    const title = topic?.title_en || r.grammar_topic_id;
    if (r.accuracy >= 75) {
      if (strongTopics.length < 4) strongTopics.push(title);
    } else {
      if (weakTopics.length < 4) weakTopics.push(title);
    }
  });

  const overallProgressPercent = totalTopicsCount > 0
    ? Math.min(100, Math.round((completedTopicsCount / totalTopicsCount) * 100))
    : 0;

  return {
    completedTopicsCount,
    totalTopicsCount,
    grammarQuizScore: avgQuiz,
    speakingGrammarScore: avgSpeaking,
    writingGrammarScore: avgWriting,
    listeningGrammarScore: avgListening,
    accuracy: avgAccuracy,
    weakTopics,
    strongTopics,
    overallProgressPercent,
  };
}

/**
 * Checks if a student has achieved 100% completion in a specific grammar level
 */
export function isGrammarLevelFullyCompleted(
  studentId: string,
  levelId: number
): {
  isCompleted: boolean;
  completedCount: number;
  totalCount: number;
  percent: number;
  badge?: AchievementBadge;
} {
  const summary = calculateStudentGrammarSummary(studentId, levelId);
  const isCompleted = summary.totalTopicsCount > 0 && summary.completedTopicsCount >= summary.totalTopicsCount;
  const badge = getGrammarBadgeForLevel(levelId);

  return {
    isCompleted,
    completedCount: summary.completedTopicsCount,
    totalCount: summary.totalTopicsCount,
    percent: summary.overallProgressPercent,
    badge,
  };
}

/**
 * Returns all level IDs (1-10) where a student has completed 100% of the topics
 */
export function getStudentCompletedGrammarLevels(studentId: string): number[] {
  const completed: number[] = [];
  for (let lvl = 1; lvl <= 10; lvl++) {
    const status = isGrammarLevelFullyCompleted(studentId, lvl);
    if (status.isCompleted) {
      completed.push(lvl);
    }
  }
  return completed;
}

