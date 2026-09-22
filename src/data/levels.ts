import { Level } from '../types';

export const LEVELS: Level[] = [
  { id: 1, name: 'Level 1', subtitle: 'Pre-foundation', class: 'KG–2nd', situations: 40, color: 'blue' },
  { id: 2, name: 'Level 2', subtitle: 'Foundation', class: '3rd–4th', situations: 40, color: 'blue' },
  { id: 3, name: 'Level 3', subtitle: 'Elementary', class: '5th–6th', situations: 40, color: 'green' },
  { id: 4, name: 'Level 4', subtitle: 'Pre-intermediate', class: '7th', situations: 40, color: 'green' },
  { id: 5, name: 'Level 5', subtitle: 'Intermediate', class: '8th', situations: 40, color: 'yellow' },
  { id: 6, name: 'Level 6', subtitle: 'Upper-intermediate', class: '9th', situations: 40, color: 'yellow' },
  { id: 7, name: 'Level 7', subtitle: 'Board-exam + Speaking Grammar', class: '10th', situations: 40, color: 'orange' },
  { id: 8, name: 'Level 8', subtitle: 'Higher-secondary', class: '11th', situations: 40, color: 'orange' },
  { id: 9, name: 'Level 9', subtitle: 'Advanced + Academic', class: '12th', situations: 40, color: 'red' },
  { id: 10, name: 'Level 10', subtitle: 'Professional + Mastery', class: 'Graduation', situations: 40, color: 'purple' },
];

/**
 * Maps standard/grade names or old group ID ('A' | 'B' | 'C' | 'D') to official Level (1-10)
 * Level 1: KG–2nd | Pre-foundation
 * Level 2: 3rd–4th | Foundation
 * Level 3: 5th–6th | Elementary
 * Level 4: 7th | Pre-intermediate
 * Level 5: 8th | Intermediate
 * Level 6: 9th | Upper-intermediate
 * Level 7: 10th | Board-exam + Speaking Grammar
 * Level 8: 11th | Higher-secondary
 * Level 9: 12th | Advanced + Academic
 * Level 10: Graduation | Professional + Mastery
 */
export function mapGroupToLevel(group?: string | null, className?: string | null): number {
  if (className) {
    const lower = className.toLowerCase();
    if (lower.includes('kg') || lower.includes('nursery') || lower.includes('1st') || lower.includes('2nd')) return 1;
    if (lower.includes('3rd') || lower.includes('4th')) return 2;
    if (lower.includes('5th') || lower.includes('6th')) return 3;
    if (lower.includes('7th')) return 4;
    if (lower.includes('8th')) return 5;
    if (lower.includes('9th')) return 6;
    if (lower.includes('10th')) return 7;
    if (lower.includes('11th')) return 8;
    if (lower.includes('12th')) return 9;
    if (lower.includes('grad') || lower.includes('college') || lower.includes('degree') || lower.includes('master')) return 10;

    const match = className.match(/\d+/);
    if (match) {
      const clsNum = parseInt(match[0], 10);
      if (clsNum <= 2) return 1;
      if (clsNum <= 4) return 2;
      if (clsNum <= 6) return 3;
      if (clsNum === 7) return 4;
      if (clsNum === 8) return 5;
      if (clsNum === 9) return 6;
      if (clsNum === 10) return 7;
      if (clsNum === 11) return 8;
      if (clsNum === 12) return 9;
      if (clsNum > 12) return 10;
    }
  }

  switch (group) {
    case 'A':
      return 1;
    case 'B':
      return 3;
    case 'C':
      return 5;
    case 'D':
      return 7;
    default:
      return 1;
  }
}

/**
 * Helper to determine level for a situation ID (1..50)
 * 1-5 -> Level 1, 6-10 -> Level 2, etc.
 */
export function getSituationLevel(situationId: number): number {
  const lvl = Math.ceil(situationId / 5);
  return Math.min(Math.max(lvl, 1), 10);
}

/**
 * Maps level ID (1-10) to legacy GroupId ('A' | 'B' | 'C' | 'D')
 */
export function mapLevelToGroup(levelId: number): 'A' | 'B' | 'C' | 'D' {
  if (levelId <= 2) return 'A';
  if (levelId <= 4) return 'B';
  if (levelId <= 6) return 'C';
  return 'D';
}
