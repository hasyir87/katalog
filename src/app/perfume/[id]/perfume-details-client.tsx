
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { ArrowLeft, Users, Star, Leaf } from 'lucide-react';
import type { Perfume } from '@/lib/types';
import { getAllPerfumes } from '@/lib/actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Helper component for displaying a detail row
const AromaNote = ({ label, value }: { label: string; value: string | undefined; }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || 'N/A'}</p>
    </div>
);

export const PerfumeDetailsClient = ({ perfumeId }: { perfumeId: string }) => {
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        setLoading(true);
        const allPerfumes = await getAllPerfumes(''); 
        const foundPerfume = allPerfumes.find(p => p.id === perfumeId);

        if (foundPerfume) {
          setPerfume(foundPerfume);
        } else {
          setError('Parfum tidak ditemukan.');
        }
      } catch (e: any) {
        setError('Gagal mengambil data parfum.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfume();
  }, [perfumeId]);

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/perfume/${perfumeId}`
    : '';

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Memuat detail parfum...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }
  
  if (!perfume) {
      return <div className="text-center">Parfum tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
             <div className="mb-8">
                <Link href="/search">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Katalog
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                {/* Left Column: Perfume Information */}
                <div className="md:col-span-3">
                    <div className="space-y-6">
                        <div>
                             <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">{perfume.namaParfum}</h1>
                            <p className="mt-4 text-lg text-muted-foreground">{perfume.deskripsiParfum || 'Deskripsi tidak tersedia.'}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Badge variant="default" className="text-sm py-1 px-3"><Users className="h-4 w-4 mr-2"/> {perfume.sex}</Badge>
                            <Badge variant="default" className="text-sm py-1 px-3"><Leaf className="h-4 w-4 mr-2"/> {perfume.jenisAroma}</Badge>
                        </div>

                        <Separator className="my-6" />

                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Komposisi Aroma</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <AromaNote label="Top Notes" value={perfume.topNotes} />
                                <AromaNote label="Middle Notes" value={perfume.middleNotes} />
                                <AromaNote label="Base Notes" value={perfume.baseNotes} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: QR Code Visual */}
                <div className="md:col-span-2">
                    <div className="sticky top-28 p-8 border rounded-xl bg-card shadow-sm flex flex-col items-center justify-center">
                         <h2 className="text-xl font-bold mb-4">Scan & Share</h2>
                         <div className="p-4 bg-white rounded-lg">
                             <QRCode
                                value={publicUrl}
                                size={200}
                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground break-all mt-4 text-center">
                            {publicUrl}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
