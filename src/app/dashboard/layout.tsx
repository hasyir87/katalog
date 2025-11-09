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

  // 'verifying' | 'authorized' | 'unauthorized'
  const [authState, setAuthState] = useState<'verifying' | 'authorized' | 'unauthorized'>('verifying');

  useEffect(() => {
    // Don't do anything until Firebase has determined the user's auth state
    if (isUserLoading) {
      setAuthState('verifying');
      return;
    }

    // If there's no user, they need to log in.
    if (!user) {
      setAuthState('unauthorized');
      router.replace('/login');
      return;
    }

    // If there is a user, check if they are authorized.
    // This only runs once when the user object is first available.
    let isMounted = true;
    
    getOrCreateUser(user)
      .then(() => {
        if (isMounted) {
          // If the promise resolves, the user is authorized.
          setAuthState('authorized');
        }
      })
      .catch((error: any) => {
        if (isMounted) {
          // If it rejects, the user is not authorized.
          console.error("Authorization check failed:", error.message);
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk melihat halaman ini.",
          });
          
          if (auth) {
            signOut(auth); // Sign out the unauthorized user
          }
          setAuthState('unauthorized');
          // The state change from signOut will be handled by the `!user` check above
          // in a subsequent render, redirecting to login.
        }
      });
      
    return () => {
      isMounted = false;
    };

  }, [user, isUserLoading, auth, router, toast]);

  // Render content based on the authorization state
  if (authState === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memverifikasi sesi Anda...</p>
      </div>
    );
  }
  
  if (authState === 'authorized') {
    return <>{children}</>;
  }

  // For 'unauthorized' state, show a redirection message.
  // The useEffect will handle the actual redirection.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      <p className="text-muted-foreground">Akses ditolak. Mengalihkan...</p>
    </div>
  );
}
