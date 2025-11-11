'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mixPerfume } from '@/ai/flows/perfume-mixer-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, Wand2, Loader2, FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PerfumeMixerOutput } from '@/ai/schema/perfume-mixer-schema';

const FormSchema = z.object({
  preference: z.string().min(10, {
    message: 'Please describe your desired mix in at least 10 characters.',
  }),
});

export function ScentMixerSection() {
  const [mixResult, setMixResult] = useState<PerfumeMixerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      preference: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setMixResult(null);
    try {
      const result = await mixPerfume(data);
      if (result && result.mixName) {
        setMixResult(result);
      } else {
        toast({
            variant: "default",
            title: "Could not create a mix",
            description: "Our AI couldn't find suitable ingredients for your request. Try being more specific.",
        });
      }
    } catch (error) {
      console.error('Error creating perfume mix:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our AI Scent Mixer. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="mix" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">AI Scent Mixer</h2>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Become a perfumer. Describe your ideal scent, and our AI will craft a unique blend recipe for you.
            </p>
          </div>
          <div className="w-full max-w-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start space-x-2">
                <FormField
                  control={form.control}
                  name="preference"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g., A mix of floral and woody for a rainy day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Beaker className="h-5 w-5" />
                  )}
                  <span className="sr-only">Mix Scent</span>
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {isLoading && (
            <div className="mt-12 max-w-2xl mx-auto">
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-8 w-3/5 bg-muted rounded-md" />
                        <div className="h-4 w-4/5 bg-muted rounded-md mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="h-6 w-1/3 bg-muted rounded-md"/>
                             <div className="h-4 w-full bg-muted rounded-md" />
                             <div className="h-4 w-full bg-muted rounded-md" />
                             <div className="h-4 w-3/4 bg-muted rounded-md" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {mixResult && (
          <div className="mt-12 max-w-2xl mx-auto animate-in fade-in-0 duration-500">
            <Card className="border-primary/20 shadow-lg">
                <CardHeader className="text-center">
                    <FlaskConical className="mx-auto h-10 w-10 text-primary mb-2"/>
                    <CardTitle className="font-headline text-3xl text-primary">{mixResult.mixName}</CardTitle>
                    <CardDescription>Your unique AI-generated scent recipe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">Recipe:</h4>
                        <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                            {mixResult.recipe.map((ingredient, index) => (
                                <li key={index}>
                                    <span className="font-bold text-foreground">{ingredient.parts} part(s)</span> of <span className="italic">"{ingredient.perfumeName}"</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg mb-2">Scent Profile:</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{mixResult.description}</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
