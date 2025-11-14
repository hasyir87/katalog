
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { QrCodeDisplay } from '@/components/qr-code-display';
import type { Perfume } from '@/lib/types';
import { Droplets, Flower, Building, User, Clock, Sparkle, Milestone, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PerfumeDetailsClientProps {
    perfume: Perfume;
}

export function PerfumeDetailsClient({ perfume }: PerfumeDetailsClientProps) {
  const router = useRouter();

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
    <div className="grid md:grid-cols-[1fr_250px] gap-8 lg:gap-12 items-start">
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline tracking-tight text-primary">
            {perfume.namaParfum}
            </h1>
            <Badge variant="secondary">{perfume.jenisAroma}</Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          {perfume.deskripsiParfum}
        </p>
        <Separator />
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold font-headline">Details</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {details.map(detail => (
                  <li key={detail.label} className="flex items-start">
                      <detail.icon className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                      <div>
                          <span className="font-semibold text-sm">{detail.label}</span>
                          <p className="text-muted-foreground">{detail.value}</p>
                      </div>
                  </li>
              ))}
          </ul>
        </div>
      </div>
       <div className="flex flex-col items-center gap-6 sticky top-24">
        <Card className="w-full max-w-sm">
           <CardHeader>
              <CardTitle className="text-lg font-headline">Scent QR Code</CardTitle>
           </CardHeader>
           <CardContent className="flex flex-col items-center gap-4">
              <p className="text-sm text-center text-muted-foreground">Scan to discover more perfumes with the <span className="font-bold text-foreground">{perfume.jenisAroma}</span> scent profile.</p>
              <QrCodeDisplay scentType={perfume.jenisAroma} />
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

