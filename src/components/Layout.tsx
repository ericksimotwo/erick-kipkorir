import React from 'react';
import { User } from 'firebase/auth';
import { UserProfile, UserRole } from '../firebase';
import { LogOut, LayoutDashboard, FileText, Bell, Users, Settings, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  profile: UserProfile;
  onLogout: () => void;
}

export const Layout = ({ children, profile, onLogout }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-white overflow-hidden border-8 border-white">
      {/* Sidebar / Navigation Rail */}
      <aside className="hidden w-[240px] flex-shrink-0 border-r border-[#1A1A1A] bg-[#FAF9F6] lg:flex lg:flex-col p-8">
        <div className="mb-12">
          <h1 className="text-2xl font-serif italic font-bold leading-none uppercase tracking-tighter text-[#1A1A1A]">LRMS</h1>
          <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold block mt-1">Academic Oversight</span>
        </div>
        
        <nav className="flex-1 space-y-6">
          <div className="group">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 opacity-40 font-bold">Main Dashboard</p>
            <ul className="space-y-4 font-medium text-sm italic">
              <li className="border-b border-[#1A1A1A] pb-1 cursor-pointer">Overview</li>
              <li className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer">Detailed reports</li>
              {profile.role === UserRole.HOD && (
                <li className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer">Departmental Audit</li>
              )}
            </ul>
          </div>
          
          <div className="group">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 opacity-40 font-bold">User Actions</p>
            <ul className="space-y-4 font-medium text-sm italic">
              <li className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer">Notifications</li>
              <li className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-red-600" onClick={onLogout}>Sign Out</li>
            </ul>
          </div>
        </nav>

        <div className="mt-auto pt-10 border-t border-[#1A1A1A] border-opacity-10">
          <div className="p-4 bg-[#1A1A1A] text-white rounded-sm">
            <p className="text-[10px] uppercase tracking-wider mb-1 opacity-60">Session User</p>
            <p className="text-xs font-serif italic truncate">{profile.name}</p>
            <p className="text-[9px] uppercase tracking-widest mt-1 opacity-40">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F6]">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-[#1A1A1A] lg:hidden">
          <h1 className="text-xl font-serif italic font-bold uppercase">LRMS</h1>
          <button className="p-2 text-[#1A1A1A] hover:bg-gray-100 rounded">
            <Bell size={20} />
          </button>
        </header>
        <div className="flex-1 relative overflow-y-auto">
          {children}
        </div>
        
        {/* Micro Footer */}
        <footer className="h-12 border-t border-[#1A1A1A] flex items-center px-8 justify-between bg-white">
          <div className="text-[9px] uppercase tracking-widest opacity-40 italic">Institutional Integrity Protocol © 2026</div>
          <div className="flex gap-6 text-[9px] uppercase tracking-widest font-bold">
            <span className="opacity-40">System Status: Optimal</span>
            <span className="hidden sm:inline">Role: {profile.role.replace('_', ' ')}</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <a
    href="#"
    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <span className={`${active ? 'text-blue-600' : 'text-gray-400'} mr-3`}>{icon}</span>
    {label}
  </a>
);
