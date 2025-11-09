'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { getOrCreateUser } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Wait until Firebase auth state is resolved
    if (isUserLoading) {
      return;
    }

    // If no user, redirect to login and we're done.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If we have a user, verify them
    const verifyUser = async () => {
      try {
        await getOrCreateUser(user);
        // If the above line doesn't throw, the user is authorized.
        setIsAuthorized(true);
      } catch (error: any) {
        // This block should not be hit with the temporary changes, but kept for structure
        console.error("Authorization check failed:", error.message);
        toast({
          variant: "destructive",
          title: "Akses Ditolak",
          description: "Anda tidak diizinkan untuk mengakses halaman ini.",
        });
        setIsAuthorized(false);
        if (auth) {
            await signOut(auth); // Sign out unauthorized user
        }
        // Redirect will be handled by the next run of useEffect seeing a null user
      } finally {
        setIsVerifying(false); // Mark verification as complete
      }
    };

    verifyUser();
    
  }, [user, isUserLoading, auth, router, toast]);

  // Show a loading screen while auth state is loading or verification is in progress.
  if (isUserLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memverifikasi sesi Anda...</p>
      </div>
    );
  }
  
  // If verification is done and the user is authorized, show the dashboard.
  if (isAuthorized) {
    return <>{children}</>;
  }

  // If verification is done and user is not authorized, they are being redirected.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      <p className="text-muted-foreground">Akses ditolak. Mengalihkan...</p>
    </div>
  );
}
