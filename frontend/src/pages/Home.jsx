import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Flame, Brain, Trophy, Sparkles, Loader2,
  RefreshCw, PlusCircle, BookOpen, ChevronRight, CheckCircle2, AlertCircle, X, BarChart3, History,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconClass, glowClass }) => (
  <div className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 text-center">
    <div className={`absolute inset-0 opacity-[0.04] ${glowClass}`} />
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700/60`}>
      <Icon size={20} className={iconClass} />
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-xs font-medium text-slate-400">{label}</p>
  </div>
);

// ── Interactive Paragraph card ───────────────────────────────────────────────
const ParagraphCard = ({ index, paragraph, words, revealedWords, ratings, onWordClick, onRate }) => {
  const wordChips = words || [];
  
  // Build highlighted paragraph with clickable words
  function buildParagraph() {
    if (!wordChips.length) return [paragraph];

    const escaped = wordChips.map((w) =>
      w.word_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(paragraph)) !== null) {
      if (match.index > lastIndex) {
        parts.push(paragraph.slice(lastIndex, match.index));
      }
      
      const matchedWord = match[0];
      const foundWord = wordChips.find(
        (w) => w.word_text.toLowerCase() === matchedWord.toLowerCase()
      );
      
      if (foundWord) {
        const isRevealed = revealedWords[foundWord.id];
        const rating = ratings[foundWord.id];
        
        parts.push(
          <span key={`${foundWord.id}-${match.index}`} className="relative group inline">
            <button
              onClick={() => onWordClick(foundWord.id)}
              className={`font-semibold underline underline-offset-3 transition-all duration-200 cursor-pointer rounded px-0.5 ${
                isRevealed
                  ? 'text-emerald-300 decoration-emerald-500/50'
                  : 'text-violet-300 decoration-violet-500/50 hover:text-violet-200 hover:decoration-violet-400'
              }`}
            >
              {matchedWord}
            </button>
            
            {/* Tooltip/popup on hover or click */}
            {isRevealed && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-950 border border-slate-700 rounded-lg p-3 shadow-lg z-50 pointer-events-auto whitespace-normal max-w-xs">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs text-slate-300">{foundWord.meaning}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWordClick(foundWord.id);
                    }}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                {/* Rating buttons */}
                {!rating && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRate(foundWord.id, 'got_it');
                      }}
                      className="flex-1 text-xs px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded border border-emerald-500/30 transition-colors"
                    >
                      Got it!
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRate(foundWord.id, 'still_learning');
                      }}
                      className="flex-1 text-xs px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded border border-amber-500/30 transition-colors"
                    >
                      Still learning
                    </button>
                  </div>
                )}
                
                {rating && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    {rating === 'got_it' ? 'Marked as known' : 'Marked for review'}
                  </div>
                )}
              </div>
            )}
          </span>
        );
      } else {
        parts.push(matchedWord);
      }
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < paragraph.length) {
      parts.push(paragraph.slice(lastIndex));
    }

    return parts;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Paragraph {index + 1}
        </span>
        {wordChips.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {wordChips.map((w) => {
              const rating = ratings[w.id];
              return (
                <span
                  key={w.id}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                    rating
                      ? 'bg-emerald-900/30 text-emerald-300'
                      : 'bg-violet-900/30 text-violet-300'
                  }`}
                >
                  {w.word_text}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Paragraph text with highlighted words */}
      <p className="text-sm leading-7 text-slate-300">{buildParagraph()}</p>
      
      <div className="text-xs text-slate-500 pt-2">
        Click highlighted words to reveal meanings
      </div>
    </div>
  );
};

