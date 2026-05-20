"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser, getEffectivePermissions } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (currentUser && pathname !== '/portal') {
      const perms = getEffectivePermissions(currentUser.id);
      
      if (pathname.startsWith('/ymed') && !perms.portals?.ymed) {
        router.push('/portal');
      } else if (!pathname.startsWith('/ymed') && !pathname.startsWith('/admin') && !perms.portals?.cp) {
        // If it's a CP page (not ymed, not admin, not portal) and no CP access
        router.push('/portal');
      }
    }
  }, [isAuthenticated, currentUser, getEffectivePermissions, pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
