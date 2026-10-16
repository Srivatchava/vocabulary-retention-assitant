import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, BookOpen, Loader2 } from 'lucide-react';
import WordCard from '../components/WordCard';

const FAMILIARITY_TABS = ['All', 'New', 'Learning', 'Familiar', 'Mastered'];

import api from '../services/api.js'

const MyWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFamiliarity, setSelectedFamiliarity] = useState('All');

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await api.get('/api/words');
        setWords(res.data.words || []);
      } catch (err) {
        setError(`Failed to load words. ${err.response?.data?.error}`);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  // Derive category list from words
  const categories = useMemo(() => {
    const cats = [...new Set(words.map((w) => w.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [words]);

  // Filter words
  const filtered = useMemo(() => {
    return words.filter((w) => {
      const matchSearch =
        !search ||
        w.word_text.toLowerCase().includes(search.toLowerCase()) ||
        w.meaning?.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === 'All' || w.category === selectedCategory;
      const matchFamiliarity =
        selectedFamiliarity === 'All' ||
        w.familiarity_level?.toLowerCase() === selectedFamiliarity.toLowerCase();
      return matchSearch && matchCategory && matchFamiliarity;
    });
  }, [words, search, selectedCategory, selectedFamiliarity]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Vocabulary</h1>
            <p className="mt-1 text-sm text-slate-400">
              {words.length} {words.length === 1 ? 'word' : 'words'} saved
            </p>
          </div>
          <Link
            to="/add"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:bg-violet-500"
          >
            <PlusCircle size={15} />
            Add word
          </Link>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words or meanings…"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Category + Familiarity row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category dropdown */}
            <div className="relative flex items-center gap-2">
              <Filter size={13} className="text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 outline-none transition-all duration-200 focus:border-violet-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Familiarity tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1 border border-slate-700">
              {FAMILIARITY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFamiliarity(tab)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${selectedFamiliarity === tab
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading your vocabulary…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && words.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
              <BookOpen size={24} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">No words yet</p>
              <p className="text-xs text-slate-500 mt-1">Start by adding a word you've encountered.</p>
            </div>
            <Link
              to="/add"
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:bg-violet-500"
            >
              <PlusCircle size={14} />
              Add your first word
            </Link>
          </div>
        )}

        {!loading && !error && words.length > 0 && filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-400">
            No words match your filters.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyWords;
