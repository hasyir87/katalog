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

export default function DashboardPage() {
    const firestore = useFirestore();
    
    const perfumesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'perfumes');
    }, [firestore]);

    const { data: perfumes, isLoading } = useCollection<Perfume>(perfumesCollection);

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
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
            <DataTable columns={columns} data={perfumes ?? []} />
        </div>
    );
}
