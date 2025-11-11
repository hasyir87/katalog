'use client';

import { useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Loader2, Wand2 } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Perfume } from "@/lib/types";
import { ExcelImporter } from "@/components/dashboard/excel-importer";
import { useState } from "react";
import { PerfumeDetailView } from "@/components/dashboard/perfume-detail-view";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AIChat } from "@/components/ai-chat";


export default function DashboardPage() {
    const firestore = useFirestore();
    const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
    const isMobile = useIsMobile();
    
    const perfumesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'perfumes');
    }, [firestore]);

    const { data: perfumes, isLoading, error } = useCollection<Perfume>(perfumesCollection);

    const handleRowClick = (perfume: Perfume) => {
        // If the same perfume is clicked again, deselect it. Otherwise, select the new one.
        setSelectedPerfume(prev => (prev && prev.id === perfume.id ? null : perfume));
    };

    const handleCloseDetail = () => {
        setSelectedPerfume(null);
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

    const detailView = (
        <PerfumeDetailView 
            perfume={selectedPerfume} 
            onClose={handleCloseDetail}
        />
    );
    
    const dataTable = (
        <DataTable 
            columns={columns} 
            data={perfumes ?? []}
            onRowClick={handleRowClick}
            selectedPerfumeId={selectedPerfume?.id}
        />
    );

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
                             <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline">
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        AI Chat
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0" side="right">
                                   <div className="h-full py-6">
                                     <AIChat />
                                   </div>
                                </SheetContent>
                            </Sheet>
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
                <div className={cn("grid gap-6 h-full py-6", selectedPerfume && !isMobile ? "grid-cols-3" : "grid-cols-1")}>
                    <div className={cn("h-full overflow-y-auto", selectedPerfume && !isMobile ? "col-span-2" : "col-span-1")}>
                        {isMobile && selectedPerfume ? (
                             <Sheet open={!!selectedPerfume} onOpenChange={(open) => !open && handleCloseDetail()}>
                                 <SheetTrigger asChild>
                                     <div style={{display: "none"}} />
                                 </SheetTrigger>
                                 <SheetContent side="right" className="w-full sm:max-w-md p-0">
                                     {detailView}
                                 </SheetContent>
                            </Sheet>
                        ) : null}
                        {dataTable}
                    </div>
                    {selectedPerfume && !isMobile && (
                        <div className="col-span-1 h-full overflow-y-auto">
                            {detailView}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
