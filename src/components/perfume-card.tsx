import Link from 'next/link';
import type { Perfume } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const formattedSex = perfume.sex === 'Male' ? 'Pria' : perfume.sex === 'Female' ? 'Wanita' : 'Unisex';
  
  return (
    <Link href={`/perfume/${perfume.id}`} className="group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
        <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between">
          <CardTitle className="font-headline text-2xl leading-tight mb-2 flex-1">{perfume.namaParfum}</CardTitle>
           <Badge variant="secondary">{perfume.jenisAroma}</Badge>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex items-center text-sm text-muted-foreground mb-3 gap-4">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-primary/70"/> 
                  <span>{perfume.kualitas}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{formattedSex}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-3">{perfume.deskripsiParfum}</p>
            </div>
          <div className="mt-6 flex items-center justify-end text-sm font-semibold text-primary group-hover:text-accent transition-colors">
            View Details <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
