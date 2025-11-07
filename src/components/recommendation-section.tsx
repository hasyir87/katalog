'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recommendPerfume } from '@/ai/flows/perfume-recommendation';
import type { Perfume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { PerfumeCard } from '@/components/perfume-card';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RecommendPerfumeOutput } from '@/ai/schema/perfume-recommendation-schema';


const FormSchema = z.object({
  query: z.string().min(10, {
    message: 'Please describe what you are looking for in at least 10 characters.',
  }),
});

// Map AI output to our Perfume type
const mapAiPerfumeToPerfume = (aiPerfume: RecommendPerfumeOutput['recommendations'][0]): Perfume => ({
    id: aiPerfume.Number.toString(), // The mock data uses Number for id
    number: aiPerfume.Number,
    namaParfum: aiPerfume.Nama_Parfum,
    deskripsiParfum: aiPerfume.Deskripsi_Parfum,
    topNotes: aiPerfume.Top_Notes,
    middleNotes: aiPerfume.Middle_Notes,
    baseNotes: aiPerfume.Base_Notes,
    penggunaan: aiPerfume.Penggunaan,
    sex: aiPerfume.Sex as 'Male' | 'Female' | 'Unisex',
    lokasi: aiPerfume.Lokasi,
    jenisAroma: aiPerfume.Jenis_Aroma,
    kualitas: aiPerfume.Kualitas,
    // The AI output doesn't include an image, so we'll use a default
    imageUrl: `https://picsum.photos/seed/${aiPerfume.Number}/400/600`,
});


export function RecommendationSection() {
  const [recommendations, setRecommendations] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      query: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const result = await recommendPerfume(data);
      if (result && result.recommendations.length > 0) {
        setRecommendations(result.recommendations.map(mapAiPerfumeToPerfume));
      } else {
        toast({
            variant: "default",
            title: "No recommendations found",
            description: "Our AI couldn't find a match for your query. Try being more specific or different.",
        });
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our AI recommender. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="recommend" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">AI Perfume Recommender</h2>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Tell us what you like, and our AI will find the perfect scent for you. Try "something warm and spicy for winter nights".
            </p>
          </div>
          <div className="w-full max-w-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start space-x-2">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g., A fresh and light scent for the office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="h-5 w-5" />
                  )}
                  <span className="sr-only">Get Recommendations</span>
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 pt-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        <div className="h-64 bg-muted rounded-lg animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {recommendations.length > 0 && (
          <div className="pt-12">
            <h3 className="text-2xl font-bold tracking-tighter mb-6 text-center font-headline">Our Recommendations for You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 animate-in fade-in-0 duration-500">
              {recommendations.map((perfume) => (
                <PerfumeCard key={perfume.id} perfume={perfume} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
