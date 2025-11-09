'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Hanya membuat keputusan setelah status autentikasi selesai dimuat.
    if (isUserLoading) {
      // Jangan lakukan apa-apa selagi Firebase masih memeriksa status login.
      return;
    }

    // Setelah pemuatan selesai, jika tidak ada pengguna, arahkan ke halaman login.
    if (!user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Tampilkan indikator pemuatan jika Firebase sedang memuat atau jika belum ada pengguna
  // (karena pengalihan akan segera terjadi). Ini mencegah konten dasbor berkedip sesaat.
  if (isUserLoading || !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat dasbor...</p>
        </div>
    );
  }

  // Jika pemuatan selesai dan ada pengguna, tampilkan konten dasbor.
  return <>{children}</>;
}
