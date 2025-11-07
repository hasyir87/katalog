import { getPerfumesByAroma } from "@/lib/actions";
import { PerfumeCard } from "@/components/perfume-card";
import { notFound } from "next/navigation";

export default async function AromaPage({ params }: { params: { name: string } }) {
  const aromaName = decodeURIComponent(params.name);
  const perfumes = await getPerfumesByAroma(aromaName);

  if (perfumes.length === 0) {
    // Or render a "No perfumes found for this aroma" message
    notFound();
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline tracking-tight">
                Scent Profile: <span className="text-primary">{aromaName}</span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Discover all fragrances featuring this exquisite aroma.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {perfumes.map((perfume) => (
                <PerfumeCard key={perfume.id} perfume={perfume} />
            ))}
        </div>
    </main>
  );
}
