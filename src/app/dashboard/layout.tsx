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
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) {
      return; // Tunggu sampai Firebase selesai memuat status pengguna
    }

    if (!user) {
      // Jika tidak ada pengguna setelah pemuatan selesai, alihkan ke login
      router.push('/login');
    } else {
      // Jika ada pengguna, verifikasi/buat profil di database dan periksa allowlist
      getOrCreateUser(user)
        .then(() => {
          // Profil pengguna dikonfirmasi & diizinkan, izinkan akses ke dasbor
          setIsVerifying(false);
        })
        .catch((error) => {
          console.error("Authorization Error:", error.message);
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: error.message || "Anda tidak memiliki izin untuk mengakses halaman ini.",
          });
          
          // Sign out the user from Firebase client-side
          if (auth) {
            signOut(auth).then(() => {
              router.push('/login'); // Kembali ke login setelah sign out
            });
          } else {
            router.push('/login'); // Fallback if auth is not available
          }
        });
    }
  }, [user, isUserLoading, router, auth, toast]);

  // Tampilkan pemuat saat Firebase memuat ATAU saat kami memverifikasi profil database & allowlist
  if (isUserLoading || isVerifying) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memverifikasi sesi Anda...</p>
        </div>
    );
  }

  // Jika pemuatan selesai, pengguna ada, dan verifikasi selesai, tampilkan konten dasbor
  return <>{children}</>;
}
