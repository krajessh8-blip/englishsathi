import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Search,
  Filter,
  Volume2,
  Sparkles,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GrammarTopic, Level } from '../../types';
import { LEVELS } from '../../data/levels';
import {
  getStoredGrammarTopics,
  saveGrammarTopics,
  upsertGrammarTopic,
  deleteGrammarTopic,
  toggleTopicStatus,
} from '../../data/grammar/grammarManager';
import { GrammarTopicModal } from './GrammarTopicModal';

export const GrammarAdminManager: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTopic, setEditingTopic] = useState<GrammarTopic | null>(null);
  const [previewTopic, setPreviewTopic] = useState<GrammarTopic | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load topics
  const allTopics = useMemo(() => {
    return getStoredGrammarTopics();
  }, [refreshTrigger]);

  const levelTopics = useMemo(() => {
    return allTopics
      .filter((t) => t.level_id === selectedLevel)
      .sort((a, b) => a.topic_number - b.topic_number);
  }, [allTopics, selectedLevel]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return levelTopics;
    const q = searchQuery.toLowerCase();
    return levelTopics.filter(
      (t) =>
        t.title_en.toLowerCase().includes(q) ||
        t.title_mr?.toLowerCase().includes(q) ||
        t.title_hi?.toLowerCase().includes(q)
    );
  }, [levelTopics, searchQuery]);

  // Form handlers
  const handleToggleStatus = (topicId: string) => {
    toggleTopicStatus(topicId);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDelete = (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this grammar topic?')) {
      deleteGrammarTopic(topicId);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleAddNewTopic = () => {
    const nextNum = (levelTopics[levelTopics.length - 1]?.topic_number || 0) + 1;
    const newTopic: GrammarTopic = {
      id: `g${selectedLevel}-${nextNum}`,
      level_id: selectedLevel,
      topic_number: nextNum,
      title_en: `New Topic ${nextNum}`,
      title_mr: `नवीन व्याकरण घटक ${nextNum}`,
      title_hi: `नया व्याकरण विषय ${nextNum}`,
      explanation_en: `Explain the concept of this topic clearly with rules and patterns.`,
      explanation_mr: `या घटकाची संकल्पना सोप्या मराठीत स्पष्ट करा.`,
      explanation_hi: `इस विषय की अवधारणा स्पष्ट करें।`,
      examples: [
        { type: 'positive', sentence: 'Example sentence here.', marathi: 'येथे उदाहरण वाक्य.', hindi: 'उदाहरण वाक्य।' },
      ],
      speaking_practice: {
        prompt: 'Speak a clear sentence using this grammar rule.',
        marathiPrompt: 'हा नियम वापरून एक वाक्य बोला.',
        suggestedAnswer: 'I practice speaking English daily.',
        targetPattern: 'I [verb]...',
        hints: ['practice', 'English', 'daily'],
      },
      writing_practice: [
        {
          id: 1,
          type: 'fill_blank',
          question: 'Complete the sentence with correct form:',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          explanation: 'Standard grammatical rule explanation.',
        },
      ],
      quiz: [
        {
          id: 1,
          question: 'What is the correct grammar rule for this topic?',
          options: ['Correct Rule', 'Incorrect Rule 1', 'Incorrect Rule 2', 'Incorrect Rule 3'],
          correctIndex: 0,
          explanation: 'Explanation for correct answer.',
        },
      ],
      status: 'published',
      created_at: new Date().toISOString(),
    };
    setEditingTopic(newTopic);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    upsertGrammarTopic(editingTopic);
    setEditingTopic(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
              📖
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Super Admin Management
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Grammar Curriculum Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage 10-Level Grammar topics, interactive exercises, speaking prompts, and AI criteria.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewTopic}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Level Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin bg-white p-3 rounded-2xl border border-slate-200">
        {LEVELS.map((lvl) => {
          const count = allTopics.filter((t) => t.level_id === lvl.id).length;
          const isSelected = lvl.id === selectedLevel;

          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>L{lvl.id}: {lvl.subtitle}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search level topics..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Showing {filteredTopics.length} topics in Level {selectedLevel}
        </span>
      </div>

      {/* Topics Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-xs">
                    #{topic.topic_number}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{topic.title_en}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      topic.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  मराठी: <span className="text-slate-700 font-medium">{topic.title_mr}</span>
                  {topic.title_hi && (
                    <span> • हिंदी: <span className="text-slate-700 font-medium">{topic.title_hi}</span></span>
                  )}
                </p>

                <p className="text-xs text-slate-600 line-clamp-1">{topic.explanation_en}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewTopic(topic)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                  title="Preview student experience"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTopic(topic)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                  title="Edit topic"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(topic.id)}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    topic.status === 'published'
                      ? 'text-emerald-700 hover:bg-emerald-50'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                  title={topic.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {topic.status === 'published' ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(topic.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                  title="Delete topic"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Topic #{editingTopic.topic_number} (Level {editingTopic.level_id})
              </h3>
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingTopic.title_en}
                    onChange={(e) => setEditingTopic({ ...editingTopic, title_en: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title (Marathi)</label>
                  <input
                    type="text"
                    required
                    value={editingTopic.title_mr}
                    onChange={(e) => setEditingTopic({ ...editingTopic, title_mr: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation (English)</label>
                <textarea
                  rows={3}
                  required
                  value={editingTopic.explanation_en}
                  onChange={(e) => setEditingTopic({ ...editingTopic, explanation_en: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation (Marathi)</label>
                <textarea
                  rows={2}
                  value={editingTopic.explanation_mr}
                  onChange={(e) => setEditingTopic({ ...editingTopic, explanation_mr: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Speaking Practice Prompt</label>
                <input
                  type="text"
                  value={editingTopic.speaking_practice.prompt}
                  onChange={(e) =>
                    setEditingTopic({
                      ...editingTopic,
                      speaking_practice: { ...editingTopic.speaking_practice, prompt: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Suggested Speaking Answer (Ideal Sentence)</label>
                <input
                  type="text"
                  value={editingTopic.speaking_practice.suggestedAnswer}
                  onChange={(e) =>
                    setEditingTopic({
                      ...editingTopic,
                      speaking_practice: { ...editingTopic.speaking_practice, suggestedAnswer: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-200 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTopic && (
        <GrammarTopicModal
          topic={previewTopic}
          studentId="admin-preview"
          onClose={() => setPreviewTopic(null)}
        />
      )}
    </div>
  );
};
