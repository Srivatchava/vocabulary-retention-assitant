import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Wand2, Loader2, CheckCircle2, ArrowRight,
  Library, RotateCcw, Tag, AlertCircle, Pencil,
  Save, ChevronRight,
} from 'lucide-react';

// Step indicators
const STEPS = ['Enter Word', 'Review Meaning', 'Saved'];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-2">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : 'bg-slate-700 text-slate-500'
              }`}
            >
              {done ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block transition-colors duration-200 ${
                active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px flex-1 transition-all duration-500 ${done ? 'bg-emerald-500/50' : 'bg-slate-700'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const AddWord = () => {
  // Step 0 = enter word, 1 = review, 2 = saved
  const [step, setStep] = useState(0);

  // Step 0 state
  const [wordText, setWordText] = useState('');
  const [context, setContext] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  // Step 1 state — editable AI result
  const [editMeaning, setEditMeaning] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Step 2 state
  const [savedWord, setSavedWord] = useState(null);

  // ── Step 0 → Step 1: call /preview ──────────────────────────────────────
  const handlePreview = async (e) => {
    e.preventDefault();
    if (!wordText.trim()) return;
    setPreviewLoading(true);
    setPreviewError('');

    try {
      const res = await axios.post('http://localhost:5000/api/words/preview', {
        word_text: wordText.trim(),
        context: context.trim() || undefined,
      });
      setEditMeaning(res.data.meaning);
      setEditCategory(res.data.category);
      setStep(1);
    } catch (err) {
      setPreviewError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Step 1 → Step 2: call /confirm ──────────────────────────────────────
  const handleConfirm = async () => {
    if (!editMeaning.trim() || !editCategory.trim()) return;
    setConfirmLoading(true);
    setConfirmError('');

    try {
      const res = await axios.post('http://localhost:5000/api/words/confirm', {
        word_text: wordText.trim(),
        context: context.trim() || undefined,
        meaning: editMeaning.trim(),
        category: editCategory.trim(),
      });
      setSavedWord(res.data.word);
      setStep(2);
    } catch (err) {
      setConfirmError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // ── Reset for adding another word ────────────────────────────────────────
  const handleReset = () => {
    setStep(0);
    setWordText('');
    setContext('');
    setPreviewError('');
    setEditMeaning('');
    setEditCategory('');
    setConfirmError('');
    setSavedWord(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-2xl px-6 py-12 space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Add a Word</h1>
          <p className="mt-1 text-sm text-slate-400">
            Drop in any word — AI resolves its meaning, you confirm before it's saved.
          </p>
        </div>

        {/* Step bar */}
        <StepBar current={step} />

        {/* ── STEP 0: Enter word ─────────────────────────────────────────── */}
        {step === 0 && (
          <form onSubmit={handlePreview} className="space-y-5 animate-fade-slide-in">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="word-input">
                Word <span className="text-violet-400">*</span>
              </label>
              <input
                id="word-input"
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="e.g. ephemeral"
                disabled={previewLoading}
                autoFocus
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300" htmlFor="context-input">
                Context{' '}
                <span className="text-xs font-normal text-slate-500">
                  (optional — helps AI pick the right meaning)
                </span>
              </label>
              <textarea
                id="context-input"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder='e.g. "ephemeral storage in cloud computing disappears when the instance stops"'
                rows={3}
                disabled={previewLoading}
                className="w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              />
            </div>

            {previewError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-300">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {previewError}
              </div>
            )}

            <button
              type="submit"
              disabled={previewLoading || !wordText.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {previewLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Asking AI…
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Resolve with AI
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 1: Review & edit AI result ───────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-slide-in">

            {/* Word being reviewed */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">
              <span className="text-lg font-semibold text-white">{wordText}</span>
              {context && (
                <span className="text-xs italic text-slate-500 truncate">"{context}"</span>
              )}
            </div>

            {/* AI-resolved meaning — editable */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Pencil size={13} className="text-violet-400" />
                AI-resolved meaning
                <span className="text-xs font-normal text-slate-500">(edit if needed)</span>
              </label>
              <textarea
                value={editMeaning}
                onChange={(e) => setEditMeaning(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-violet-500/40 bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* AI-suggested category — editable */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Tag size={13} className="text-violet-400" />
                Category
                <span className="text-xs font-normal text-slate-500">(edit if needed)</span>
              </label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {confirmError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-300">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {confirmError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep(0); setPreviewError(''); setConfirmError(''); }}
                disabled={confirmLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-500 hover:text-white disabled:opacity-50"
              >
                <RotateCcw size={13} />
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmLoading || !editMeaning.trim() || !editCategory.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirmLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Confirm &amp; Save
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Success ─────────────────────────────────────────────── */}
        {step === 2 && savedWord && (
          <div className="space-y-5 animate-fade-slide-in">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">Word saved to your vocabulary!</span>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{savedWord.word_text}</h2>
                <span className="flex items-center gap-1.5 rounded-full bg-violet-900/40 px-3 py-1 text-xs font-medium text-violet-300">
                  <Tag size={11} />
                  {savedWord.category}
                </span>
              </div>

              <div className="rounded-xl bg-slate-800/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  Confirmed meaning
                </p>
                <p className="text-sm leading-relaxed text-slate-200">{savedWord.meaning}</p>
              </div>

              {savedWord.context && (
                <p className="text-xs italic text-slate-500">Context: "{savedWord.context}"</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-500 hover:text-white"
              >
                <RotateCcw size={14} />
                Add another word
              </button>
              <Link
                to="/words"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:bg-violet-500"
              >
                <Library size={14} />
                View my words
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddWord;
