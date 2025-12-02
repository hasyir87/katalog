
import { PerfumeDetailsClient } from './perfume-details-client';

// Halaman Detail Parfum - Server Component
// Logika pengambilan data telah dipindahkan ke dalam PerfumeDetailsClient.
// Komponen server ini sekarang hanya bertanggung jawab untuk mengekstrak ID dari URL
// dan meneruskannya ke komponen klien.
export default function PerfumeDetailPage({ params }: { params: { id: string } }) {

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            <PerfumeDetailsClient perfumeId={params.id} />
        </div>
    );
}
