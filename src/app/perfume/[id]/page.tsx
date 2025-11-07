import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPerfumeById, getPerfumes } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Droplets, Flower, Building, User, Clock, CheckCircle, Sun, Moon, Sparkle, Milestone } from 'lucide-react';
import { QrCodeDisplay } from '@/components/qr-code-display';

export default async function PerfumeDetailPage({ params }: { params: { id: string } }) {
  const perfume = await getPerfumeById(params.id);

  if (!perfume) {
    notFound();
  }
  
  const details = [
    { icon: Droplets, label: "Top Notes", value: perfume.topNotes },
    { icon: Flower, label: "Middle Notes", value: perfume.middleNotes },
    { icon: Milestone, label: "Base Notes", value: perfume.baseNotes },
    { icon: User, label: "Sex", value: perfume.sex },
    { icon: Clock, label: "Penggunaan", value: perfume.penggunaan },
    { icon: Building, label: "Lokasi", value: perfume.lokasi },
    { icon: Sparkle, label: "Kualitas", value: perfume.kualitas },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full aspect-[2/3] max-w-sm rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={perfume.imageUrl ?? 'https://picsum.photos/seed/placeholder/400/600'}
              alt={perfume.namaParfum}
              width={400}
              height={600}
              className="object-cover w-full h-full"
              data-ai-hint="perfume product"
            />
          </div>
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
        <div className="space-y-6">
          <Badge variant="secondary">{perfume.jenisAroma}</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold font-headline tracking-tight text-primary">
            {perfume.namaParfum}
          </h1>
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
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    const perfumes = await getPerfumes();
    return perfumes.map((perfume) => ({
        id: perfume.id,
    }));
}
