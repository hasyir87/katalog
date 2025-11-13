
'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';

// This schema is for validating data coming from the client-side form.
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

// This schema is specifically for validating data from Excel import.
const perfumeImportSchema = z.object({
  'Nama Parfum': z.string().min(2),
  'Deskripsi Parfum': z.string().min(10),
  'Top Notes': z.string(),
  'Middle Notes': z.string(),
  'Base Notes': z.string(),
  'Penggunaan': z.string(),
  'Sex': z.enum(['Pria', 'Wanita', 'Unisex']),
  'Lokasi': z.string(),
  'Jenis Aroma': z.string(),
  'Kualitas': z.enum(['Premium', 'Extrait']),
});


// --- Perfume Actions ---

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

    // Use count() for a reliable and efficient way to get the number of documents.
    const countSnapshot = await perfumesCollection.count().get();
    const nextNumber = countSnapshot.data().count + 1;
    
    // Explicitly create a new, clean object to be stored.
    // This prevents any potential issues with object prototypes or serialization from Server Actions.
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

    // Get the initial count ONCE before the loop for efficiency.
    const countSnapshot = await perfumesCollection.count().get();
    let nextNumber = countSnapshot.data().count + 1;

    for (const [index, item] of data.entries()) {
        const result = perfumeImportSchema.safeParse(item);

        if (result.success) {
            // Create a clean data object for Firestore
            const perfumeData = {
                namaParfum: result.data['Nama Parfum'],
                deskripsiParfum: result.data['Deskripsi Parfum'],
                topNotes: result.data['Top Notes'],
                middleNotes: result.data['Middle Notes'],
                baseNotes: result.data['Base Notes'],
                penggunaan: result.data.Penggunaan,
                sex: result.data.Sex === 'Pria' ? 'Male' : (result.data.Sex === 'Wanita' ? 'Female' : 'Unisex'),
                lokasi: result.data.Lokasi,
                jenisAroma: result.data['Jenis Aroma'],
                kualitas: result.data.Kualitas,
                number: nextNumber, // Assign the incrementing number
            };
            const docRef = perfumesCollection.doc();
            batch.set(docRef, perfumeData);
            successCount++;
            nextNumber++; // Increment for the next valid item
        } else {
             errors.push(`Row ${index + 2}: ${result.error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', ')}`);
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
    // Validate incoming data before updating
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

