import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const sideW = collapsed ? 'w-16' : 'w-52';
  const mainML = collapsed ? 'ml-16' : 'ml-52';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${mainML}`}>
        <TopBar onMenuToggle={() => setCollapsed(v => !v)} />
        <main className="flex-1 p-6 page-enter overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
