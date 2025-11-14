
import { getPerfumeById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { PerfumeDetailsClient } from './perfume-details-client';


// Halaman Detail Parfum - Server Component
export default async function PerfumeDetailPage({ params }: { params: { id: string } }) {
    const perfume = await getPerfumeById(params.id);

    if (!perfume) {
        notFound(); // Tampilkan halaman 404 jika parfum tidak ditemukan
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            <PerfumeDetailsClient perfume={perfume} />
        </div>
    );
}
