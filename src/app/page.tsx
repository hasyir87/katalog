
'use client';
import { useState, useEffect } from 'react';
import { getAllPerfumes } from "@/lib/actions";
import type { Perfume } from "@/lib/types";
import { PerfumeCard } from "@/components/perfume-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchPerfumes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPerfumes = await getAllPerfumes(searchQuery);
        setPerfumes(fetchedPerfumes);
      } catch (e) {
        setError("Gagal memuat data parfum. Silakan coba lagi nanti.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerfumes();
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Judul Halaman */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {searchQuery ? `Hasil Pencarian untuk "${searchQuery}"` : "Jelajahi Katalog Kami"}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:mt-4">
          Temukan aroma yang sempurna untuk setiap momen.
        </p>
      </div>

      {/* Tampilan Loading, Error, atau Konten */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-lg text-destructive">{error}</p>
        </div>
      ) : perfumes.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {perfumes.map((perfume) => (
            <PerfumeCard key={perfume.id} perfume={perfume} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">Tidak ada parfum yang cocok dengan pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}
