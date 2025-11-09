'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';
import type { User } from 'firebase/auth';
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

const userProfileSchema = z.object({
  displayName: z.string().nullable(),
  email: z.string().email(),
  photoURL: z.string().url().nullable(),
});


// --- User Actions ---

export async function getOrCreateUser(user: User) {
  // Security Check: Verify if user's email is in the allowlist.
  if (!user.email || !allowedUsers.includes(user.email)) {
    console.warn(`Unauthorized login attempt by: ${user.email}`);
    // Throw an error to be caught by the calling component.
    throw new Error("You are not authorized to access this application.");
  }
  
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
    const validatedProfile = userProfileSchema.parse(newUserProfile);
    await setDoc(userRef, validatedProfile);
    return validatedProfile;
  }
}


// --- Perfume Actions ---

const perfumesCollection = collection(db, 'perfumes');

export async function getPerfumes(): Promise<Perfume[]> {
  try {
    const snapshot = await getDocs(perfumesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
  } catch (error) {
    console.error("Error fetching perfumes: ", error);
    return [];
  }
}

export async function getPerfumeById(id: string): Promise<Perfume | undefined> {
  try {
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
  const docRef = doc(db, 'perfumes', id);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const deletedPerfume = docSnap.data() as Perfume;
        await deleteDoc(docRef);
        revalidatePath('/');
        revalidatePath('/dashboard');
        revalidatePath(`/aroma/${deletedPerfume.jenisAroma}`);
        return { message: 'Perfume deleted successfully' };
    } else {
        throw new Error('Perfume not found');
    }
  } catch (error) {
     console.error("Error deleting perfume: ", error);
     throw new Error('Failed to delete perfume.');
  }
}
