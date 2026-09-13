'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

export default function AdminAuditPage() {
  const [data, setData] = useState<{ items: Array<Record<string, unknown>> } | null>(null);

  useEffect(() => {
    adminApi.getAuditLogs().then(setData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit logs</h1>
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Actor</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((row) => {
              const actor = row.actor as { email?: string } | null;
              return (
                <tr key={row.id as string} className="border-t">
                  <td className="p-3 text-gray-500">{new Date(row.createdAt as string).toLocaleString()}</td>
                  <td className="p-3 font-medium">{row.action as string}</td>
                  <td className="p-3">{row.entityType as string} {row.entityId ? String(row.entityId).slice(0, 8) : ''}</td>
                  <td className="p-3">{actor?.email || 'system'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
