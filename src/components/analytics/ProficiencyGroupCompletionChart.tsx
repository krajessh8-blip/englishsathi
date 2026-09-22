import React, { useState, useMemo } from 'react';
import { Student, Situation } from '../../types';
import { LEVELS, mapGroupToLevel } from '../../data/levels';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Award,
  Sparkles,
  Clock,
  Calendar,
} from 'lucide-react';

interface Props {
  students: Student[];
  lessons: Situation[];
  title?: string;
  subtitle?: string;
  showComparisonToggle?: boolean;
  compact?: boolean;
  dateRange?: '7' | '30' | '90';
  onDateRangeChange?: (range: '7' | '30' | '90') => void;
}

type ViewMetric = 'completion' | 'dual_comparison' | 'volume';

// Distinct, vibrant colors and gradients for all 10 academic levels
export const LEVEL_COLORS: Record<
  number,
  {
    main: string;
    gradientEnd: string;
    light: string;
    border: string;
    bgBadge: string;
    text: string;
  }
> = {
  1: {
    main: '#3b82f6', // Blue - Level 1 (Class 5)
    gradientEnd: '#60a5fa',
    light: '#eff6ff',
    border: 'border-blue-300',
    bgBadge: 'bg-blue-100 text-blue-800',
    text: 'text-blue-700',
  },
  2: {
    main: '#0284c7', // Sky - Level 2 (Class 6)
    gradientEnd: '#38bdf8',
    light: '#f0f9ff',
    border: 'border-sky-300',
    bgBadge: 'bg-sky-100 text-sky-800',
    text: 'text-sky-700',
  },
  3: {
    main: '#10b981', // Emerald - Level 3 (Class 7)
    gradientEnd: '#34d399',
    light: '#ecfdf5',
    border: 'border-emerald-300',
    bgBadge: 'bg-emerald-100 text-emerald-800',
    text: 'text-emerald-700',
  },
  4: {
    main: '#059669', // Forest / Teal - Level 4 (Class 8)
    gradientEnd: '#10b981',
    light: '#f0fdf4',
    border: 'border-green-300',
    bgBadge: 'bg-green-100 text-green-800',
    text: 'text-green-700',
  },
  5: {
    main: '#eab308', // Yellow / Amber - Level 5 (Class 9)
    gradientEnd: '#facc15',
    light: '#fefce8',
    border: 'border-yellow-300',
    bgBadge: 'bg-yellow-100 text-yellow-800',
    text: 'text-yellow-700',
  },
  6: {
    main: '#f59e0b', // Amber / Orange - Level 6 (Class 10)
    gradientEnd: '#fbbf24',
    light: '#fffbeb',
    border: 'border-amber-300',
    bgBadge: 'bg-amber-100 text-amber-800',
    text: 'text-amber-700',
  },
  7: {
    main: '#ea580c', // Orange - Level 7 (Class 11)
    gradientEnd: '#fb923c',
    light: '#fff7ed',
    border: 'border-orange-300',
    bgBadge: 'bg-orange-100 text-orange-800',
    text: 'text-orange-700',
  },
  8: {
    main: '#e11d48', // Rose / Red - Level 8 (Class 12)
    gradientEnd: '#fb7185',
    light: '#fff1f2',
    border: 'border-rose-300',
    bgBadge: 'bg-rose-100 text-rose-800',
    text: 'text-rose-700',
  },
  9: {
    main: '#8b5cf6', // Violet - Level 9 (Fluent 1)
    gradientEnd: '#a78bfa',
    light: '#f5f3ff',
    border: 'border-purple-300',
    bgBadge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-700',
  },
  10: {
    main: '#7c3aed', // Purple / Indigo - Level 10 (Fluent 2)
    gradientEnd: '#c084fc',
    light: '#faf5ff',
    border: 'border-indigo-300',
    bgBadge: 'bg-indigo-100 text-indigo-800',
    text: 'text-indigo-700',
  },
};

