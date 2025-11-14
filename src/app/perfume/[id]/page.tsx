
import { getPerfumeById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Komponen untuk menampilkan setiap detail parfum dengan label
function PerfumeDetail({ label, value }: { label: string; value: string | undefined }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-2 gap-4">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value}</dd>
        </div>
    );
}

// Halaman Detail Parfum
export default async function PerfumeDetailPage({ params }: { params: { id: string } }) {
    const perfume = await getPerfumeById(params.id);

    if (!perfume) {
        notFound(); // Tampilkan halaman 404 jika parfum tidak ditemukan
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg rounded-lg">
                <CardHeader className="bg-muted/30 p-6">
                    <CardTitle className="text-3xl font-headline tracking-tight">{perfume.namaParfum}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-1">{perfume.deskripsiParfum}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{perfume.kualitas}</Badge>
                            <Badge variant="secondary">{perfume.sex}</Badge>
                            <Badge variant="secondary">{perfume.jenisAroma}</Badge>
                        </div>

                        <Separator />

                        <dl className="space-y-4">
                            <PerfumeDetail label="Top Notes" value={perfume.topNotes} />
                            <PerfumeDetail label="Middle Notes" value={perfume.middleNotes} />
                            <PerfumeDetail label="Base Notes" value={perfume.baseNotes} />
                        </dl>

                        <Separator />

                        <dl className="space-y-4">
                            <PerfumeDetail label="Saran Penggunaan" value={perfume.penggunaan} />
                            <PerfumeDetail label="Lokasi / Acara" value={perfume.lokasi} />
                        </dl>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
