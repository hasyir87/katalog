'use client';

import type { Perfume } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Droplets, Flower, Milestone, User, Clock, Building, Sparkle, Edit, Trash2, X, Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
import { deletePerfume } from "@/lib/actions";
import { useIsMobile } from "@/hooks/use-mobile";


interface PerfumeDetailViewProps {
  perfume: Perfume | null;
  onClose?: () => void;
}


export function PerfumeDetailView({ perfume, onClose }: PerfumeDetailViewProps) {
    const isMobile = useIsMobile();
    
    // This component will now only be rendered on desktop when a perfume is selected.
    // The placeholder is only for mobile sheet or initial state where the component might be mounted but has no perfume.
    if (!perfume) {
        // This state is now less common on desktop but good for robustness and mobile.
        return (
            <div className="h-full flex items-center justify-center bg-secondary/30 rounded-lg border-2 border-dashed">
                <div className="text-center text-muted-foreground p-6">
                    <Info className="mx-auto h-10 w-10 mb-4 text-primary/50" />
                    <h3 className="font-semibold text-lg text-foreground/80">Pilih Parfum</h3>
                    <p className="mt-1 text-sm">Klik pada parfum dari tabel untuk melihat detailnya di sini.</p>
                </div>
            </div>
        );
    }
    
    const details = [
        { icon: Droplets, label: "Top Notes", value: perfume.topNotes },
        { icon: Flower, label: "Middle Notes", value: perfume.middleNotes },
        { icon: Milestone, label: "Base Notes", value: perfume.baseNotes },
        { icon: User, label: "Sex", value: perfume.sex === 'Male' ? 'Pria' : perfume.sex === 'Female' ? 'Wanita' : 'Unisex' },
        { icon: Clock, label: "Penggunaan", value: perfume.penggunaan },
        { icon: Building, label: "Lokasi", value: perfume.lokasi },
        { icon: Sparkle, label: "Kualitas", value: perfume.kualitas },
    ];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <Badge variant="secondary" className="mb-2">{perfume.jenisAroma}</Badge>
                    <CardTitle className="font-headline text-2xl">{perfume.namaParfum}</CardTitle>
                </div>
                 <div className="flex gap-2">
                    <DeleteConfirmation perfumeId={perfume.id} perfumeName={perfume.namaParfum} onSuccess={onClose} />
                    <Button asChild size="icon" variant="outline">
                        <Link href={`/dashboard/edit/${perfume.id}`} title={`Edit ${perfume.namaParfum}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Perfume</span>
                        </Link>
                    </Button>
                    {(isMobile || onClose) && ( // Show close button on mobile OR if onClose is provided
                        <Button onClick={onClose} size="icon" variant="ghost">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                <CardDescription>{perfume.deskripsiParfum}</CardDescription>
                <Separator className="my-4" />
                <h4 className="font-semibold mb-3 text-sm">Details</h4>
                <ul className="grid grid-cols-1 gap-y-3 text-sm">
                    {details.map(detail => (
                        <li key={detail.label} className="flex items-start">
                            <detail.icon className="h-4 w-4 mr-3 mt-0.5 text-primary shrink-0" />
                            <div>
                                <span className="font-medium text-muted-foreground">{detail.label}</span>
                                <p className="text-foreground">{detail.value}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}


const DeleteConfirmation = ({ perfumeId, perfumeName, onSuccess }: { perfumeId: string; perfumeName: string; onSuccess?: () => void; }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePerfume(perfumeId);
      toast({
        title: 'Success!',
        description: `Perfume "${perfumeName}" has been deleted.`,
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete perfume.',
      });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive_outline" title={`Delete ${perfumeName}`}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Perfume</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the perfume <span className="font-bold">"{perfumeName}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
