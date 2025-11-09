'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.561,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const [isSigningIn, setIsSigningIn] = useState(true); // Start as true to handle initial check

  useEffect(() => {
    console.log("LoginPage: useEffect triggered.", { isUserLoading, hasUser: !!user });
    // If user is found, redirect to dashboard.
    if (!isUserLoading && user) {
      console.log("LoginPage: User found, redirecting to /dashboard.");
      router.push('/dashboard');
      return;
    }

    // If still loading user status, wait.
    if (isUserLoading) {
      console.log("LoginPage: Still loading user, waiting.");
      return;
    }
    
    // If not loading and no user, process potential redirect result.
    if (auth) {
      console.log("LoginPage: Checking for redirect result.");
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            console.log("LoginPage: getRedirectResult successful.", { user: result.user });
            // The `onAuthStateChanged` listener in FirebaseProvider will handle the user state update.
            // The next run of this effect will catch `if (user)` and redirect.
          } else {
            console.log("LoginPage: No redirect result found. Showing login page.");
          }
          // If no user and no redirect result, it means we should show the login page.
          setIsSigningIn(false);
        })
        .catch((error) => {
          console.error('LoginPage: Error processing redirect result:', error);
          setIsSigningIn(false); // Stop loading on error
        });
    } else {
        console.log("LoginPage: Auth service not available. Showing login page.");
        // If auth service is not available, stop loading.
        setIsSigningIn(false);
    }
  }, [user, isUserLoading, auth, router]);

  const handleSignIn = async () => {
    if (!auth) {
        console.error("LoginPage: handleSignIn called but auth service is not available.");
        return;
    }
    console.log("LoginPage: Starting sign-in with redirect.");
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  // While checking for redirect result or waiting for user state to be confirmed
  if (isSigningIn || isUserLoading) {
    console.log("LoginPage: Rendering loading indicator.", { isSigningIn, isUserLoading });
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Mempersiapkan sesi Anda...</p>
      </div>
    );
  }

  // Render login page only if not loading and no user is found.
  console.log("LoginPage: Rendering login form.");
  return (
    <div className="w-full min-h-[calc(100vh-10rem)] lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-headline">Selamat Datang Kembali</CardTitle>
            <CardDescription>
              Masuk untuk mengelola koleksi M Katalog Parfum Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button variant="outline" className="w-full" onClick={handleSignIn} disabled={isSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Masuk dengan Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://picsum.photos/seed/login-page/1200/1800"
          alt="Image"
          width="1200"
          height="1800"
          data-ai-hint="abstract perfume"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
