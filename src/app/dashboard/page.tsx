
'use client';

import { useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Loader2, Wand2, Trash2 } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { Perfume } from "@/lib/types";
import { ExcelImporter } from "@/components/dashboard/excel-importer";
import { ExcelExporter } from "@/components/dashboard/excel-exporter";
import { useState } from "react";
import { PerfumeDetailView } from "@/components/dashboard/perfume-detail-view";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AIChat } from "@/components/ai-chat";
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
    const [rowSelection, setRowSelection] = useState({});
    const isMobile = useIsMobile();
    
    const perfumesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'perfumes');
    }, [firestore]);

    const { data: perfumes, isLoading, error, refetch } = useCollection<Perfume>(perfumesCollection);

    const handleRowClick = (perfume: Perfume) => {
        setSelectedPerfume(prev => (prev && prev.id === perfume.id ? null : perfume));
    };

    const handleCloseDetail = () => {
        setSelectedPerfume(null);
    };

    const handleDeleteSelected = async () => {
        if (!firestore || !perfumes) return;

        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) {
            toast({ variant: "destructive", title: "Tidak ada parfum yang dipilih." });
            return;
        }

        try {
            const batch = writeBatch(firestore);
            selectedIds.forEach(id => {
                const docRef = doc(firestore, 'perfumes', id);
                batch.delete(docRef);
            });
            await batch.commit();

            toast({
                title: "Berhasil!",
                description: `${selectedIds.length} parfum telah dihapus.`,
            });
            setRowSelection({});
            setSelectedPerfume(null);
            refetch();

        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Gagal menghapus",
                description: "Terjadi kesalahan saat menghapus parfum yang dipilih.",
            });
        }
    }


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
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
        />
    );

    const numSelected = Object.keys(rowSelection).length;

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
                             {numSelected > 0 ? (
                                <>
                                    <span className="text-sm text-muted-foreground">{numSelected} dipilih</span>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tindakan ini akan menghapus {numSelected} parfum secara permanen. Tindakan ini tidak dapat dibatalkan.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Batal</AlertDialogCancel>
                                          <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">
                                            Hapus
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                </>
                             ) : (
                                <>
                                     <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline">
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                AI Chat
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 flex flex-col" side="right">
                                           <SheetHeader className="p-6 border-b flex-shrink-0">
                                               <SheetTitle className="flex items-center gap-2 font-headline">
                                                   <Wand2 className="h-6 w-6 text-primary" />
                                                   AI Assistant
                                               </SheetTitle>
                                               <SheetDescription>
                                                    Chat with the AI to query the perfume database or analyze files.
                                               </SheetDescription>
                                           </SheetHeader>
                                           <div className="flex-grow overflow-y-auto">
                                             <AIChat />
                                           </div>
                                        </SheetContent>
                                    </Sheet>
                                    <ExcelImporter />
                                    <ExcelExporter data={perfumes ?? []} />
                                    <Button asChild>
                                        <Link href="/dashboard/add">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Tambah Parfum Baru
                                        </Link>
                                    </Button>
                                </>
                             )}
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
                                     <SheetHeader className="p-6 pb-0">
                                        <SheetTitle>{selectedPerfume.namaParfum}</SheetTitle>
                                        <SheetDescription>{selectedPerfume.jenisAroma}</SheetDescription>
                                     </SheetHeader>
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
