import React, { useState } from 'react';
import { Situation, FillBlankQuestion, VocabItem } from '../types';
import { speakText } from '../utils/speech';
import { BookOpen, PenLine, Volume2, CheckCircle, HelpCircle, RotateCcw, ArrowRight, Award } from 'lucide-react';

interface Props {
  situation: Situation;
  onNextStage: () => void;
  onScoreEarned: (points: number) => void;
}

export const WriteVocabStage: React.FC<Props> = ({
  situation,
  onNextStage,
  onScoreEarned,
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [hasScored, setHasScored] = useState<boolean>(false);

  const handleInputChange = (id: number, val: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [id]: val,
    }));
    if (checked) setChecked(false);
  };

  const handleWordChipClick = (id: number, word: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [id]: word,
    }));
    if (checked) setChecked(false);
  };

  const calculateScore = () => {
    let correct = 0;
    situation.questions.forEach((q) => {
      const cleanUser = (userAnswers[q.id] || '').trim().toLowerCase();
      const cleanTarget = q.missingWord.trim().toLowerCase();
      if (cleanUser === cleanTarget) {
        correct += 1;
      }
    });
    return correct;
  };

  const handleCheckAnswers = () => {
    setChecked(true);
    const score = calculateScore();
    if (!hasScored && score > 0) {
      const earned = score * 5;
      onScoreEarned(earned);
      setHasScored(true);
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setChecked(false);
    setShowHints(false);
  };

  const scoreCount = calculateScore();
  const totalQuestions = situation.questions.length;
  const isPerfect = checked && scoreCount === totalQuestions;

  return (
    <div className="space-y-6">
      {/* 1. Important Vocabulary Section */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-950">
                📚 Important Vocabulary
              </h3>
              <p className="text-xs text-amber-800/80">
                Key terms for Situation {situation.id} with pronunciations &amp; meanings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {situation.vocabulary.map((v: VocabItem, i: number) => (
            <div
              key={i}
              className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-900 text-sm sm:text-base">
                      {v.word}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                      {v.partOfSpeech}
                    </span>
                  </div>

                  <button
                    onClick={() => speakText(v.word, { rate: 0.85 })}
                    className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                    title={`Pronounce "${v.word}"`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-medium">{v.meaning}</p>
                <p className="text-xs font-semibold text-amber-800 mt-1">
                  मराठी अर्थ: <span className="font-normal">{v.marathi || v.hindi}</span>
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                &ldquo;{v.example}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Write the Dialogue / Interactive Fill-in-the-Blank */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ✍️ Write the Dialogue &amp; Spelling Practice
              </h3>
              <p className="text-xs text-slate-500">
                Fill in the missing words from memory to master dialogue writing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHints(!showHints)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                showHints
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{showHints ? 'Hide Hints' : 'Show Word Bank'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Clear all inputs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Word bank tray (when hints enabled) */}
        {showHints && (
          <div className="mb-5 p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
            <span className="text-xs font-bold text-blue-900 block mb-2">
              💡 Word Bank (Click to insert):
            </span>
            <div className="flex flex-wrap gap-2">
              {situation.questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    // find first empty input or set current
                    const emptyQ =
                      situation.questions.find(
                        (item) => !userAnswers[item.id] || userAnswers[item.id].trim() === ''
                      ) || q;
                    handleWordChipClick(emptyQ.id, q.missingWord);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-300 shadow-2xs transition-colors"
                >
                  {q.missingWord}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-4">
          {situation.questions.map((q: FillBlankQuestion, idx: number) => {
            const currentVal = userAnswers[q.id] || '';
            const isCorrect =
              checked &&
              currentVal.trim().toLowerCase() === q.missingWord.trim().toLowerCase();
            const isWrong = checked && !isCorrect;

            // Split sentence around missing word
            const regex = new RegExp(`\\b${q.missingWord}\\b`, 'i');
            const match = q.fullSentence.match(regex);
            let beforeText = q.fullSentence;
            let afterText = '';

            if (match && match.index !== undefined) {
              beforeText = q.fullSentence.substring(0, match.index);
              afterText = q.fullSentence.substring(match.index + match[0].length);
            }

            return (
              <div
                key={q.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : isWrong
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500">
                  <span>Question {idx + 1}</span>
                  <span>•</span>
                  <span className={q.speaker === 'teacher' ? 'text-blue-700' : 'text-pink-700'}>
                    {q.speaker === 'teacher' ? '👩‍🏫 Teacher' : '👧 Riya'}
                  </span>
                </div>

                <div className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed flex flex-wrap items-center gap-1.5">
                  <span>{beforeText}</span>
                  <div className="inline-flex items-center relative">
                    <input
                      id={`blank-input-${q.id}`}
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder={showHints ? q.missingWord.slice(0, 2) + '...' : '_____'}
                      className={`px-2.5 py-1 rounded-lg text-sm font-bold border-2 transition-all outline-hidden w-28 sm:w-36 text-center ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : isWrong
                          ? 'border-rose-400 bg-rose-50 text-rose-900'
                          : 'border-blue-300 focus:border-blue-600 bg-white text-slate-900'
                      }`}
                    />
                    {isCorrect && (
                      <span className="ml-1 text-emerald-600 font-bold text-xs">✓</span>
                    )}
                    {isWrong && (
                      <span className="ml-1 text-rose-600 font-bold text-xs">✗</span>
                    )}
                  </div>
                  <span>{afterText}</span>
                </div>

                {/* Sentence Marathi meaning for translation support */}
                <p className="text-xs text-slate-500 mt-2">
                  <span className="text-amber-800 font-bold">मराठी अर्थ:</span> {q.marathi || q.hindi}
                </p>

                {/* Answer reveal when incorrect after check */}
                {isWrong && (
                  <p className="text-xs text-rose-700 font-semibold mt-1.5">
                    Correct word: <span className="underline font-bold">{q.missingWord}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Check answers and score banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            id="checkWriteBtn"
            onClick={handleCheckAnswers}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Check Answers</span>
          </button>

          {checked && (
            <div
              id="writeRes"
              className={`p-3 rounded-xl border flex items-center gap-3 text-sm font-semibold w-full sm:w-auto ${
                isPerfect
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <Award className={`w-5 h-5 ${isPerfect ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <span>
                  {isPerfect
                    ? '🌟 Perfect score! All dialogue words spelled correctly!'
                    : `Good effort! Score: ${scoreCount}/${totalQuestions} correct.`}
                </span>
                <span className="block text-xs font-normal text-slate-600">
                  {isPerfect ? '+25 vocabulary points added!' : 'Review the highlighted words and retry.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer next action */}
      <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-700 text-sm">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Ready to speak? In Stage 3, Teacher Anjali will talk and you will reply as Riya!
          </span>
        </div>

        <button
          id="proceedToStage3Btn"
          onClick={onNextStage}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>3. Role Play (You are Riya)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
