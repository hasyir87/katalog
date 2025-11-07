'use client';

import { ReactNode } from 'react';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {AuthContext} from '@/hooks/use-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading: loading } = useUser();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
