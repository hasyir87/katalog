
'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';
import type { User as FirebaseAuthUser } from 'firebase/auth'; // Renamed to avoid conflict
import { allowedUsers } from './auth-allowlist';

const perfumeSchema = z.object({
  number: z.coerce.number().int().positive(),
  namaParfum: z.string().min(2, 'Name must be at least 2 characters long.'),
  deskripsiParfum: z.string().min(10, 'Description must be at least 10 characters long.'),
  topNotes: z.string().min(2, 'Top notes are required.'),
  middleNotes: z.string().min(2, 'Middle notes are required.'),
  baseNotes: z.string().min(2, 'Base notes are required.'),
  penggunaan: z.string().min(2, 'Usage context is required.'),
  sex: z.enum(['Male', 'Female', 'Unisex']),
  lokasi: z.string().min(2, 'Location/Occasion is required.'),
  jenisAroma: z.string().min(2, 'Scent type is required.'),
  kualitas: z.string().min(2, 'Quality is required.'),
});

const perfumeImportSchema = z.object({
  No: z.coerce.number().int().positive(),
  'Nama Parfum': z.string().min(2),
  'Deskripsi Parfum': z.string().min(10),
  'Top Notes': z.string(),
  'Middle Notes': z.string(),
  'Base Notes': z.string(),
  Penggunaan: z.string(),
  Sex: z.enum(['Pria', 'Wanita', 'Unisex']),
  Lokasi: z.string(),
  'Jenis Aroma': z.string(),
  Kualitas: z.string(),
  'Image URL': z.string().url().optional().or(z.literal('')),
});


// --- User Actions ---

export async function getOrCreateUser(user: FirebaseAuthUser): Promise<boolean> {
  try {
    if (!user.email || !allowedUsers.includes(user.email)) {
      console.log(`Authorization denied for email not in allowlist: ${user.email}`);
      return false;
    }
    
    const db = await getDb();
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return true;
    } else {
      await userRef.set({
        displayName: user.displayName,
        email: user.email,
      });
      return true;
    }
  } catch (error: any) {
    console.error("Error in getOrCreateUser:", error.message);
    return false;
  }
}


// --- Perfume Actions ---

export async function getPerfumes(): Promise<Perfume[]> {
    try {
        const db = await getDb();
        const perfumesCollection = db.collection('perfumes');
        const snapshot = await perfumesCollection.orderBy('number').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
    } catch (error: any) {
        console.error("Error fetching perfumes: ", error.message);
        throw new Error(`Failed to fetch perfumes: ${error.message}`);
    }
}


export async function getPerfumeById(id: string): Promise<Perfume | undefined> {
  try {
    const db = await getDb();
    const docSnap = await db.collection('perfumes').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Perfume;
    }
    return undefined;
  } catch (error: any) {
    console.error("Error fetching perfume by ID: ", error.message);
    throw new Error(`Failed to fetch perfume: ${error.message}`);
  }
}

export async function addPerfume(data: Omit<Perfume, 'id' | 'imageUrl'>) {
  const validatedData = perfumeSchema.parse(data);
  const dataToSave = {
    ...validatedData,
    imageUrl: `https://picsum.photos/seed/perfume${validatedData.number}/400/600`,
  }
  try {
    const db = await getDb();
    const perfumesCollection = db.collection('perfumes');
    const docRef = await perfumesCollection.add(dataToSave);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { id: docRef.id, ...dataToSave };
  } catch (error: any) {
     console.error("Error adding perfume: ", error.message);
     throw new Error('Failed to add perfume.');
  }
}

export async function addPerfumesBatch(data: any[]) {
    const db = await getDb();
    const batch = db.batch();

    let successCount = 0;
    const errors: string[] = [];

    data.forEach((item, index) => {
        // We manually map to handle potential missing optional fields from Excel
        const mappedItem = {
            'No': item.No,
            'Nama Parfum': item['Nama Parfum'],
            'Deskripsi Parfum': item['Deskripsi Parfum'],
            'Top Notes': item['Top Notes'],
            'Middle Notes': item['Middle Notes'],
            'Base Notes': item['Base Notes'],
            'Penggunaan': item.Penggunaan,
            'Sex': item.Sex,
            'Lokasi': item.Lokasi,
            'Jenis Aroma': item['Jenis Aroma'],
            'Kualitas': item.Kualitas,
            'Image URL': item['Image URL'] || `https://picsum.photos/seed/perfume${item.No}/400/600`,
        };

        const result = perfumeImportSchema.safeParse(mappedItem);

        if (result.success) {
            const perfumeData = {
                number: result.data.No,
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
                imageUrl: result.data['Image URL'],
            };
            const docRef = db.collection('perfumes').doc(); // Auto-generate ID
            batch.set(docRef, perfumeData);
            successCount++;
        } else {
             errors.push(`Row ${index + 2}: ${result.error.issues.map(i => `${i.path.join('.')} - ${i.message}`).join(', ')}`);
        }
    });

    if (successCount > 0) {
        await batch.commit();
    }

    revalidatePath('/');
    revalidatePath('/dashboard');

    return { successCount, errors };
}

export async function updatePerfume(id: string, data: Partial<Omit<Perfume, 'id' | 'imageUrl'>>) {
  const validatedData = perfumeSchema.partial().parse(data);
  
  const dataToSave: Partial<Perfume> = { ...validatedData };
  if(validatedData.number) {
    dataToSave.imageUrl = `https://picsum.photos/seed/perfume${validatedData.number}/400/600`
  }

  try {
    const db = await getDb();
    const docRef = db.collection('perfumes').doc(id);
    await docRef.update(dataToSave);
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/perfume/${id}`);
    if (validatedData.jenisAroma) {
        revalidatePath(`/aroma/${validatedData.jenisAroma}`);
    }
  } catch (error: any) {
    console.error("Error updating perfume: ", error.message);
    throw new Error('Failed to update perfume.');
  }
}

export async function deletePerfume(id: string) {
  try {
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
        return { message: 'Perfume deleted successfully' };
    } else {
        throw new Error('Perfume not found');
    }
  } catch (error: any) {
     console.error("Error deleting perfume: ", error.message);
     throw new Error(error.message || 'Failed to delete perfume.');
  }
}
