import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, Library, LogOut, Zap, History, BarChart3, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
      ? 'bg-violet-600/20 text-violet-300 shadow-sm shadow-violet-500/10'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/60'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
      ? 'bg-violet-600/20 text-violet-300'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">VocabAI</span>
        </div>

        {/* Desktop Links (hidden on mobile, visible on md+) */}
        <div className="hidden md:flex items-center gap-1">
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

        {/* Desktop User + Logout */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-slate-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-200 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-900/98 px-4 pt-2 pb-4 space-y-1 md:hidden">
          <NavLink to="/" end className={mobileLinkClass} onClick={() => setIsOpen(false)}>
            <BookOpen size={16} />
            <span>Practice</span>
          </NavLink>
          <NavLink to="/add" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
            <PlusCircle size={16} />
            <span>Add Word</span>
          </NavLink>
          <NavLink to="/words" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
            <Library size={16} />
            <span>My Words</span>
          </NavLink>
          <NavLink to="/history" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
            <History size={16} />
            <span>History</span>
          </NavLink>
          <NavLink to="/stats" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
            <BarChart3 size={16} />
            <span>Stats</span>
          </NavLink>

          {/* User info & Logout in mobile menu */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {user?.email}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-red-500/50 hover:text-red-400 cursor-pointer"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
