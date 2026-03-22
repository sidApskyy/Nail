import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { StaffSwitcher } from '../components/StaffSwitcher';

export function StaffLayout() {
  const { user, logout, getEffectiveUser } = useAuthStore();
  const effectiveUser = getEffectiveUser();

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 shadow-sm relative z-[100]">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-slate-900">Nail House Pune</div>
            <div className="text-xs text-slate-500 font-medium">Staff Portal</div>
          </div>
          <div className="flex items-center gap-4">
            <StaffSwitcher />
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-sm">
          <nav className="space-y-2">
            <NavLink
              to="/staff"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/staff/create-appointment"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Create Appointment
            </NavLink>
            <NavLink
              to="/staff/my-appointments"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Appointments
            </NavLink>
            <NavLink
              to="/staff/upload-work"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Upload Work
            </NavLink>
          </nav>

          <div className="mt-8 rounded-xl bg-slate-50/80 p-4 border border-slate-200/60">
            <div className="text-xs text-slate-600 font-medium">Signed in as</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">{effectiveUser?.name || user?.name}</div>
            <div className="text-xs text-slate-500 break-all mt-1">{user?.email}</div>
            {effectiveUser && effectiveUser.id !== user?.id && (
              <div className="text-xs text-blue-600 mt-2 font-medium">
                Acting as: {effectiveUser.name}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
