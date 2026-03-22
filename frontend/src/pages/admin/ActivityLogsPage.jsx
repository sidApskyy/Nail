import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';

export function ActivityLogsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/activity-logs')
      .then((res) => setItems(res.data?.data || []))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load activity logs'));
  }, []);

  return (
    <div>
      <div className="mb-4">
        <div className="text-xl font-bold">Activity Logs</div>
        <div className="text-sm text-slate-600">Recent actions (last 500)</div>
      </div>

      {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}

      <Card>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">When</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-2 text-slate-600">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="font-medium">{l.user_name}</td>
                  <td>{l.action}</td>
                  <td className="text-slate-600">
                    {l.entity_type} {l.entity_id ? `(${l.entity_id})` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
