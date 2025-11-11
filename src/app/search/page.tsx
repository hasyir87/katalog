
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { PerfumeCard } from '@/components/perfume-card';
import { collection } from 'firebase/firestore';
import type { Perfume } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function SearchResults() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchQuery = searchParams.get('q') || '';
  const kualitasFilters = searchParams.getAll('kualitas');
  const sexFilters = searchParams.getAll('sex');

  const perfumesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'perfumes');
  }, [firestore]);

  const { data: perfumes, isLoading } = useCollection<Perfume>(perfumesCollection);

  const handleFilterChange = (filterType: 'kualitas' | 'sex', value: string, checked: boolean) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    
    // Get all current values for the filter type
    const allValues = currentParams.getAll(filterType);

    if (checked) {
      if (!allValues.includes(value)) {
        currentParams.append(filterType, value);
      }
    } else {
      currentParams.delete(filterType);
      allValues.filter(v => v !== value).forEach(v => currentParams.append(filterType, v));
    }

    router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
  };


  const filteredPerfumes = useMemo(() => {
    if (!perfumes) return [];

    let tempPerfumes = [...perfumes];
    
    // Main search query filtering
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        
        const isMaleQuery = lowercasedQuery.includes('pria') || lowercasedQuery.includes('male');
        const isFemaleQuery = lowercasedQuery.includes('wanita') || lowercasedQuery.includes('female');

        tempPerfumes = tempPerfumes.filter(perfume => {
            const sex = perfume.sex.toLowerCase();
            let sexMatch = false;

            if (isMaleQuery) {
                sexMatch = sex === 'male' || sex === 'unisex';
            } else if (isFemaleQuery) {
                sexMatch = sex === 'female' || sex === 'unisex';
            }
             
            // If there's a specific gender query, we prioritize that match.
            // If not, we fall back to a general text search across fields.
            if (sexMatch) return true;

            // Avoid re-matching gender if it was already handled
            if (isMaleQuery || isFemaleQuery) return false;

            return (
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
            )
        });
    }

    // Kualitas filter
    if (kualitasFilters.length > 0) {
      tempPerfumes = tempPerfumes.filter(perfume =>
        kualitasFilters.includes(perfume.kualitas)
      );
    }
    
    // Sex filter
    if (sexFilters.length > 0) {
      tempPerfumes = tempPerfumes.filter(perfume =>
        sexFilters.includes(perfume.sex)
      );
    }

    return tempPerfumes;
  }, [perfumes, searchQuery, kualitasFilters, sexFilters]);
  

  const FilterPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-headline">Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Kualitas</h4>
          <div className="space-y-2">
            {['Premium', 'Extrait'].map(kualitas => (
              <div key={kualitas} className="flex items-center space-x-2">
                <Checkbox
                  id={`kualitas-${kualitas}`}
                  checked={kualitasFilters.includes(kualitas)}
                  onCheckedChange={(checked) => handleFilterChange('kualitas', kualitas, !!checked)}
                />
                <Label htmlFor={`kualitas-${kualitas}`}>{kualitas}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Sex</h4>
          <div className="space-y-2">
            {[{value: 'Female', label: 'Wanita'}, {value: 'Male', label: 'Pria'}, {value: 'Unisex', label: 'Unisex'}].map(s => (
              <div key={s.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`sex-${s.value}`}
                  checked={sexFilters.includes(s.value)}
                  onCheckedChange={(checked) => handleFilterChange('sex', s.value, !!checked)}
                />
                <Label htmlFor={`sex-${s.value}`}>{s.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
        
        <div className="grid lg:grid-cols-4 gap-8 items-start">
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
                <FilterPanel />
            </div>
            <div className="lg:col-span-3">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)}
                    </div>
                ) : filteredPerfumes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in-0 duration-500">
                        {filteredPerfumes.map((perfume) => (
                            <PerfumeCard key={perfume.id} perfume={perfume} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center col-span-full bg-secondary/30 rounded-lg">
                        <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-xl text-muted-foreground">
                            Tidak ada parfum yang cocok.
                        </p>
                         <p className="text-muted-foreground mt-2">Coba kata kunci atau filter yang berbeda.</p>
                    </div>
                )}
            </div>
        </div>
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

    