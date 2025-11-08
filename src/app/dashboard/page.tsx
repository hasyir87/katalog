import { getPerfumes } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";

export default async function DashboardPage() {
    const perfumes = await getPerfumes();

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
            <DataTable columns={columns} data={perfumes} />
        </div>
    );
}
