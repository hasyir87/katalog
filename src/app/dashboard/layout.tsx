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
    // 1. Wait until Firebase has determined the user's auth state.
    if (isUserLoading) {
      setAuthState('verifying');
      return;
    }

    // 2. If there's no user, they are unauthorized. Redirect them.
    if (!user) {
      setAuthState('unauthorized');
      router.replace('/login');
      return;
    }

    // 3. If there is a user, verify their authorization against our rules.
    let isMounted = true;
    const verifyUser = async () => {
      try {
        const isAuthorized = await getOrCreateUser(user);
        if (isMounted) {
          if (isAuthorized) {
            setAuthState('authorized');
          } else {
            // User is not in the allowlist.
            setAuthState('unauthorized');
            toast({
              variant: "destructive",
              title: "Akses Ditolak",
              description: "Anda tidak memiliki izin untuk melihat halaman ini.",
            });
            if (auth) {
              await signOut(auth);
            }
            // The change in user state after signOut will trigger a re-run of this effect,
            // which will then hit the `!user` condition and redirect.
          }
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Authorization check failed unexpectedly:", error.message);
          setAuthState('unauthorized');
          toast({
            variant: "destructive",
            title: "Error Verifikasi",
            description: "Gagal memverifikasi otorisasi Anda. Silakan coba lagi.",
          });
          if (auth) {
            await signOut(auth);
          }
        }
      }
    };
    
    // Only run the verification if we are in the initial 'verifying' state with a user object.
    if (authState === 'verifying') {
        verifyUser();
    }
      
    return () => {
      isMounted = false;
    };
    // This effect depends ONLY on the user object and its loading state.
    // It does not depend on its own state `authState`, preventing loops.
  }, [user, isUserLoading, auth, router, toast, authState]);

  // Render content based on the authorization state
  if (authState === 'authorized') {
    return <>{children}</>;
  }

  // For 'verifying' or 'unauthorized' states, show a loading spinner.
  // The redirection is handled by the effect, so this just covers the UI during that process.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">
        {authState === 'verifying' ? 'Memverifikasi sesi Anda...' : 'Akses ditolak. Mengalihkan...'}
      </p>
    </div>
  );
}
