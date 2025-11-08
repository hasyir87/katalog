import Image from 'next/image';
import { getPerfumes } from '@/lib/actions';
import { PerfumeCard } from '@/components/perfume-card';
import { RecommendationSection } from '@/components/recommendation-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
  const perfumes = await getPerfumes();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          <Image
            src="https://picsum.photos/seed/scentvault-hero/1920/1080"
            alt="Hero background"
            fill
            className="object-cover -z-10 opacity-30"
            data-ai-hint="perfume bottle"
            priority
          />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline text-primary">
                  M Katalog Parfum
                </h1>
                <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
                  Temukan, kelola, dan jelajahi dunia wewangian. Panduan pribadi Anda menuju keunggulan penciuman.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="#catalog">Jelajahi Katalog</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/dashboard">Kelola Koleksi</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <RecommendationSection />

        <section id="catalog" className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Katalog Parfum Kami</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Telusuri koleksi parfum pilihan kami dari seluruh dunia.
                </p>
              </div>
            </div>
            {perfumes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 pt-12 animate-in fade-in-0 duration-500">
                {perfumes.map((perfume) => (
                  <PerfumeCard key={perfume.id} perfume={perfume} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Belum ada parfum di dalam koleksi.</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/dashboard">Tambahkan yang pertama!</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
