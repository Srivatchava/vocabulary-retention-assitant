import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
//   const { token } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/session/history');
      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.response?.data?.error || 'Failed to load session history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-indigo-500 animate-spin" />
          <p className="text-slate-400">Loading your practice history...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-slate-300" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">Practice History</h1>
            <p className="text-slate-400 mt-2">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
            </p>
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

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No practice sessions yet.</p>
            <p className="text-slate-500 text-sm mt-2">Complete your first session to see it here!</p>
            <Link
              to="/"
              className="mt-6 inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                className="border border-slate-700/60 rounded-lg overflow-hidden hover:border-slate-600 transition-colors bg-slate-800/30"
              >
                {/* Session Header */}
                <div className="p-4 flex items-start justify-between bg-slate-800/50">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {session.completion_status ? (
                        <CheckCircle size={24} className="text-emerald-500" />
                      ) : (
                        <AlertCircle size={24} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {formatDate(session.session_date)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.completion_status
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {session.completion_status ? 'Completed' : 'Incomplete'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        {session.words_included?.flat?.()?.length || 0} word
                        {session.words_included?.flat?.()?.length !== 1 ? 's' : ''} practiced
                      </p>
                    </div>
                  </div>
                </div>

                {/* Paragraphs Preview */}
                <div className="px-4 pb-4 space-y-3 max-h-48 overflow-y-auto">
                  {session.paragraphs?.map((para, pIdx) => (
                    <div key={pIdx} className="bg-slate-900/50 p-3 rounded border border-slate-700/30">
                      <p className="text-sm text-slate-300 leading-relaxed">{para}</p>
                      {session.words_included?.[pIdx]?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {session.words_included[pIdx].map((word) => (
                            <span
                              key={word.id}
                              className="inline-block px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30"
                              title={word.meaning}
                            >
                              {word.word_text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
