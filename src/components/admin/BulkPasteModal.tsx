import React, { useState, useEffect } from 'react';
import { Situation } from '../../types';
import { validateBulkPastedData, ValidationResult, generateSampleJsonTemplate } from '../../data/lessonsManager';
import { LEVELS } from '../../data/levels';
import {
  X,
  ClipboardPaste,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  FileCode,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  levelName?: string;
  onSaveValidatedSituations: (level: number, situations: Situation[]) => void;
}

export const BulkPasteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  level,
  levelName,
  onSaveValidatedSituations,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(level);
  const [pasteText, setPasteText] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Synchronize when incoming level or open state changes
  useEffect(() => {
    setSelectedLevel(level);
    setValidationResult(null);
    setHasValidated(false);
    setSaveSuccessMsg(null);
  }, [level, isOpen]);

  if (!isOpen) return null;

  const currentLevelObj = LEVELS.find((l) => l.id === selectedLevel) || LEVELS[0];
  const activeLevelName = currentLevelObj.subtitle || `Level ${selectedLevel}`;

  const handleValidate = () => {
    const result = validateBulkPastedData(selectedLevel, pasteText);
    setValidationResult(result);
    setHasValidated(true);
    setSaveSuccessMsg(null);
  };

  const handleTextChange = (text: string) => {
    setPasteText(text);
    // Reset validation when text changes to require re-validation
    if (hasValidated) {
      setHasValidated(false);
      setValidationResult(null);
    }
    setSaveSuccessMsg(null);
  };

  const handleClear = () => {
    setPasteText('');
    setValidationResult(null);
    setHasValidated(false);
    setSaveSuccessMsg(null);
  };

  const handleInsertSample = () => {
    const sample = generateSampleJsonTemplate(selectedLevel, 3);
    setPasteText(sample);
    setHasValidated(false);
    setValidationResult(null);
    setSaveSuccessMsg(null);
  };

  const handleInsertFull35Template = () => {
    // Generates skeleton for all 35 situations (6 to 40)
    const full35 = Array.from({ length: 35 }, (_, i) => {
      const sitNo = 6 + i;
      return {
        situation_no: sitNo,
        title: `Situation ${sitNo} Topic`,
        char1_role: 'teacher',
        char1_name: 'Teacher Anjali',
        char1_image: 'teacher',
        char2_role: 'student',
        char2_name: 'Riya',
        char2_image: 'riya',
        status: 'draft',
        lines: Array.from({ length: 20 }, () => ({})),
      };
    });
    setPasteText(JSON.stringify(full35, null, 2));
    setHasValidated(false);
    setValidationResult(null);
    setSaveSuccessMsg(null);
  };

  const handleSave = () => {
    // If not validated yet, run the validation check
    let currentResult = validationResult;
    if (!hasValidated || !currentResult) {
      currentResult = validateBulkPastedData(selectedLevel, pasteText);
      setValidationResult(currentResult);
      setHasValidated(true);
    }

    // Ensure only situation numbers 6-40 are being updated (rejecting 1-5)
    if (!currentResult || !currentResult.valid || currentResult.parsedSituations.length === 0) {
      return;
    }

    // Update lessons state via onSaveValidatedSituations
    onSaveValidatedSituations(selectedLevel, currentResult.parsedSituations);
    setSaveSuccessMsg(`Successfully saved ${currentResult.parsedSituations.length} situations for Level ${selectedLevel}! Lessons state updated.`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const isValid = hasValidated && validationResult?.valid && (validationResult?.parsedSituations.length ?? 0) > 0;
  const sitCount = validationResult?.parsedSituations.length || 0;

  return (
    <div
      id="bulkPasteModalBackdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="bulkPasteModalContent"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Bulk Paste Conversations
                </h3>
                {/* Level Selector in Modal Header to easily switch between levels */}
                <select
                  id="bulkPasteLevelSelect"
                  value={selectedLevel}
                  onChange={(e) => {
                    const newLvl = Number(e.target.value);
                    setSelectedLevel(newLvl);
                    if (hasValidated) {
                      setHasValidated(false);
                      setValidationResult(null);
                    }
                  }}
                  className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-blue-200 border border-blue-400/30 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      Level {lvl.id}: {lvl.name} ({lvl.subtitle})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {activeLevelName}
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Bulk upload and update Situations 6 through 40 for Level {selectedLevel}. Situations 1–5 are locked.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection Alert Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Hard Protection Enforced:</strong> Existing Situations 1–5 are published and permanently locked. Any attempt to modify Situations 1–5 will be rejected.
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInsertSample}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-100/70 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Paste 3 Sample Slots
            </button>
            <button
              onClick={handleInsertFull35Template}
              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Fill All 35 Slots
            </button>
          </div>
        </div>

        {/* Body Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>JSON Data for Situations 6 to 40</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {pasteText ? `${pasteText.length} characters` : 'Empty'}
              </span>
            </div>

            <textarea
              id="bulkPasteTextarea"
              rows={12}
              value={pasteText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Paste JSON array of situations 6 through 40 here. Example:\n[\n  {\n    "situation_no": 6,\n    "title": "Meeting New Friends at School",\n    "char1_role": "teacher",\n    "char1_name": "Teacher Anjali",\n    "char2_role": "student",\n    "char2_name": "Riya",\n    "lines": [ ... 20 line objects ... ]\n  }\n]`}
              className="w-full font-mono text-xs p-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Validation Status / Messages */}
          {hasValidated && validationResult && (
            <div className="animate-in fade-in duration-150">
              {validationResult.valid ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                      ✓ Validation Passed — Ready to Save
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Validated {validationResult.parsedSituations.length} situation(s) for Level {selectedLevel} (Situations #{validationResult.summary.situationNumbers.join(', #')}).
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                      Protected Situations 1–5 remain intact and untouched. Click &quot;Save All 35&quot; below to apply.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-black text-rose-950">
                      Validation Failed ({validationResult.errors.length} error{validationResult.errors.length > 1 ? 's' : ''})
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-800 pl-6 list-disc">
                    {validationResult.errors.map((err, i) => (
                      <li key={i} className="leading-snug">{err}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-rose-700 mt-3 font-semibold">
                    Please correct the errors above and click &quot;Validate&quot; again. Situations 1–5 cannot be updated via bulk paste.
                  </p>
                </div>
              )}
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-400 text-emerald-950 flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleClear}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear</span>
            </button>
            <button
              id="bulkCancelBtn"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="bulkValidateBtn"
              onClick={handleValidate}
              disabled={!pasteText.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Validate JSON</span>
            </button>

            <button
              id="bulkSaveBtn"
              onClick={handleSave}
              disabled={!pasteText.trim() || (hasValidated && !validationResult?.valid)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save All 35</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
