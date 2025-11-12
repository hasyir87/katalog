'use client';

import { notFound } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Perfume } from '@/lib/types';
import { PerfumeDetailsClient } from './perfume-details-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { use } from 'react';


export default function PerfumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const firestore = useFirestore();
    const resolvedParams = use(params);

    const perfumeRef = useMemoFirebase(() => {
        if (!firestore || !resolvedParams.id) return null;
        return doc(firestore, 'perfumes', resolvedParams.id);
    }, [firestore, resolvedParams.id]);

    const { data: perfume, isLoading, error } = useDoc<Perfume>(perfumeRef);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-12 md:py-16">
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }
    
    if (!isLoading && !perfume) {
        notFound();
    }

    if (error) {
        // You might want to show a more user-friendly error message
        return <div className="text-center py-10 text-destructive">Error loading perfume details.</div>;
    }


    return (
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
           {perfume && <PerfumeDetailsClient perfume={perfume} />}
        </div>
    );
}
