import { getPerfumeById } from "@/lib/actions";
import { PerfumeForm } from "@/components/perfume-form";
import { notFound } from "next/navigation";

export default async function EditPerfumePage({ params }: { params: { id: string } }) {
  const perfume = await getPerfumeById(params.id);

  if (!perfume) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <PerfumeForm perfume={perfume} />
    </div>
  );
}
