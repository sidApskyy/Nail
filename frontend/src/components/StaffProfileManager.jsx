import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function StaffProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff'
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff-profiles/active');
      setProfiles(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch staff profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff-profiles/create', formData);
      setFormData({ name: '', email: '', phone: '', role: 'staff' });
      setShowCreateForm(false);
      fetchProfiles();
    } catch (error) {
      if (error.response?.status === 409) {
        alert('A staff profile with this email already exists. Please use a different email.');
      } else {
        console.error('Failed to create staff profile:', error);
        alert('Failed to create staff profile. Please try again.');
      }
    }
  };

  const handleDeactivate = async (profileId) => {
    if (confirm('Are you sure you want to deactivate this staff profile?')) {
      try {
        await api.delete(`/staff-profiles/${profileId}/deactivate`);
        fetchProfiles();
      } catch (error) {
        console.error('Failed to deactivate staff profile:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Profile Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Staff Profiles</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create Staff Profile'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="staff">Staff</option>
                <option value="senior_staff">Senior Staff</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Profile
            </button>
          </form>
        </div>
      )}

      {/* Profiles List */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No staff profiles found</div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">{profile.name}</div>
                <div className="text-sm text-slate-500">{profile.email}</div>
                <div className="text-sm text-slate-500">{profile.phone}</div>
                <div className="text-xs text-slate-400 mt-1">Role: {profile.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <button
                  onClick={() => handleDeactivate(profile.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
