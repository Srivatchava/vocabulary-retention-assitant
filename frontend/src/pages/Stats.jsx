import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Loader2, AlertCircle, ArrowLeft, Flame, BookOpen, Trophy, TrendingUp, Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Stats = () => {
  //   const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/session/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-indigo-500 animate-spin" />
          <p className="text-slate-400">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-slate-300" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">Your Statistics</h1>
            <p className="text-slate-400 mt-2">Track your vocabulary learning progress</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-700/50 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Streak */}
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm font-medium">Current Streak</p>
                  <Flame size={20} className="text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.user.streak_count}</p>
                <p className="text-xs text-slate-500 mt-2">days in a row</p>
              </div>

              {/* Total Words */}
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm font-medium">Total Words</p>
                  <BookOpen size={20} className="text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.words.total}</p>
                <p className="text-xs text-slate-500 mt-2">vocabulary items</p>
              </div>

              {/* Mastered Words */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm font-medium">Mastered</p>
                  <Trophy size={20} className="text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {stats.words.by_familiarity?.mastered?.count || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">words mastered</p>
              </div>

              {/* Completion Rate */}
              <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm font-medium">Completion Rate</p>
                  <TrendingUp size={20} className="text-violet-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.sessions.completion_rate || 0}%</p>
                <p className="text-xs text-slate-500 mt-2">of sessions completed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Word Familiarity Breakdown */}
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Word Familiarity Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(stats.words.by_familiarity || {}).map(([level, data]) => {
                    const total = stats.words.total || 1;
                    const percentage = Math.round((data.count / total) * 100);
                    const colors = {
                      new: { bar: 'bg-slate-400', bg: 'bg-slate-500/20' },
                      learning: { bar: 'bg-amber-400', bg: 'bg-amber-500/20' },
                      familiar: { bar: 'bg-blue-400', bg: 'bg-blue-500/20' },
                      mastered: { bar: 'bg-emerald-400', bg: 'bg-emerald-500/20' },
                    };
                    const color = colors[level] || colors.new;

                    return (
                      <div key={level} className={`p-4 rounded-lg ${color.bg} border border-slate-700/30`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="capitalize font-medium text-white">{level}</span>
                          <span className="text-sm text-slate-300">
                            {data.count} words ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${color.bar} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Avg. practiced: {data.avg_practiced} times | Forgotten: {data.avg_forgotten} times
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Categories</h2>
                {stats.categories && stats.categories.length > 0 ? (
                  <div className="space-y-3">
                    {stats.categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700/30"
                      >
                        <span className="text-slate-300 font-medium truncate">{cat.name}</span>
                        <span className="ml-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium flex-shrink-0">
                          {cat.word_count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-6">
                    No categories yet. Create words to build categories!
                  </p>
                )}
              </div>
            </div>

            {/* Session Statistics */}
            <div className="mt-8 bg-slate-800/50 border border-slate-700/60 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={20} />
                Session Statistics
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{stats.sessions.total}</p>
                  <p className="text-slate-400 text-sm mt-1">Total Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-400">{stats.sessions.completed}</p>
                  <p className="text-slate-400 text-sm mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-400">{stats.sessions.completion_rate}%</p>
                  <p className="text-slate-400 text-sm mt-1">Completion Rate</p>
                </div>
              </div>

              {/* Recent Activity Heatmap */}
              {stats.recent_activity && stats.recent_activity.length > 0 && (
                <div className="mt-6">
                  <p className="text-slate-400 text-sm mb-3">Last 7 Days Activity</p>
                  <div className="flex gap-2 justify-start">
                    {stats.recent_activity.map((day, idx) => (
                      <div
                        key={idx}
                        className={`w-10 h-10 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-110 ${day.completed
                          ? 'bg-emerald-500/30 border border-emerald-500 text-emerald-300'
                          : 'bg-slate-700/30 border border-slate-600 text-slate-500'
                          }`}
                        title={`${day.date}: ${day.completed ? 'Completed' : 'Skipped'}`}
                      >
                        {new Date(day.date).getDate()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div className="mt-6 text-center text-slate-500 text-sm">
              <p>
                Member since{' '}
                {new Date(stats.user.account_created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
