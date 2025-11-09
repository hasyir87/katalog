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
    console.log("DashboardLayout: useEffect triggered.", { isUserLoading, hasUser: !!user });
    
    // Wait until the user loading state is definitively false.
    if (isUserLoading) {
      console.log("DashboardLayout: Still loading user, waiting.");
      return; // Do nothing while loading.
    }

    // If loading is finished and there's still no user, redirect to login.
    if (!user) {
      console.log("DashboardLayout: No user found after loading, redirecting to /login.");
      router.push('/login');
    } else {
      console.log("DashboardLayout: User is present, allowing access.");
    }
  }, [user, isUserLoading, router]);

  // While loading, or if there's no user yet (and the redirect is about to happen),
  // show a loading indicator. This prevents the children from rendering prematurely.
  if (isUserLoading || !user) {
    console.log("DashboardLayout: Rendering loading indicator.", { isUserLoading, hasUser: !!user });
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat dasbor...</p>
        </div>
    );
  }

  // If loading is done and a user exists, render the dashboard content.
  console.log("DashboardLayout: Rendering children.");
  return <>{children}</>;
}
