'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DashboardClient } from "./_components/dashboard-client";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Perfume } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const perfumesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'perfumes'), orderBy('namaParfum', 'asc'));
    }, [firestore]);

    const { data: perfumes, isLoading } = useCollection<Perfume>(perfumesQuery);

    if (isLoading) {
        return <Skeleton className="h-[60vh] w-full" />;
    }

    // Tambahkan nomor urut ke setiap objek parfum
    const numberedPerfumes = (perfumes || []).map((p, index) => ({ ...p, number: index + 1 }));

    return <DashboardClient data={numberedPerfumes} initialSearchQuery={searchQuery} />;
}


export default function DashboardPage() {
    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col">
            <div className="flex-shrink-0 border-b">
                 <div className="container mx-auto py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold font-headline tracking-tight">Dasbor Parfum</h1>
                            <p className="text-muted-foreground">Kelola koleksi M Katalog Parfum Anda.</p>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/add">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Parfum Baru
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-grow container mx-auto py-6 overflow-hidden">
                <DashboardContent />
            </div>
        </div>
    );
}
