import { DailyStreakData } from '../types';

const STORAGE_KEY = 'smart_daily_streak_v1';
const LEGACY_STORAGE_KEY = 'mvm_daily_streak_v1';

/**
 * Returns a standardized local date string in YYYY-MM-DD format.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the date offset by N days from the given reference date.
 */
export function getDateOffset(daysOffset: number, refDate: Date = new Date()): string {
  const d = new Date(refDate);
  d.setDate(d.getDate() + daysOffset);
  return getLocalDateString(d);
}

/**
 * Calculates current streak, longest streak, and practice status from an array of date strings.
 */
export function calculateStreakFromDates(dateList: string[]): {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
  lastPracticeDate: string;
  totalDaysPracticed: number;
} {
  const uniqueDates = Array.from(new Set(dateList.filter(Boolean))).sort();
  const dateSet = new Set(uniqueDates);

  const todayStr = getLocalDateString();
  const yesterdayStr = getDateOffset(-1);

  const practicedToday = dateSet.has(todayStr);
  const practicedYesterday = dateSet.has(yesterdayStr);

  let currentStreak = 0;

  if (practicedToday) {
    // Count consecutive days backwards starting from today
    let checkDate = new Date();
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (practicedYesterday) {
    // Active streak from yesterday waiting for today's practice
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    currentStreak = 0;
  }

  // Calculate historical longest streak
  let longestStreak = 0;
  let runningStreak = 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prev = new Date(`${uniqueDates[i - 1]}T00:00:00`);
      const curr = new Date(`${uniqueDates[i]}T00:00:00`);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak += 1;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const lastPracticeDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : '';

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    practicedToday,
    lastPracticeDate,
    totalDaysPracticed: uniqueDates.length,
  };
}

/**
 * Initializes default initial streak data for students (e.g. Riya Sharma).
 * Provides a realistic 3-day active streak (yesterday, 2 days ago, 3 days ago)
 * so that when the student practices today, it visibly extends to 4 days!
 */
function getInitialSeedHistory(): string[] {
  return [getDateOffset(-3), getDateOffset(-2), getDateOffset(-1)];
}

/**
 * Loads current daily streak data from localStorage, computing current streak dynamically.
 */
export function loadDailyStreak(): DailyStreakData {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 3,
      longestStreak: 5,
      lastPracticeDate: getDateOffset(-1),
      practiceHistory: getInitialSeedHistory(),
      practicedToday: false,
      totalDaysPracticed: 3,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    let history: string[];

    if (raw) {
      const parsed = JSON.parse(raw);
      history = Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [];
    } else {
      // First-time load: seed with active 3-day baseline
      history = getInitialSeedHistory();
      const initialComputed = calculateStreakFromDates(history);
      const initialData: DailyStreakData = {
        ...initialComputed,
        practiceHistory: history,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }

    const computed = calculateStreakFromDates(history);
    return {
      ...computed,
      practiceHistory: history,
    };
  } catch (err) {
    console.error('Error loading daily streak data:', err);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
      practiceHistory: [],
      practicedToday: false,
      totalDaysPracticed: 0,
    };
  }
}

/**
 * Records that a situation was practiced today, extending or maintaining the streak.
 */
export function recordDailySituationPractice(situationId?: number): {
  updatedStreak: DailyStreakData;
  isNewPracticeToday: boolean;
} {
  const todayStr = getLocalDateString();
  const currentData = loadDailyStreak();

  const isAlreadyPracticedToday = currentData.practiceHistory.includes(todayStr);

  const updatedHistory = isAlreadyPracticedToday
    ? currentData.practiceHistory
    : [...currentData.practiceHistory, todayStr].sort();

  const computed = calculateStreakFromDates(updatedHistory);

  const updatedStreak: DailyStreakData = {
    ...computed,
    practiceHistory: updatedHistory,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStreak));
    } catch (e) {
      console.error('Failed to save streak to localStorage:', e);
    }
  }

  return {
    updatedStreak,
    isNewPracticeToday: !isAlreadyPracticedToday,
  };
}

/**
 * Resets the streak for testing/demonstration purposes.
 */
export function resetDailyStreak(): DailyStreakData {
  const seed = getInitialSeedHistory();
  const computed = calculateStreakFromDates(seed);
  const data: DailyStreakData = {
    ...computed,
    practiceHistory: seed,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  dayName: string; // 'Mon', 'Tue'
  fullDateFormatted: string; // 'Sep 5'
  isToday: boolean;
  practiced: boolean;
}

/**
 * Generates the status for the past 7 days (including today) to display on streak bars.
 */
export function getPast7DaysStatus(practiceHistory: string[]): DayStatus[] {
  const set = new Set(practiceHistory);
  const days: DayStatus[] = [];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayOfWeek = d.getDay();

    days.push({
      date: dateStr,
      dayLabel: dayLetters[dayOfWeek],
      dayName: dayNamesShort[dayOfWeek],
      fullDateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: i === 0,
      practiced: set.has(dateStr),
    });
  }

  return days;
}
