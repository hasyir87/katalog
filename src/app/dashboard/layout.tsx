'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { getOrCreateUser } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Tunggu sampai Firebase selesai memuat status pengguna
    }

    if (!user) {
      // Jika tidak ada pengguna setelah pemuatan selesai, alihkan ke login
      router.push('/login');
    } else {
      // Jika ada pengguna, verifikasi/buat profil di database
      getOrCreateUser(user)
        .then(() => {
          // Profil pengguna dikonfirmasi, izinkan akses ke dasbor
          setIsVerifying(false);
        })
        .catch((error) => {
          console.error("Failed to get or create user profile:", error);
          // Mungkin tangani kesalahan ini, misalnya dengan logout atau menampilkan pesan
          router.push('/login'); // Kembali ke login jika profil tidak bisa dibuat
        });
    }
  }, [user, isUserLoading, router]);

  // Tampilkan pemuat saat Firebase memuat ATAU saat kami memverifikasi profil database
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
