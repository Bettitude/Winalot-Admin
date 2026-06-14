import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiBell, FiChevronDown, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Logo from '../ui/Logo';

export default function TopBar({ onMenuToggle }) {
  const { admin, logout } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = admin?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0 relative">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <FiMenu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-700 hidden lg:block">
          Howdy, {admin?.name?.split(' ')[0] || 'Admin'}
        </span>
      </div>

      {/* Logo — centered, visible only on mobile where sidebar is toggled */}
      <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <Link to="/admin">
          <Logo variant="full" height={36} />
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
          <FiBell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A4D8F] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#1A1A2E] leading-tight">{admin?.name}</p>
              <p className="text-[10px] text-gray-400">Administrator</p>
            </div>
            <FiChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-[#1A1A2E]">{admin?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{admin?.email}</p>
              </div>
              {[
                { label: 'Profile Settings', icon: FiUser },
                { label: 'Settings',          icon: FiSettings },
              ].map(item => (
                <button key={item.label}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-gray-400" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
