import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiCalendar, FiTag, FiDollarSign, FiUsers, FiBell, FiChevronRight, FiChevronDown, FiPlusSquare, FiList } from 'react-icons/fi';

const nav = [
  {
    label: 'Dashboard', icon: FiGrid, to: '/admin', exact: true,
  },
  {
    label: 'Match Mgt', icon: FiCalendar, children: [
      { label: 'All Matches',   to: '/admin/matches',     icon: FiList },
      { label: 'Add New Match', to: '/admin/matches/new', icon: FiPlusSquare },
    ],
  },
  {
    label: 'Tickets Mgt', icon: FiTag, children: [
      { label: 'All Predictions',    to: '/admin/tickets',        icon: FiList },
      { label: 'Settle Predictions', to: '/admin/tickets/settle', icon: FiList },
    ],
  },
  { label: 'Transactions', icon: FiDollarSign, to: '/admin/transactions' },
  { label: 'Users',        icon: FiUsers,      to: '/admin/users' },
  { label: 'Notifications', icon: FiBell,      to: '/admin/notifications' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(() => {
    const open = new Set();
    nav.forEach(item => {
      if (item.children?.some(c => location.pathname.startsWith(c.to))) open.add(item.label);
    });
    return open;
  });

  const toggleGroup = (label) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-30 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-52'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 shrink-0">
        {!collapsed ? (
          <span className="text-xl font-black tracking-tight">
            <span className="text-[#F5C518]">b</span>
            <span className="text-[#0D2B5E]">WinAL</span>
            <span className="text-[#F5C518]">OTT</span>
          </span>
        ) : (
          <span className="text-lg font-black text-[#F5C518] mx-auto">b</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {nav.map(item => {
          const Icon = item.icon;

          if (item.to) {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#1A4D8F] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          }

          // Expandable group
          const isGroupActive = item.children?.some(c => location.pathname.startsWith(c.to));
          const isOpen = openGroups.has(item.label);

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isGroupActive ? 'text-[#1A4D8F] bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-[#F5C518]' : 'text-gray-400'}`} />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {isOpen
                      ? <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      : <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    }
                  </>
                )}
              </button>
              {isOpen && !collapsed && (
                <div className="pl-4 mt-0.5 space-y-0.5">
                  {item.children.map(child => {
                    const isChildActive = location.pathname === child.to;
                    const CIcon = child.icon;
                    return (
                      <NavLink key={child.to} to={child.to}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isChildActive ? 'text-[#1A4D8F] bg-blue-50 font-semibold' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <CIcon className={`w-3.5 h-3.5 shrink-0 ${isChildActive ? 'text-[#1A4D8F]' : 'text-gray-400'}`} />
                        {child.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {collapsed
            ? <FiChevronRight className="w-4 h-4" />
            : <><FiChevronRight className="w-4 h-4 rotate-180" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
