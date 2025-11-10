
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

  const [authState, setAuthState] = useState<'verifying' | 'authorized' | 'unauthorized'>('verifying');

  useEffect(() => {
    // If Firebase is still figuring out the user, do nothing yet.
    if (isUserLoading) {
      setAuthState('verifying');
      return;
    }

    // If there is no user, they are unauthorized.
    if (!user) {
      setAuthState('unauthorized');
      router.replace('/login');
      return;
    }

    // If there is a user, verify their authorization.
    let isMounted = true;

    const verifyUser = async () => {
      try {
        const isAuthorized = await getOrCreateUser(user);
        if (isMounted) {
          if (isAuthorized) {
            setAuthState('authorized');
          } else {
            // User is not in the allowlist.
            toast({
              variant: "destructive",
              title: "Akses Ditolak",
              description: "Anda tidak memiliki izin untuk melihat halaman ini.",
            });
            if (auth) {
              await signOut(auth);
            }
            setAuthState('unauthorized');
            // No need to router.replace here, the change in user state will trigger it.
          }
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Authorization check failed unexpectedly:", error.message);
          toast({
            variant: "destructive",
            title: "Error Verifikasi",
            description: "Gagal memverifikasi otorisasi Anda. Silakan coba lagi.",
          });
          if (auth) {
            await signOut(auth);
          }
          setAuthState('unauthorized');
        }
      }
    };
    
    verifyUser();
      
    return () => {
      isMounted = false;
    };

  }, [user, isUserLoading, auth, router, toast]);

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

  // For 'unauthorized' state. The effect already handles redirection.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      <p className="text-muted-foreground">Akses ditolak. Mengalihkan ke halaman login...</p>
    </div>
  );
}
