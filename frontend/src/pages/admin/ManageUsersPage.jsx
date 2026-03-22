import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);

  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data?.data || []);
  };

  const onOpenReset = (id) => {
    setResetUserId(id);
    setResetPassword('');
    setShowResetPassword(false);
  };

  const onDoReset = async () => {
    if (!resetUserId) return;
    setError('');
    setResetting(true);
    try {
      await api.patch(`/admin/users/${resetUserId}/reset-password`, {
        password: resetPassword
      });
      setResetUserId(null);
      setResetPassword('');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || 'Failed to load users'));
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (role === 'admin') await api.post('/admin/create-admin', { name, email, password });
      else await api.post('/admin/create-staff', { name, email, password });

      setName('');
      setEmail('');
      setPassword('');
      setRole('staff');
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const onDeactivate = async (id) => {
    setError('');
    try {
      await api.delete(`/admin/users/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const onActivate = async (id) => {
    setError('');
    try {
      await api.patch(`/admin/users/${id}/activate`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to activate user');
    }
  };

  const onPermanentDelete = async (id) => {
    setError('');
    const ok = window.confirm('Permanently delete this user? This cannot be undone.');
    if (!ok) return;
    try {
      const response = await api.delete(`/admin/users/${id}/permanent`);
      console.log('Delete response:', response.data);
      await load();
      // Show success message
      setError('');
      alert('User permanently deleted successfully');
    } catch (e) {
      console.error('Delete error:', e.response?.data);
      const errorMessage = e?.response?.data?.message || 'Failed to permanently delete user';
      
      // Check if force delete is available
      if (e?.response?.data?.data?.forceDeleteAvailable) {
        const forceOk = window.confirm(
          `${errorMessage}\n\nThis user has business data that will be PERMANENTLY DELETED.\n\nDo you want to FORCE DELETE this user?\n\n⚠️ WARNING: This will permanently delete:\n- All appointments created by this user\n- All completed works uploaded by this user\n- The user account\n\nThis action CANNOT be undone!`
        );
        if (forceOk) {
          await onForceDelete(id);
          return;
        }
      }
      
      // Show more detailed error if available
      if (e?.response?.data?.data) {
        const errorData = e.response.data.data;
        const details = [];
        if (errorData.appointments > 0) details.push(`${errorData.appointments} appointments`);
        if (errorData.completedWorks > 0) details.push(`${errorData.completedWorks} completed works`);
        setError(`${errorMessage} (${details.join(', ')})`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const onForceDelete = async (id) => {
    setError('');
    try {
      const response = await api.delete(`/admin/users/${id}/force`);
      console.log('Force delete response:', response.data);
      await load();
      setError('');
      alert('User and all associated business data permanently deleted');
    } catch (e) {
      console.error('Force delete error:', e.response?.data);
      setError(e?.response?.data?.message || 'Failed to force delete user');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-xl font-bold">Manage Users</div>
        <div className="text-sm text-slate-600">Create admins and staff, deactivate users</div>
      </div>

      {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}

      <Card title="Create user" className="mb-4">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={onCreate}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <Input
              label="Password"
              type={showCreatePassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="mt-1 text-xs text-slate-600 hover:text-slate-900"
              onClick={() => setShowCreatePassword((v) => !v)}
            >
              {showCreatePassword ? 'Hide password' : 'Show password'}
            </button>
          </div>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-600">Role</div>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className="md:col-span-4">
            <Button disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </Card>

      <Card title="Users">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.flatMap((u) => {
                const rows = [
                  (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="py-2 font-medium">{u.name}</td>
                      <td className="text-slate-600">{u.email}</td>
                      <td className="capitalize">{u.role}</td>
                      <td className={u.is_active ? 'text-emerald-600' : 'text-slate-500'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="text-right">
                        {u.is_active ? (
                          <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => onOpenReset(u.id)}>
                              Reset Password
                            </Button>
                            <Button variant="danger" onClick={() => onDeactivate(u.id)}>
                              Deactivate
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => onActivate(u.id)}>
                              Activate
                            </Button>
                            <Button variant="secondary" onClick={() => onOpenReset(u.id)}>
                              Reset Password
                            </Button>
                            <Button variant="danger" onClick={() => onPermanentDelete(u.id)}>
                              Delete
                            </Button>
                            <Button variant="danger" onClick={() => onForceDelete(u.id)} className="bg-red-700 hover:bg-red-800">
                              Force Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                ];

                if (resetUserId === u.id) {
                  rows.push(
                    <tr key={`${u.id}:reset`} className="border-t border-slate-100">
                      <td colSpan={5} className="py-3">
                        <div className="flex flex-col md:flex-row gap-3 md:items-end">
                          <div className="flex-1">
                            <Input
                              label="New password"
                              type={showResetPassword ? 'text' : 'password'}
                              value={resetPassword}
                              onChange={(e) => setResetPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="mt-1 text-xs text-slate-600 hover:text-slate-900"
                              onClick={() => setShowResetPassword((v) => !v)}
                            >
                              {showResetPassword ? 'Hide password' : 'Show password'}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <Button disabled={resetting} onClick={onDoReset}>
                              {resetting ? 'Resetting...' : 'Confirm reset'}
                            </Button>
                            <Button variant="secondary" onClick={() => setResetUserId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return rows;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
