'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { z } from 'zod';

const perfumeSchema = z.object({
  number: z.coerce.number().int().positive(),
  namaParfum: z.string().min(2),
  deskripsiParfum: z.string().min(10),
  topNotes: z.string().min(2),
  middleNotes: z.string().min(2),
  baseNotes: z.string().min(2),
  penggunaan: z.string().min(2),
  sex: z.enum(['Male', 'Female', 'Unisex']),
  lokasi: z.string().min(2),
  jenisAroma: z.string().min(2),
  kualitas: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal('')),
});


async function getPerfumesCollection() {
    const db = await getDb();
    return collection(db, 'perfumes');
}

export async function getPerfumes(): Promise<Perfume[]> {
  try {
    const perfumesCollection = await getPerfumesCollection();
    const snapshot = await getDocs(perfumesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));
  } catch (error) {
    console.error("Error fetching perfumes: ", error);
    // In a real app, you might want to throw the error or handle it differently.
    // For now, returning an empty array to prevent crashes.
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
        const perfumesCollection = await getPerfumesCollection();
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
    const perfumesCollection = await getPerfumesCollection();
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
     // Fetch the document first to get its data for revalidation
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
