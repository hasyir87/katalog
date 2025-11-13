
'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';

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

export async function getPerfumes(): Promise<Perfume[]> {
  const db = await getDb();
  const perfumesCollection = db.collection('perfumes');
  const snapshot = await perfumesCollection.orderBy('namaParfum').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
}

export async function getPerfumeById(id: string): Promise<Perfume | null> {
    const db = await getDb();
    const docRef = db.collection('perfumes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return null;
    }

    return { id: doc.id, ...doc.data() } as Perfume;
}


export async function addPerfume(data: z.infer<typeof perfumeSchema>) {
  const db = await getDb();
  const perfumesCollection = db.collection('perfumes');
  
  const countSnapshot = await perfumesCollection.count().get();
  const nextNumber = countSnapshot.data().count + 1;

  const finalData = {
    ...data,
    number: nextNumber,
    createdAt: new Date().toISOString(),
  };

  await perfumesCollection.add(finalData);

  revalidatePath('/');
  revalidatePath('/dashboard');
}

export async function updatePerfume(id: string, data: z.infer<typeof perfumeSchema>) {
    const validatedData = perfumeSchema.parse(data);
    const db = await getDb();
    const docRef = db.collection('perfumes').doc(id);

    await docRef.update({
        ...validatedData,
        updatedAt: new Date().toISOString()
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/perfume/${id}`);
    revalidatePath(`/dashboard/edit/${id}`);
}

export async function deletePerfume(id: string) {
    const db = await getDb();
    await db.collection('perfumes').doc(id).delete();

    revalidatePath('/');
    revalidatePath('/dashboard');
}


export async function addPerfumesBatch(data: any[]) {
    const db = await getDb();
    const perfumesCollection = db.collection('perfumes');
    const batch = db.batch();
    const errors: string[] = [];
    let successCount = 0;

    const countSnapshot = await perfumesCollection.count().get();
    let nextNumber = countSnapshot.data().count + 1;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2;

        try {
            const mappedData = {
                namaParfum: row['Nama Parfum'] || '',
                deskripsiParfum: row['Deskripsi Parfum'] || '',
                topNotes: row['Top Notes'] || '',
                middleNotes: row['Middle Notes'] || '',
                baseNotes: row['Base Notes'] || '',
                penggunaan: row['Penggunaan'] || '',
                sex: (row['Sex'] === 'Pria' ? 'Male' : row['Sex'] === 'Wanita' ? 'Female' : 'Unisex') as 'Male' | 'Female' | 'Unisex',
                lokasi: row['Lokasi'] || '',
                jenisAroma: row['Jenis Aroma'] || '',
                kualitas: row['Kualitas'] as 'Premium' | 'Extrait',
            };

            const validatedData = perfumeSchema.parse(mappedData);

            const docRef = perfumesCollection.doc(); // Auto-generate ID
            batch.set(docRef, {
                ...validatedData,
                number: nextNumber++,
                createdAt: new Date().toISOString(),
            });
            successCount++;

        } catch (error: any) {
            const errorMessage = error instanceof z.ZodError 
                ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                : 'Unknown error';
            errors.push(`Row ${rowNum}: ${errorMessage}`);
        }
    }

    if (successCount > 0) {
        await batch.commit();
    }

    revalidatePath('/');
    revalidatePath('/dashboard');

    return { successCount, errors };
}
