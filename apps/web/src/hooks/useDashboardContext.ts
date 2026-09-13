'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';

export interface DashboardContext {
  restaurantId: string | null;
  restaurantName: string | null;
  branchId: string | null;
  branchName: string | null;
  role: string | null;
}

export function useDashboardContext() {
  const [ctx, setCtx] = useState<DashboardContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getContext()
      .then((data: DashboardContext) => {
        setCtx(data);
        if (data.branchId) localStorage.setItem('dashboardBranchId', data.branchId);
        if (data.restaurantId) localStorage.setItem('dashboardRestaurantId', data.restaurantId);
      })
      .catch(() => setCtx(null))
      .finally(() => setLoading(false));
  }, []);

  return { ctx, loading, branchId: ctx?.branchId || '', restaurantId: ctx?.restaurantId || '' };
}
