'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the user loading state is definitively false.
    if (isUserLoading) {
      return; // Do nothing while loading.
    }

    // If loading is finished and there's still no user, redirect to login.
    if (!user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While loading, or if there's no user yet (and the redirect is about to happen),
  // show a loading indicator. This prevents the children from rendering prematurely.
  if (isUserLoading || !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat dasbor...</p>
        </div>
    );
  }

  // If loading is done and a user exists, render the dashboard content.
  return <>{children}</>;
}
