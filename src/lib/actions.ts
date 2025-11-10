
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
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});


// --- User Actions ---

export async function getOrCreateUser(user: FirebaseAuthUser): Promise<boolean> {
  try {
    // 1. Security Check: Is the user's email even in the allowlist?
    if (!user.email || !allowedUsers.includes(user.email)) {
      console.log(`Authorization denied for email not in allowlist: ${user.email}`);
      return false;
    }
    
    // 2. Database Check: Does the user have a profile document?
    const db = await getDb();
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      console.log(`Authorization successful for existing user: ${user.email}`);
      return true; // User exists and is allowed.
    } else {
      // This case can happen if registration succeeded in Auth but failed to write to Firestore.
      // Or if it's the very first login after registration. Let's ensure the doc exists.
      console.warn(`User document not found for allowed user: ${user.email}. Creating it now.`);
      await userRef.set({
        displayName: user.displayName,
        email: user.email,
      });
      // After creating, we can consider them authorized for this session.
      return true;
    }
  } catch (error: any) {
    console.error("Error in getOrCreateUser:", error.message);
    // Any error in this critical function should result in denial of access.
    return false;
  }
}


// --- Perfume Actions ---

export async function getPerfumes(): Promise<Perfume[]> {
    try {
        const db = await getDb();
        const perfumesCollection = db.collection('perfumes');
        const snapshot = await perfumesCollection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
    } catch (error: any) {
        console.error("Error fetching perfumes: ", error.message);
        return [];
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

export async function addPerfume(data: Omit<Perfume, 'id'>) {
  const validatedData = perfumeSchema.parse(data);
  try {
    const db = await getDb();
    const perfumesCollection = db.collection('perfumes');
    const docRef = await perfumesCollection.add(validatedData);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { id: docRef.id, ...validatedData };
  } catch (error: any) {
     console.error("Error adding perfume: ", error.message);
     throw new Error('Failed to add perfume.');
  }
}

export async function updatePerfume(id: string, data: Partial<Omit<Perfume, 'id'>>) {
  const validatedData = perfumeSchema.partial().parse(data);
  
  try {
    const db = await getDb();
    const docRef = db.collection('perfumes').doc(id);
    await docRef.update(validatedData);
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

        if (perfume.number === 1) {
            throw new Error('This perfume is protected and cannot be deleted.');
        }

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