export const ProficiencyGroupCompletionChart: React.FC<Props> = ({
  students,
  lessons,
  title = 'Student Progress by English Proficiency Level',
  subtitle = 'Comparing curriculum completion rates across all 10 progressive academic levels',
  showComparisonToggle = true,
  compact = false,
  dateRange,
  onDateRangeChange,
}) => {
  const [viewMetric, setViewMetric] = useState<ViewMetric>('completion');
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  // Standard quota benchmark situations per academic cohort
  const BENCHMARK_SITUATIONS = 40;

  // Calculate detailed progress stats for each of the 10 proficiency levels
  const chartData = useMemo(() => {
    return LEVELS.map((level) => {
      // Find students assigned to this level (or migrated from legacy group/class)
      const levelStudents = students.filter(
        (s) => (s.levelId ? s.levelId === level.id : mapGroupToLevel(s.groupId, s.grade) === level.id)
      );
      const studentCount = levelStudents.length;

      // Identify lessons belonging to this level (5 situations per level)
      const levelLessons = lessons.filter(
        (l) => l.level === level.id || Math.ceil(Number(l.id) / 5) === level.id
      );
      const levelLessonIds =
        levelLessons.length > 0
          ? levelLessons.map((l) => Number(l.id))
          : Array.from({ length: 5 }, (_, i) => (level.id - 1) * 5 + i + 1);

      // Average situations completed per student in this level (0 to 5)
      const avgCompletedPerStudent =
        studentCount > 0
          ? Number(
              (
                levelStudents.reduce((acc, student) => {
                  const completedInLevel = student.completedSituationIds.filter((id) =>
                    levelLessonIds.includes(Number(id))
                  ).length;
                  return acc + completedInLevel;
                }, 0) / studentCount
              ).toFixed(1)
            )
          : 0;

      // Completed situations count towards the 40 benchmark per level cohort
      // Formula: (avgCompletedPerStudent / 5) * 40 = completedSituations
      // E.g., for Avg 3/5: (3/5) * 40 = 24 / 40 done = 60%!
      const completedSituations = Math.min(
        BENCHMARK_SITUATIONS,
        Math.round((avgCompletedPerStudent / 5) * BENCHMARK_SITUATIONS)
      );

      // Completion rate % (capped at 100%)
      const completionRate = Math.min(
        100,
        Math.round((completedSituations / BENCHMARK_SITUATIONS) * 100)
      );

      // Average speech fluency score
      const avgFluency =
        studentCount > 0
          ? Math.round(
              levelStudents.reduce((acc, s) => acc + s.speechFluencyScore, 0) / studentCount
            )
          : 75;

      // Average vocabulary mastery
      const avgVocab =
        studentCount > 0
          ? Math.round(
              levelStudents.reduce((acc, s) => acc + s.vocabMasteryScore, 0) / studentCount
            )
          : 85;

      const colors = LEVEL_COLORS[level.id] || LEVEL_COLORS[1];

      return {
        id: level.id,
        shortName: `L${level.id}`,
        name: level.name,
        displayName: `L${level.id}`,
        fullName: `${level.name} - ${level.subtitle}`,
        subtitle: level.subtitle,
        class: level.class,
        studentCount,
        completedSituations,
        totalPossibleSituations: BENCHMARK_SITUATIONS,
        completionRate,
        avgCompletedPerStudent,
        avgFluency,
        avgVocab,
        color: colors.main,
        gradientEnd: colors.gradientEnd,
        light: colors.light,
        border: colors.border,
      };
    });
  }, [students, lessons]);

  // Overall summary indicators across all 10 levels
  const averageCompletionAcrossLevels = Math.round(
    chartData.reduce((acc, d) => acc + d.completionRate, 0) / (chartData.length || 1)
  );

  const bestLevel = useMemo(() => {
    return [...chartData].sort((a, b) => b.completionRate - a.completionRate)[0];
  }, [chartData]);

  const targetBenchmark = 75; // Academic goal benchmark

  // Custom Chart Tooltip displaying comprehensive level details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs w-64 animate-fade-in z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div>
              <span className="font-black text-slate-900 text-sm">{data.fullName}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {data.class} • {data.studentCount} Students
              </p>
            </div>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: data.color }}
            >
              L{data.id}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Completion Rate:</span>
                <span className="text-slate-900 font-black text-sm">{data.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${data.completionRate}%`, backgroundColor: data.color }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100 text-[11px]">
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Completed:</span>
                <span className="font-bold text-slate-800">
                  {data.completedSituations} / {data.totalPossibleSituations} done
                </span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Avg / Student:</span>
                <span className="font-bold text-slate-800">
                  {data.avgCompletedPerStudent} / 5
                </span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Avg Fluency:</span>
                <span className="font-bold text-blue-700">{data.avgFluency}%</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Cohort Size:</span>
                <span className="font-bold text-slate-800">{data.studentCount} Students</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      {/* Header section with titles, badge and metric toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {title}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              10 Levels (L1-L10)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Controls: Date-Range Dropdown Selector & Metric Tabs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          {onDateRangeChange && (
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <label htmlFor="proficiency-chart-date-range-select" className="text-[11px] font-bold text-slate-600">
                Window:
              </label>
              <select
                id="proficiency-chart-date-range-select"
                value={dateRange || '30'}
                onChange={(e) => onDateRangeChange(e.target.value as '7' | '30' | '90')}
                className="text-xs font-bold bg-white text-slate-800 rounded-lg px-2 py-0.5 border border-slate-300 focus:outline-hidden focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          )}

          {/* Metric Selector Tabs */}
          {showComparisonToggle && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMetric('completion')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMetric === 'completion'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completion %
              </button>
              <button
                onClick={() => setViewMetric('dual_comparison')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMetric === 'dual_comparison'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completion vs. Fluency
              </button>
              <button
                onClick={() => setViewMetric('volume')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMetric === 'volume'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Avg Lessons Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main 10-Level Recharts Visual Display */}
      <div className={`${compact ? 'h-64' : 'h-80'} w-full relative`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 16, left: -16, bottom: 8 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setHoveredLevel(state.activePayload[0].payload.id);
              }
            }}
            onMouseLeave={() => setHoveredLevel(null)}
          >
            {/* SVG Gradients for all 10 Levels */}
            <defs>
              {chartData.map((d) => (
                <linearGradient
                  key={`grad-level-${d.id}`}
                  id={`grad-level-${d.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={d.gradientEnd} stopOpacity={0.75} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayName"
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={viewMetric === 'volume' ? [0, 5] : [0, 100]}
              unit={viewMetric === 'volume' ? '' : '%'}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* School 75% Academic Target Reference Line */}
            {viewMetric !== 'volume' && (
              <ReferenceLine
                y={targetBenchmark}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: `Target: ${targetBenchmark}%`,
                  position: 'insideTopRight',
                  fill: '#64748b',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Render bars depending on active view metric */}
            {viewMetric === 'completion' && (
              <Bar
                dataKey="completionRate"
                name="Curriculum Completion Rate"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-completion-${entry.id}`}
                    fill={`url(#grad-level-${entry.id})`}
                    opacity={hoveredLevel === null || hoveredLevel === entry.id ? 1 : 0.35}
                  />
                ))}
              </Bar>
            )}

            {viewMetric === 'dual_comparison' && (
              <>
                <Bar
                  dataKey="completionRate"
                  name="Completion Rate (%)"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="avgFluency"
                  name="Speech Fluency Index (%)"
                  fill="#10b981"
                  radius={[5, 5, 0, 0]}
                  animationDuration={800}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }}
                  iconType="circle"
                />
              </>
            )}

            {viewMetric === 'volume' && (
              <Bar
                dataKey="avgCompletedPerStudent"
                name="Avg Lessons Completed (Max 5)"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-vol-${entry.id}`}
                    fill={`url(#grad-level-${entry.id})`}
                    opacity={hoveredLevel === null || hoveredLevel === entry.id ? 1 : 0.35}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 10 Level Benchmark Summary Cards Grid (2 rows of 5 on desktop, scroll on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 overflow-x-auto">
        {chartData.map((level) => {
          const isTop = bestLevel?.id === level.id;
          const isSelected = hoveredLevel === level.id;

          return (
            <div
              key={level.id}
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-blue-500 shadow-md bg-white'
                  : 'bg-slate-50/80 hover:bg-white hover:shadow-xs'
              } border-slate-200`}
            >
              {/* Header: Level X (Class Y) - Subtitle | Z stds */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: level.color }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {level.name} ({level.class})
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block truncate">
                      {level.subtitle}
                    </span>
                  </div>
                </div>

                {isTop ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5 text-amber-600" />
                    <span>Leader</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 shrink-0">
                    {level.studentCount} stds
                  </span>
                )}
              </div>

              {/* Completion % and x / 40 done */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xl sm:text-2xl font-black" style={{ color: level.color }}>
                  {level.completionRate}%
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  {level.completedSituations} / {level.totalPossibleSituations} done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${level.completionRate}%`, backgroundColor: level.color }}
                />
              </div>

              {/* Fluency % & Avg / 5 */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                <span>
                  Fluency: <strong className="text-slate-800">{level.avgFluency}%</strong>
                </span>
                <span>
                  Avg: <strong className="text-slate-800">{level.completedSituations}/40</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Progress Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-linear-to-r from-blue-50/60 via-slate-50 to-indigo-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Comparative Progress Summary:</strong> Overall cross-level completion sits at{' '}
            <strong className="text-blue-700 font-black">{averageCompletionAcrossLevels}%</strong>.{' '}
            Top Level:{' '}
            <strong className="text-slate-900 font-black">
              Level {bestLevel?.id} ({bestLevel?.subtitle}) at {bestLevel?.completionRate}% completion
            </strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Target: &gt;75% Across All 10 Levels</span>
        </div>
      </div>
    </div>
  );
};
