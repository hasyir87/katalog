'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Perfume } from '@/lib/types';
import { addPerfume, updatePerfume } from '@/lib/actions';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const perfumeSchema = z.object({
  namaParfum: z.string().min(2, 'Name must be at least 2 characters long.'),
  deskripsiParfum: z.string().min(10, 'Description must be at least 10 characters long.'),
  topNotes: z.string().min(2, 'Top notes are required.'),
  middleNotes: z.string().min(2, 'Middle notes are required.'),
  baseNotes: z.string().min(2, 'Base notes are required.'),
  penggunaan: z.string().min(2, 'Usage context is required.'),
  sex: z.enum(['Male', 'Female', 'Unisex']),
  lokasi: z.string().min(2, 'Location/Occasion is required.'),
  jenisAroma: z.string().min(2, 'Scent type is required.'),
  kualitas: z.enum(['Premium', 'Extrait']),
});

type PerfumeFormProps = {
  perfume?: Perfume;
};

export function PerfumeForm({ perfume }: PerfumeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!perfume;

  const form = useForm<z.infer<typeof perfumeSchema>>({
    resolver: zodResolver(perfumeSchema),
    defaultValues: perfume ? {
      ...perfume,
    } : {
      namaParfum: '',
      deskripsiParfum: '',
      topNotes: '',
      middleNotes: '',
      baseNotes: '',
      penggunaan: '',
      sex: 'Unisex',
      lokasi: '',
      jenisAroma: '',
      kualitas: 'Premium',
    },
  });

  async function onSubmit(values: z.infer<typeof perfumeSchema>) {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updatePerfume(perfume.id, values);
        toast({ title: 'Success!', description: 'Perfume updated successfully.' });
      } else {
        await addPerfume(values);
        toast({ title: 'Success!', description: 'Perfume added successfully.' });
      }
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'add'} perfume.`,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">{isEditMode ? 'Edit Perfume' : 'Add a New Perfume'}</CardTitle>
            <CardDescription>{isEditMode ? 'Update the details of your perfume.' : 'Fill in the form to add a new fragrance to your collection.'}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField control={form.control} name="namaParfum" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Parfum</FormLabel>
                            <FormControl><Input placeholder="e.g., Midnight Bloom" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="deskripsiParfum" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deskripsi Parfum</FormLabel>
                            <FormControl><Textarea placeholder="Describe the essence of the perfume..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormField control={form.control} name="topNotes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Top Notes</FormLabel>
                                <FormControl><Input placeholder="e.g., Bergamot, Lemon" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="middleNotes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Middle Notes</FormLabel>
                                <FormControl><Input placeholder="e.g., Jasmine, Rose" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="baseNotes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Base Notes</FormLabel>
                                <FormControl><Input placeholder="e.g., Sandalwood, Musk" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FormField control={form.control} name="sex" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Female">Wanita</SelectItem>
                                        <SelectItem value="Male">Pria</SelectItem>
                                        <SelectItem value="Unisex">Unisex</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="jenisAroma" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Aroma</FormLabel>
                                <FormControl><Input placeholder="e.g., Floral" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="kualitas" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kualitas</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih kualitas" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                        <SelectItem value="Extrait">Extrait</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="penggunaan" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Penggunaan</FormLabel>
                                <FormControl><Input placeholder="e.g., Day, Night" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="lokasi" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lokasi / Occasion</FormLabel>
                                <FormControl><Input placeholder="e.g., Office, Casual, Beach" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Perfume' : 'Add Perfume')}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