// ── Main Home page ───────────────────────────────────────────────────────────
const Home = () => {
  const { user, setUser ,token} = useContext(AuthContext);

  // console.log(token);
  

  const [stats, setStats] = useState({ total: 0, learning: 0, mastered: 0 });
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Interactive practice state
  const [revealedWords, setRevealedWords] = useState({});  // { wordId: true }
  const [ratings, setRatings] = useState({});              // { wordId: 'got_it' | 'still_learning' }
  const [ratingLoading, setRatingLoading] = useState({});  // { wordId: true }
  const [completingSession, setCompletingSession] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [completionSuccess, setCompletionSuccess] = useState(false);

  // Fetch stats and today's session in parallel
  const loadData = useCallback(async () => {
    try {
      const [wordsRes, sessionRes] = await Promise.all([
        axios.get('http://localhost:5000/api/words'),
        axios.get('http://localhost:5000/api/session/today'),
      ]);

      const words = wordsRes.data.words || [];
      setStats({
        total: words.length,
        learning: words.filter(
          (w) => w.familiarity_level === 'new' || w.familiarity_level === 'learning'
        ).length,
        mastered: words.filter((w) => w.familiarity_level === 'mastered').length,
      });
      setStatsLoaded(true);

      setSession(sessionRes.data.session);
      setSessionLoaded(true);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setStatsLoaded(true);
      setSessionLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError('');
    try {
      const res = await axios.post('http://localhost:5000/api/session/generate');
      setSession(res.data.session);
    } catch (err) {
      setGenError(
        err.response?.data?.error || 'Failed to generate session. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // Handle clicking on a word to reveal its meaning
  const handleWordClick = (wordId) => {
    setRevealedWords((prev) => ({
      ...prev,
      [wordId]: !prev[wordId],
    }));
  };

  // Handle rating a word
  const handleRate = async (wordId, rating) => {
    setRatingLoading((prev) => ({ ...prev, [wordId]: true }));
    try {
      await axios.patch(`http://localhost:5000/api/words/${wordId}/rate`, {
        rating,
      });
      setRatings((prev) => ({ ...prev, [wordId]: rating }));
    } catch (err) {
      console.error('Failed to rate word:', err);
    } finally {
      setRatingLoading((prev) => ({ ...prev, [wordId]: false }));
    }
  };

  // Check if all words in session have been rated
  const getAllSessionWords = () => {
    if (!session || !session.words_included) return [];
    return session.words_included.flat();
  };

  const allWords = getAllSessionWords();

  // Handle completing the session
  const handleCompleteSession = async () => {
    if (!session) return;
    setCompletingSession(true);
    setCompletionError('');
    setCompletionSuccess(false);

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/session/${session.id}/complete`
      );
      
      // Update session status
      setSession(res.data.session);
      

      console.log(res.data.streak_incremented);
      
      // Update user's streak if it was incremented
      if (res.data.streak_incremented && user) {
        setUser({
          ...user,
          streak_count: (user.streak_count || 0) + 1,
        });
      }
      
      setCompletionSuccess(true);
    } catch (err) {
      setCompletionError(
        err.response?.data?.error || 'Failed to complete session. Please try again.'
      );
    } finally {
      setCompletingSession(false);
    }
  };

  const isLoading = !statsLoaded || !sessionLoaded;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">

        {/* Welcome */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Practice
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {user?.email} · Today's vocabulary session
            </p>
          </div>
          <Link
            to="/add"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-white"
          >
            <PlusCircle size={13} />
            Add word
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={Flame}
            label="Day Streak"
            value={`${user?.streak_count ?? 0} 🔥`}
            iconClass="text-orange-400"
            glowClass="bg-orange-500"
          />
          <StatCard
            icon={Brain}
            label="Words Learning"
            value={statsLoaded ? stats.learning : '—'}
            iconClass="text-blue-400"
            glowClass="bg-blue-500"
          />
          <StatCard
            icon={Trophy}
            label="Words Mastered"
            value={statsLoaded ? stats.mastered : '—'}
            iconClass="text-emerald-400"
            glowClass="bg-emerald-500"
          />
        </div>

        {/* Quick links to History and Stats */}
        <div className="flex gap-3 justify-center">
          <Link
            to="/history"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-sm font-medium"
          >
            <History size={16} />
            View History
          </Link>
          <Link
            to="/stats"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-sm font-medium"
          >
            <BarChart3 size={16} />
            View Stats
          </Link>
        </div>

        {/* Session area */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {!isLoading && !session && (
          // ── No session yet ────────────────────────────────────────────────
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-600/60 bg-slate-800/30 p-12 text-center">
            <div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-gradient-to-br from-violet-900/20 via-transparent to-indigo-900/20" />
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
                <Sparkles size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  No practice session yet
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                  {stats.total === 0
                    ? 'Add some words to your vocabulary first, then generate your first session.'
                    : 'Generate todays AI-written practice paragraphs using your saved words.'}
                </p>
              </div>

              {genError && (
                <p className="text-sm text-red-400">{genError}</p>
              )}

              {stats.total === 0 ? (
                <Link
                  to="/add"
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-500"
                >
                  <PlusCircle size={15} />
                  Add your first word
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Today's Practice
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && session && (
          // ── Session exists — show paragraphs ─────────────────────────────
          <div className="space-y-5 animate-fade-slide-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Today's Practice Session
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {session.session_date} · Click words to reveal meanings
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${session.completion_status
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                  }`}
              >
                {session.completion_status ? '✓ Completed' : 'In progress'}
              </span>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4">
              {session.paragraphs.map((para, i) => (
                <ParagraphCard
                  key={i}
                  index={i}
                  paragraph={para}
                  words={session.words_included?.[i] || []}
                  revealedWords={revealedWords}
                  ratings={ratings}
                  onWordClick={handleWordClick}
                  onRate={handleRate}
                />
              ))}
            </div>

            {/* Completion section */}
            {!session.completion_status && (
              <div className="space-y-4 rounded-xl border border-slate-700/40 bg-slate-800/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Practice Progress
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Click words to reveal meanings and rate them — optional but helpful for spaced repetition
                    </p>
                  </div>
                  <span className="text-xs font-bold text-violet-400">
                    {Object.keys(ratings).length} / {allWords.length} rated
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                    style={{
                      width: `${allWords.length > 0 ? (Object.keys(ratings).length / allWords.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                {completionError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    {completionError}
                  </div>
                )}

                {completionSuccess && (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    Session completed! Keep up the streak! 🔥
                  </div>
                )}

                <button
                  onClick={handleCompleteSession}
                  disabled={     completingSession || session.completion_status}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completingSession ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Completing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Complete Today's Session
                    </>
                  )}
                </button>
              </div>
            )}

            {session.completion_status && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/10 p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Session Completed!</h3>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Great work! You're building strong vocabulary habits. Keep it up tomorrow! 🎯
                </p>
                <Link
                  to="/words"
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500"
                >
                  View All Words
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
