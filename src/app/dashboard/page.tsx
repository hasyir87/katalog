
import { getAllPerfumes } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DashboardClient } from "./_components/dashboard-client";
import type { Perfume } from "@/lib/types";

export default async function DashboardPage({ 
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {

    const query = typeof searchParams?.q === 'string' ? searchParams.q : '';
    const perfumes: Perfume[] = await getAllPerfumes(query);

    // Tambahkan nomor urut ke setiap objek parfum
    const numberedPerfumes = perfumes.map((p, index) => ({ ...p, number: index + 1 }));

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
                <DashboardClient data={numberedPerfumes} />
            </div>
        </div>
    );
}
