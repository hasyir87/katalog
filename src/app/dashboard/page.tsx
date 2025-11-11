'use client';

import { useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Perfume } from "@/lib/types";
import { ExcelImporter } from "@/components/dashboard/excel-importer";
import { useState } from "react";
import { PerfumeDetailView } from "@/components/dashboard/perfume-detail-view";

export default function DashboardPage() {
    const firestore = useFirestore();
    const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
    
    const perfumesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'perfumes');
    }, [firestore]);

    const { data: perfumes, isLoading, error } = useCollection<Perfume>(perfumesCollection);

    const handleRowClick = (perfume: Perfume) => {
        setSelectedPerfume(perfume);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
     if (error) {
        return (
            <div className="container mx-auto py-10">
                <div className="text-center text-red-500">
                    <h2 className="text-xl font-bold">Error</h2>
                    <p>Failed to load perfume data.</p>
                    <pre className="mt-2 text-sm text-left bg-red-100 p-2 rounded">{error.message}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col">
            <div className="flex-shrink-0 border-b">
                 <div className="container mx-auto py-4">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-headline tracking-tight">Dasbor Parfum</h1>
                            <p className="text-muted-foreground">Kelola koleksi M Katalog Parfum Anda.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ExcelImporter />
                            <Button asChild>
                                <Link href="/dashboard/add">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Parfum Baru
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow container mx-auto overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[2fr_1fr] gap-6 h-full py-6">
                    <div className="h-full overflow-y-auto">
                        <DataTable 
                            columns={columns} 
                            data={perfumes ?? []}
                            onRowClick={handleRowClick}
                            selectedPerfumeId={selectedPerfume?.id}
                        />
                    </div>
                    <div className="hidden md:block h-full overflow-y-auto">
                        <PerfumeDetailView perfume={selectedPerfume} />
                    </div>
                </div>
            </div>
        </div>
    );
}
