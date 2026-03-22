import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, UsersIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function StaffSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { user, currentStaffProfile } = useAuthStore();

  const currentStaff = currentStaffProfile;

  useEffect(() => {
    if (isOpen) {
      fetchStaffProfiles();
      calculateDropdownPosition();
    }
  }, [isOpen]);

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 288 // 288px width, align to right
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStaffProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff-profiles/active');
      setStaffProfiles(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch staff profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSelect = async (staffProfile) => {
    try {
      await api.post('/staff-profiles/switch', { staffId: staffProfile.id });
      setIsOpen(false);
      
      // Update auth store with staff profile
      const { setCurrentStaffProfile } = useAuthStore.getState();
      setCurrentStaffProfile(staffProfile);
      
    } catch (error) {
      console.error('Failed to switch staff:', error);
    }
  };

  return (
    <>
      <div className="relative" ref={buttonRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200/60 hover:bg-white transition-all duration-200 shadow-sm"
        >
          <UsersIcon className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            {currentStaff ? currentStaff.name : 'Select Staff'}
          </span>
          <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-72 bg-white rounded-xl border border-slate-200/60 shadow-xl backdrop-blur-sm"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 99999
          }}
        >
          <div className="p-3 border-b border-slate-200/60">
            <div className="text-xs font-medium text-slate-500">Staff Profiles</div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : staffProfiles.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No staff profiles found
              </div>
            ) : (
              staffProfiles.map((staffProfile) => (
                <button
                  key={staffProfile.id}
                  onClick={() => handleStaffSelect(staffProfile)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100/60 last:border-b-0 ${
                    currentStaff?.id === staffProfile.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {staffProfile.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {staffProfile.email}
                      </div>
                      <div className="text-xs text-slate-400">
                        {staffProfile.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${staffProfile.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {currentStaff?.id === staffProfile.id && (
                        <div className="text-xs text-blue-600 font-medium">Active</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
