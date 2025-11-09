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

  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If auth is still loading, do nothing yet.
    if (isUserLoading) {
      return;
    }

    // If there's no user and we are done verifying, redirect to login.
    if (!user) {
      setIsVerifying(false);
      router.replace('/login');
      return;
    }

    // If we have a user, but we are still in the verification process.
    if (user && isVerifying) {
      const verifyUser = async () => {
        try {
          await getOrCreateUser(user);
          // If the above line doesn't throw, the user is authorized.
          setIsAuthorized(true);
        } catch (error: any) {
          // If it throws, the user is not in the allowlist.
          console.error("Authorization Error:", error.message);
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          });
          setIsAuthorized(false);
          // Sign out the unauthorized user and redirect.
          if (auth) {
            await signOut(auth);
          }
          // The onAuthStateChanged listener will handle the redirect to /login
          // by setting user to null, which is caught at the top of this useEffect.
        } finally {
          // IMPORTANT: Mark verification as complete to prevent re-running this logic.
          setIsVerifying(false);
        }
      };

      verifyUser();
    }

  }, [user, isUserLoading, isVerifying, auth, router, toast]);

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

  // If verification is done and user is not authorized, show a redirecting message.
  // This state is briefly visible while signOut and router redirection complete.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      <p className="text-muted-foreground">Akses ditolak. Mengalihkan...</p>
    </div>
  );
}
