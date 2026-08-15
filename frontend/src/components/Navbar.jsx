import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, Library, LogOut, Zap, History, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-violet-600/20 text-violet-300 shadow-sm shadow-violet-500/10'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/60'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">VocabAI</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <BookOpen size={15} />
            <span>Practice</span>
          </NavLink>
          <NavLink to="/add" className={linkClass}>
            <PlusCircle size={15} />
            <span>Add Word</span>
          </NavLink>
          <NavLink to="/words" className={linkClass}>
            <Library size={15} />
            <span>My Words</span>
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <History size={15} />
            <span>History</span>
          </NavLink>
          <NavLink to="/stats" className={linkClass}>
            <BarChart3 size={15} />
            <span>Stats</span>
          </NavLink>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-200 hover:border-red-500/50 hover:text-red-400"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
