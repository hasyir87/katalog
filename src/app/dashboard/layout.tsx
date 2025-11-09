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
  
  // Combine loading and verifying state
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If Firebase Auth is still loading, wait.
    if (isUserLoading) {
      return; 
    }

    // If no user is logged in, redirect to login page.
    if (!user) {
      router.replace('/login');
      return;
    }
    
    let isMounted = true; // Prevent state updates on unmounted component

    // User is logged in, now verify if they are in the allowlist.
    const verifyUser = async () => {
      try {
        await getOrCreateUser(user);
        // If the above promise resolves, the user is authorized.
        if (isMounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (error: any) {
        // If it rejects, the user is not authorized.
        console.error("Authorization Error:", error.message);
        toast({
          variant: "destructive",
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        });

        if (isMounted) {
          setIsAuthorized(false);
          // Don't set isLoading to false yet, show a redirecting message.
        }
        
        // Sign out the unauthorized user and redirect.
        if (auth) {
          await signOut(auth);
        }
        // Redirect after sign-out is complete
        router.replace('/login');
      }
    };

    verifyUser();

    return () => {
      isMounted = false;
    };
  // We only want this to run when the user's loading status changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoading, user]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memverifikasi sesi Anda...</p>
      </div>
    );
  }
  
  if (isAuthorized) {
      return <>{children}</>;
  }

  // Fallback while redirecting. This will be shown if authorization fails.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      <p className="text-muted-foreground">Akses ditolak. Mengalihkan...</p>
    </div>
  );
}
