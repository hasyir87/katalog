'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';
import type { User } from 'firebase/auth';
// import { allowedUsers } from './auth-allowlist'; // Commenting out for diagnostics

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

export async function getOrCreateUser(user: User) {
  // DIAGNOSTIC: Temporarily disabled allowlist check.
  // if (!user.email || !allowedUsers.includes(user.email)) {
  //   console.warn(`Unauthorized login attempt by: ${user.email}`);
  //   // Throw an error to be caught by the calling component.
  //   throw new Error("You are not authorized to access this application.");
  // }
  
  const db = await getDb();
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    const newUserProfile = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
    };
    // Zod schema for user profile to ensure data integrity, defined internally.
    const userProfileSchema = z.object({
        displayName: z.string().nullable(),
        email: z.string().email().nullable(), // Allow nullable email just in case
        photoURL: z.string().url().nullable(),
    });
    const validatedProfile = userProfileSchema.parse(newUserProfile);
    await setDoc(userRef, validatedProfile);
    return validatedProfile;
  }
}


// --- Perfume Actions ---

export async function getPerfumes(): Promise<Perfume[]> {
  try {
    const db = await getDb();
    const perfumesCollection = collection(db, 'perfumes');
    const snapshot = await getDocs(perfumesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
  } catch (error) {
    console.error("Error fetching perfumes: ", error);
    return [];
  }
}

export async function getPerfumeById(id: string): Promise<Perfume | undefined> {
  try {
    const db = await getDb();
    const docRef = doc(db, 'perfumes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Perfume;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching perfume by ID: ", error);
    return undefined;
  }
}

export async function getPerfumesByAroma(aroma: string): Promise<Perfume[]> {
    try {
        const db = await getDb();
        const perfumesCollection = collection(db, 'perfumes');
        const q = query(perfumesCollection, where("jenisAroma", "==", aroma));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
    } catch (error) {
        console.error("Error fetching perfumes by aroma: ", error);
        return [];
    }
}


export async function addPerfume(data: Omit<Perfume, 'id'>) {
  const validatedData = perfumeSchema.parse(data);
  try {
    const db = await getDb();
    const perfumesCollection = collection(db, 'perfumes');
    const docRef = await addDoc(perfumesCollection, validatedData);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { id: docRef.id, ...validatedData };
  } catch (error) {
     console.error("Error adding perfume: ", error);
     throw new Error('Failed to add perfume.');
  }
}

export async function updatePerfume(id: string, data: Partial<Omit<Perfume, 'id'>>) {
  const validatedData = perfumeSchema.partial().parse(data);
  const db = await getDb();
  const docRef = doc(db, 'perfumes', id);
  try {
    await updateDoc(docRef, validatedData);
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/perfume/${id}`);
    if (validatedData.jenisAroma) {
        revalidatePath(`/aroma/${validatedData.jenisAroma}`);
    }
  } catch (error) {
    console.error("Error updating perfume: ", error);
    throw new Error('Failed to update perfume.');
  }
}

export async function deletePerfume(id: string) {
  const db = await getDb();
  const docRef = doc(db, 'perfumes', id);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const perfume = docSnap.data() as Perfume;

        // Protection Logic: Prevent deletion of perfume with number 1
        if (perfume.number === 1) {
            throw new Error('This perfume is protected and cannot be deleted.');
        }

        await deleteDoc(docRef);
        revalidatePath('/');
        revalidatePath('/dashboard');
        revalidatePath(`/aroma/${perfume.jenisAroma}`);
        return { message: 'Perfume deleted successfully' };
    } else {
        throw new Error('Perfume not found');
    }
  } catch (error: any) {
     console.error("Error deleting perfume: ", error);
     // Re-throw the original error message, whether it's from our protection logic or Firestore
     throw new Error(error.message || 'Failed to delete perfume.');
  }
}
