import Image from 'next/image';
import Link from 'next/link';
import type { Perfume } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  return (
    <Link href={`/perfume/${perfume.id}`} className="group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0 relative h-64">
          <Image
            src={perfume.imageUrl ?? 'https://picsum.photos/seed/placeholder/400/600'}
            alt={perfume.namaParfum}
            width={400}
            height={600}
            className="object-cover w-full h-full"
            data-ai-hint="perfume bottle"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
           <div className="absolute bottom-4 left-4">
              <Badge variant="secondary">{perfume.jenisAroma}</Badge>
           </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow flex flex-col justify-between">
            <div>
              <CardTitle className="font-headline text-2xl leading-tight mb-2">{perfume.namaParfum}</CardTitle>
              <p className="text-muted-foreground text-sm line-clamp-2">{perfume.deskripsiParfum}</p>
            </div>
          <div className="mt-4 flex items-center justify-end text-sm font-semibold text-primary group-hover:text-accent transition-colors">
            View Details <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
