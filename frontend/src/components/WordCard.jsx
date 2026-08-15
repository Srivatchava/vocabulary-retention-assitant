import React from 'react';
import { Flame, Brain, Trophy, Star } from 'lucide-react';

const familiarityConfig = {
  new:       { label: 'New',       bg: 'bg-slate-700',   text: 'text-slate-300',  dot: 'bg-slate-400' },
  learning:  { label: 'Learning',  bg: 'bg-blue-900/40', text: 'text-blue-300',   dot: 'bg-blue-400'  },
  familiar:  { label: 'Familiar',  bg: 'bg-amber-900/40',text: 'text-amber-300',  dot: 'bg-amber-400' },
  mastered:  { label: 'Mastered',  bg: 'bg-emerald-900/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
};

const WordCard = ({ word }) => {
  const config = familiarityConfig[word.familiarity_level] || familiarityConfig.new;

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 transition-all duration-300 hover:border-violet-500/30 hover:bg-slate-800 hover:shadow-lg hover:shadow-violet-500/5">
      {/* Header: word + familiarity badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-white group-hover:text-violet-200 transition-colors duration-200">
          {word.word_text}
        </h3>
        <span className={`flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      {/* Meaning */}
      <p className="text-sm leading-relaxed text-slate-400 line-clamp-3">
        {word.meaning}
      </p>

      {/* Footer: category + stats */}
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-700/40">
        <span className="rounded-md bg-violet-900/30 px-2 py-0.5 text-xs font-medium text-violet-300">
          {word.category}
        </span>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Brain size={11} className="text-blue-400" />
            {word.times_practiced}
          </span>
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" />
            {word.times_forgotten}
          </span>
        </div>
      </div>

      {/* Context tooltip if present */}
      {word.context && (
        <p className="text-xs italic text-slate-500 leading-relaxed border-t border-slate-700/40 pt-2">
          "{word.context}"
        </p>
      )}
    </div>
  );
};

export default WordCard;
