import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { to: '/', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
    { to: '/admin/users', icon: 'users', label: 'Manage Users' },
    { to: '/admin/appointments', icon: 'appointments', label: 'View Appointments' },
    { to: '/admin/completed-works', icon: 'works', label: 'Completed Works' }
  ];

  const getNavIcon = (iconType) => {
    const icons = {
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1h2a1 1 0 011 1m0 0h3a1 1 0 001-1v-4m0 0l-4-4" />
        </svg>
      ),
      analytics: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      appointments: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      works: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    };
    return icons[iconType] || null;
  };

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr] bg-gradient-to-br from-orange-50 via-peach-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-orange-200/10 to-pink-200/10 blur-3xl animate-float-slow"
            style={{
              width: `${150 + i * 40}px`,
              height: `${150 + i * 40}px`,
              left: `${-5 + i * 25}%`,
              top: `${-5 + i * 20}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${25 + i * 5}s`
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 border-r border-orange-200/60 bg-white/90 backdrop-blur-sm shadow-xl">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 opacity-10"></div>
          
          <div className="relative p-6">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <div className="text-white font-bold text-lg">NH</div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Nail House Pune
                </div>
                <div className="text-xs text-orange-600 font-semibold uppercase tracking-wider">Admin Panel</div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-200/60 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
                  <div className="text-xs text-gray-600 truncate">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                group relative flex items-center space-x-3 px-4 py-3 rounded-xl
                transition-all duration-200 transform hover:scale-[1.02]
                ${isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`transition-transform duration-200 ${item.to === '/' ? 'animate-scale-in' : ''}`}>
                {getNavIcon(item.icon)}
              </div>
              <span className="font-medium">{item.label}</span>
              
              {/* Active indicator */}
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                item.to === '/' ? 'bg-white scale-100' : 'bg-orange-400 scale-0 group-hover:scale-100'
              }`}></div>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transform transition-all duration-200 hover:scale-105" 
            onClick={logout}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </div>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 p-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
