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

export default function DashboardPage() {
    const firestore = useFirestore();
    
    const perfumesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'perfumes');
    }, [firestore]);

    const { data: perfumes, isLoading, error } = useCollection<Perfume>(perfumesCollection);

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
     if (error) {
        // This is a basic error display. In a real app, you might want a more user-friendly component.
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
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
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
            <DataTable columns={columns} data={perfumes ?? []} />
        </div>
    );
}
