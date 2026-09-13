'use client';

import { useEffect, useState } from 'react';
import { staffApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function StaffPage() {
  const { restaurantId, branchId } = useDashboardContext();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [email, setEmail] = useState('');
  const [roleCode, setRoleCode] = useState('waiter');

  const load = () => {
    if (restaurantId) staffApi.list(restaurantId).then(setRows);
  };

  useEffect(() => { load(); }, [restaurantId]);

  async function invite() {
    if (!restaurantId || !email) return;
    await staffApi.invite({ restaurantId, email, roleCode, branchId: branchId || undefined });
    setEmail('');
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff</h1>
      <div className="rounded-xl border bg-white p-4 mb-6 flex gap-3">
        <Input placeholder="staff@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select value={roleCode} onChange={(e) => setRoleCode(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="manager">Manager</option>
          <option value="kitchen">Kitchen</option>
          <option value="waiter">Waiter</option>
          <option value="owner">Owner</option>
        </select>
        <Button onClick={invite}>Invite</Button>
      </div>
      <p className="text-xs text-gray-500 mb-4">New staff accounts are created with temporary password <code>welcome123</code>.</p>
      <div className="space-y-2">
        {rows.map((row) => {
          const user = row.user as { email: string; displayName?: string };
          const role = row.role as { name: string; code: string };
          return (
            <div key={row.id as string} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-medium">{user.displayName || user.email}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={role.code} />
                <Button size="sm" variant="outline" onClick={() => staffApi.remove(row.id as string).then(load)}>Remove</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
