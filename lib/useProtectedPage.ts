import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export function useProtectedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('redirect_after_auth', pathname);
      router.push('/auth');
    }
  }, [authLoading, user, router, pathname]);

  return { isAuthenticated: !!user, authLoading };
}
