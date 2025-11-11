
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { PerfumeCard } from '@/components/perfume-card';
import { collection } from 'firebase/firestore';
import type { Perfume } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchX } from 'lucide-react';

function SearchResults() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const perfumesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'perfumes');
  }, [firestore]);

  const { data: perfumes, isLoading } = useCollection<Perfume>(perfumesCollection);

  const filteredPerfumes = useMemo(() => {
    if (!perfumes) return [];
    if (!searchQuery) return [];

    const lowercasedQuery = searchQuery.toLowerCase();

    return perfumes.filter(perfume => 
      perfume.namaParfum.toLowerCase().includes(lowercasedQuery) ||
      perfume.jenisAroma.toLowerCase().includes(lowercasedQuery) ||
      perfume.deskripsiParfum.toLowerCase().includes(lowercasedQuery) ||
      perfume.topNotes.toLowerCase().includes(lowercasedQuery) ||
      perfume.middleNotes.toLowerCase().includes(lowercasedQuery) ||
      perfume.baseNotes.toLowerCase().includes(lowercasedQuery) ||
      perfume.penggunaan.toLowerCase().includes(lowercasedQuery) ||
      perfume.sex.toLowerCase().includes(lowercasedQuery) ||
      perfume.lokasi.toLowerCase().includes(lowercasedQuery) ||
      perfume.kualitas.toLowerCase().includes(lowercasedQuery)
    );
  }, [perfumes, searchQuery]);

  return (
    <main className="container mx-auto px-4 md:px-6 py-12 min-h-[calc(100vh-20rem)]">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight">
                Hasil Pencarian
            </h1>
            {searchQuery && (
                <p className="mt-2 text-lg text-muted-foreground">
                    Menampilkan hasil untuk: <span className="font-semibold text-primary">"{searchQuery}"</span>
                </p>
            )}
        </div>
        
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
            </div>
        ) : filteredPerfumes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 animate-in fade-in-0 duration-500">
                {filteredPerfumes.map((perfume) => (
                    <PerfumeCard key={perfume.id} perfume={perfume} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 flex flex-col items-center">
                <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                    Tidak ada parfum yang cocok dengan pencarian Anda.
                </p>
                 <p className="text-muted-foreground mt-2">Coba kata kunci yang berbeda atau lebih umum.</p>
            </div>
        )}
    </main>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
             <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-6 w-80 mx-auto mt-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
                </div>
             </div>
        }>
            <SearchResults />
        </Suspense>
    )
}
