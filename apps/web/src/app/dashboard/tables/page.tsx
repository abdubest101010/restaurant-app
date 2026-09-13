'use client';

import { useEffect, useState } from 'react';
import { branchApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function TablesPage() {
  const { branchId } = useDashboardContext();
  const [tables, setTables] = useState<Array<Record<string, unknown>>>([]);
  const [newLabel, setNewLabel] = useState('');
  const [qrResult, setQrResult] = useState<{ url: string; qrImage: string } | null>(null);

  const load = () => {
    if (branchId) branchApi.getTables(branchId).then(setTables);
  };

  useEffect(() => { load(); }, [branchId]);

  async function addTable() {
    if (!branchId || !newLabel) return;
    await branchApi.createTable(branchId, { label: newLabel });
    setNewLabel('');
    load();
  }

  async function generateQr(tableId?: string) {
    if (!branchId) return;
    const result = await branchApi.generateQr(branchId, tableId) as { url: string; qrImage: string };
    setQrResult(result);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tables & QR Codes</h1>

      <div className="flex gap-3 mb-6">
        <Input placeholder="Table label (e.g. T6)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
        <Button onClick={addTable}>Add Table</Button>
        <Button variant="outline" onClick={() => generateQr()}>Generate Branch QR</Button>
      </div>

      {qrResult && (
        <div className="rounded-xl border bg-white p-6 mb-6 text-center print:border-0">
          <img src={qrResult.qrImage} alt="QR Code" width={200} height={200} className="mx-auto mb-3" />
          <p className="text-xs text-gray-500 break-all mb-3">{qrResult.url}</p>
          <Button variant="outline" size="sm" onClick={() => window.print()}>Print QR</Button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.id as string} className="rounded-xl border bg-white p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{table.label as string}</h3>
              <Badge status={table.status as string} />
            </div>
            <p className="text-sm text-gray-500">Area: {(table.area as string) || 'N/A'} | Capacity: {table.capacity as number}</p>
            <Button size="sm" className="w-full mt-3" onClick={() => generateQr(table.id as string)}>
              Generate QR
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
