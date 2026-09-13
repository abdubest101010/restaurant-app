'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { useCart } from '@/hooks/useCart';

export default function QrEntryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setContext } = useCart();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.token as string;
    const sig = searchParams.get('sig');

    if (!token || !sig) {
      setError('Invalid QR code link');
      return;
    }

    publicApi.resolveQr(token, sig)
      .then((data: { sessionToken: string; branch: { id: string; slug: string }; table?: { id: string }; isOpen: boolean }) => {
        localStorage.setItem('guestToken', data.sessionToken);
        setContext(data.branch.id, data.table?.id);
        router.replace(`/menu/${data.branch.slug}`);
      })
      .catch((err) => setError(err.message));
  }, [params.token, searchParams, router, setContext]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">QR Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading menu...</p>
      </div>
    </div>
  );
}
