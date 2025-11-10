'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Loader2, ShieldAlert } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { allowedUsers } from '@/lib/auth-allowlist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is done and there's no user, redirect to login page.
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // While Firebase is determining the auth state, show a loader.
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memverifikasi sesi Anda...</p>
      </div>
    );
  }

  // If there is a user, check if they are in the allowlist.
  if (user) {
    const isAuthorized = user.email && allowedUsers.includes(user.email);

    if (isAuthorized) {
      // If authorized, render the dashboard content.
      return <>{children}</>;
    } else {
      // If not authorized, show an access denied message.
      const handleForceSignOut = async () => {
        if (auth) {
            await signOut(auth);
            // The useEffect above will handle the redirect once the user state becomes null.
        }
      };

      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-secondary/30">
            <Card className="max-w-md text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-headline text-destructive">
                        <ShieldAlert className="h-7 w-7" />
                        Akses Ditolak
                    </CardTitle>
                    <CardDescription>
                       Akun Anda ({user.email}) tidak memiliki izin untuk mengakses halaman ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
                    </p>
                    <Button onClick={handleForceSignOut} variant="destructive">
                        Keluar
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
    }
  }

  // This is a fallback case, typically shown briefly during the redirect.
  return (
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Mengalihkan...</p>
    </div>
  );
}
