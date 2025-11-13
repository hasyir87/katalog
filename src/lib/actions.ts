
'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';

// Skema dasar untuk data parfum.
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


export async function getPerfumeById(id: string): Promise<Perfume | undefined> {
    const db = await getDb();
    const docSnap = await db.collection('perfumes').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Perfume;
    }
    return undefined;
}

export async function addPerfume(data: z.infer<typeof perfumeSchema>) {
    const db = await getDb();
    const perfumesCollection = db.collection('perfumes');

    // 1. Dapatkan nomor urut berikutnya dengan andal
    const countSnapshot = await perfumesCollection.count().get();
    const nextNumber = countSnapshot.data().count + 1;

    // 2. Buat objek data yang bersih dan murni (POJO) secara manual
    const finalData = {
        namaParfum: data.namaParfum,
        deskripsiParfum: data.deskripsiParfum,
        topNotes: data.topNotes,
        middleNotes: data.middleNotes,
        baseNotes: data.baseNotes,
        penggunaan: data.penggunaan,
        sex: data.sex,
        lokasi: data.lokasi,
        jenisAroma: data.jenisAroma,
        kualitas: data.kualitas,
        number: nextNumber,
    };
    
    // 3. Simpan objek yang dijamin bersih
    await perfumesCollection.add(finalData);
    
    revalidatePath('/');
    revalidatePath('/dashboard');
}


export async function addPerfumesBatch(data: any[]) {
    const db = await getDb();
    const batch = db.batch();
    const perfumesCollection = db.collection('perfumes');

    let successCount = 0;
    const errors: string[] = [];

    const countSnapshot = await perfumesCollection.count().get();
    let nextNumber = countSnapshot.data().count + 1;

    for (const [index, item] of data.entries()) {
        try {
            // Pemetaan manual dari nama kolom Excel
            const mappedItem = {
                namaParfum: item['Nama Parfum'] || '',
                deskripsiParfum: item['Deskripsi Parfum'] || '',
                topNotes: item['Top Notes'] || '',
                middleNotes: item['Middle Notes'] || '',
                baseNotes: item['Base Notes'] || '',
                penggunaan: item.Penggunaan || '',
                sex: item.Sex === 'Pria' ? 'Male' : (item.Sex === 'Wanita' ? 'Female' : 'Unisex'),
                lokasi: item.Lokasi || '',
                jenisAroma: item['Jenis Aroma'] || '',
                kualitas: item.Kualitas || '',
            };

            const validatedData = perfumeSchema.parse(mappedItem);
            
            const finalData = {
                ...validatedData,
                number: nextNumber,
            };

            const docRef = perfumesCollection.doc();
            batch.set(docRef, finalData);
            successCount++;
            nextNumber++;

        } catch (error: any) {
             const errorMessage = error instanceof z.ZodError
                ? error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', ')
                : 'Invalid data format.';
             errors.push(`Row ${index + 2}: ${errorMessage}`);
        }
    };

    if (successCount > 0) {
        await batch.commit();
    }

    revalidatePath('/');
    revalidatePath('/dashboard');

    return { successCount, errors };
}


export async function updatePerfume(id: string, data: Partial<Omit<Perfume, 'id'>>) {
    const validatedData = perfumeSchema.partial().parse(data);

    const db = await getDb();
    const docRef = db.collection('perfumes').doc(id);
    await docRef.update(validatedData);

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/perfume/${id}`);
    if (validatedData.jenisAroma) {
        revalidatePath(`/aroma/${validatedData.jenisAroma}`);
    }
}

export async function deletePerfume(id: string) {
    const db = await getDb();
    const docRef = db.collection('perfumes').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const perfume = docSnap.data() as Perfume;
        await docRef.delete();
        revalidatePath('/');
        revalidatePath('/dashboard');
        if (perfume.jenisAroma) {
            revalidatePath(`/aroma/${perfume.jenisAroma}`);
        }
    } else {
        throw new Error('Perfume not found');
    }
}
