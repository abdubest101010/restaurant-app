const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  else if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('accessToken');
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
  }

  const res = await fetch(`${API_URL}${path}`, { headers, ...rest });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || error.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  signup: (data: { email: string; password: string; displayName?: string }) =>
    api('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  me: () => api('/auth/me'),
};

export const publicApi = {
  resolveQr: (token: string, sig: string) => api(`/public/qr/${token}?sig=${encodeURIComponent(sig)}`),
  getMenu: (branchSlug: string) => api(`/public/branches/${branchSlug}/menu`),
  getItem: (itemId: string) => api(`/public/menu/item/${itemId}`),
  search: (q: string, branchId?: string) =>
    api(`/public/menu/search?q=${encodeURIComponent(q)}${branchId ? `&branchId=${branchId}` : ''}`),
};

export const orderApi = {
  create: (data: unknown) => api('/orders', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => api(`/orders/${id}`),
  confirm: (id: string) => api(`/orders/${id}/confirm`, { method: 'POST' }),
  history: () => api('/orders/history'),
};

export const paymentApi = {
  createIntent: (orderId: string) =>
    api('/payments/stripe/create-intent', { method: 'POST', body: JSON.stringify({ orderId }) }),
  markCash: (orderId: string) =>
    api('/payments/cash/mark-due', { method: 'POST', body: JSON.stringify({ orderId }) }),
};

export const dashboardApi = {
  getContext: () => api('/dashboard/context'),
  getOrders: (branchId: string, status?: string) =>
    api(`/dashboard/orders?branchId=${branchId}${status ? `&status=${status}` : ''}`),
  getKitchen: (branchId: string) => api(`/dashboard/kitchen?branchId=${branchId}`),
  updateStatus: (orderId: string, status: string, note?: string) =>
    api(`/dashboard/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  updateItemStatus: (orderId: string, itemId: string, status: string) =>
    api(`/dashboard/orders/${orderId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAnalytics: (branchId: string, days?: number) =>
    api(`/dashboard/analytics?branchId=${branchId}${days ? `&days=${days}` : ''}`),
};

export const adminApi = {
  getAnalytics: () => api('/admin/analytics'),
  approveRestaurant: (id: string) => api(`/admin/restaurants/${id}/approve`, { method: 'POST' }),
  rejectRestaurant: (id: string) => api(`/admin/restaurants/${id}/reject`, { method: 'POST' }),
  deactivateRestaurant: (id: string) => api(`/admin/restaurants/${id}/deactivate`, { method: 'POST' }),
  activateRestaurant: (id: string) => api(`/admin/restaurants/${id}/activate`, { method: 'POST' }),
  getRestaurants: (status?: string) => api(`/restaurants${status ? `?status=${status}` : ''}`),
  updateCommission: (restaurantId: string, rate: number) =>
    api('/admin/commissions', { method: 'PATCH', body: JSON.stringify({ restaurantId, rate }) }),
  getPayouts: () => api('/admin/payouts'),
  markPayoutPaid: (id: string) => api(`/admin/payouts/${id}/paid`, { method: 'POST' }),
  getAuditLogs: () => api('/admin/audit-logs'),
};

export const restaurantApi = {
  create: (data: { name: string; slug: string; address?: string; phone?: string }) =>
    api('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
};

export const branchApi = {
  getTables: (branchId: string) => api(`/branches/${branchId}/tables`),
  createTable: (branchId: string, data: { label: string; area?: string; capacity?: number }) =>
    api(`/branches/${branchId}/tables`, { method: 'POST', body: JSON.stringify(data) }),
  generateQr: (branchId: string, tableId?: string) =>
    api(`/branches/${branchId}/qr-codes`, { method: 'POST', body: JSON.stringify({ tableId }) }),
};

export const menuAdminApi = {
  getMenu: (branchId: string) => api(`/admin/menu?branchId=${branchId}`),
  createCategory: (data: { name: string; branchId?: string; restaurantId?: string }) =>
    api('/admin/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
  createItem: (data: { categoryId: string; name: string; description?: string; basePrice: number; dietaryTags?: string[] }) =>
    api('/admin/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  toggleAvailability: (id: string) => api(`/admin/menu/items/${id}/toggle`, { method: 'PATCH' }),
  deleteItem: (id: string) => api(`/admin/menu/items/${id}`, { method: 'DELETE' }),
};

export const customerApi = {
  favorites: () => api('/customers/favorites'),
  toggleFavorite: (menuItemId: string) => api(`/customers/favorites/${menuItemId}`, { method: 'POST' }),
  addresses: () => api('/customers/addresses'),
  createAddress: (data: unknown) => api('/customers/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => api(`/customers/addresses/${id}`, { method: 'DELETE' }),
  reviews: () => api('/customers/reviews'),
  createReview: (data: { orderId?: string; menuItemId?: string; rating: number; comment?: string }) =>
    api('/customers/reviews', { method: 'POST', body: JSON.stringify(data) }),
  reorder: (orderId: string) => api(`/customers/orders/${orderId}/reorder`, { method: 'POST' }),
};

export const staffApi = {
  list: (restaurantId: string) => api(`/staff?restaurantId=${restaurantId}`),
  invite: (data: { restaurantId: string; email: string; displayName?: string; roleCode: string; branchId?: string }) =>
    api('/staff', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => api(`/staff/${id}`, { method: 'DELETE' }),
};

export function redirectAfterLogin(roles: Array<{ roleCode: string }>) {
  const codes = roles.map((r) => r.roleCode);
  if (codes.includes('platform_superadmin') || codes.includes('platform_moderator')) return '/admin';
  if (codes.some((c) => ['owner', 'manager', 'kitchen', 'waiter'].includes(c))) return '/dashboard';
  return '/account';
}
