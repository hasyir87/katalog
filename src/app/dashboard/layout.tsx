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
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is loaded
    }

    if (!user) {
      // If no user, redirect to login
      router.push('/login');
      return;
    }

    // User exists, now verify authorization
    getOrCreateUser(user)
      .then(() => {
        // User is authorized
        setIsAuthorized(true);
        setIsVerifying(false);
      })
      .catch((error) => {
        // User is not authorized
        console.error("Authorization Error:", error.message);
        toast({
          variant: "destructive",
          title: "Akses Ditolak",
          description: error.message || "Anda tidak memiliki izin untuk mengakses halaman ini.",
        });
        
        // Mark as not authorized and stop verification
        setIsAuthorized(false);
        setIsVerifying(false);

        // Sign out and redirect
        if (auth) {
          signOut(auth).finally(() => {
            router.push('/login');
          });
        } else {
          router.push('/login');
        }
      });
  }, [user, isUserLoading, router, auth, toast]);

  // Show a loader while Firebase is loading OR while we are verifying the user.
  if (isUserLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memverifikasi sesi Anda...</p>
      </div>
    );
  }
  
  // If verification is complete and user is authorized, show the dashboard.
  // Otherwise, the effect will have already started the redirection.
  if (isAuthorized) {
      return <>{children}</>;
  }

  // Fallback while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      <p className="text-muted-foreground">Mengalihkan ke halaman login...</p>
    </div>
  );
}
