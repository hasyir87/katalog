'use client';

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { PerfumeDetailView } from "@/components/dashboard/perfume-detail-view";
import { Button } from "@/components/ui/button";
import { ExcelImporter } from "@/components/dashboard/excel-importer";
import { ExcelExporter } from "@/components/dashboard/excel-exporter";
import { AIChat } from "@/components/ai-chat";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Wand2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Perfume } from "@/lib/types";
import { deleteManyPerfumes } from "@/lib/actions";

interface DashboardClientProps {
  data: Perfume[];
}

export function DashboardClient({ data }: DashboardClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
    const [rowSelection, setRowSelection] = useState({});
    const isMobile = useIsMobile();

    const handleRowClick = (perfume: Perfume) => {
        setSelectedPerfume(prev => (prev && prev.id === perfume.id ? null : perfume));
    };

    const handleCloseDetail = () => {
        setSelectedPerfume(null);
    };

    const handleDeleteSelected = async () => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) {
            toast({ variant: "destructive", title: "Tidak ada parfum yang dipilih." });
            return;
        }

        try {
            await deleteManyPerfumes(selectedIds);
            toast({
                title: "Berhasil!",
                description: `${selectedIds.length} parfum telah dihapus.`,
            });
            setRowSelection({});
            setSelectedPerfume(null);
            router.refresh(); // Memuat ulang data dari server

        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Gagal menghapus",
                description: "Terjadi kesalahan saat menghapus parfum yang dipilih.",
            });
        }
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
            data={data}
            onRowClick={handleRowClick}
            selectedPerfumeId={selectedPerfume?.id}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
        />
    );

    const numSelected = Object.keys(rowSelection).length;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                <div className="flex justify-end items-center gap-2">
                    {numSelected > 0 ? (
                        <div className="flex items-center gap-2 w-full">
                             <span className="text-sm text-muted-foreground">{numSelected} dipilih</span>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button variant="destructive" size="sm">
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
                         </div>
                     ) : (
                        <>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
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
                            <ExcelImporter onUploadSuccess={() => router.refresh()}/>
                            <ExcelExporter data={data} />
                        </>
                     )}
                </div>
            </div>

            <div className="flex-grow grid gap-6 overflow-hidden" style={{ gridTemplateColumns: selectedPerfume && !isMobile ? '2fr 1fr' : '1fr' }}>
                <div className="h-full overflow-y-auto">
                    {isMobile && selectedPerfume ? (
                         <Sheet open={!!selectedPerfume} onOpenChange={(open) => !open && handleCloseDetail()}>
                             <SheetTrigger asChild><div style={{display: "none"}} /></SheetTrigger>
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
                    <div className="h-full overflow-y-auto border-l -ml-3 pl-3">
                        {detailView}
                    </div>
                )}
            </div>
        </div>
    );
}
