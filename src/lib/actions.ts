
'use server';

import { getDb } from "@/firebase/server-init";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Perfume } from "./types";

const perfumeSchema = z.object({
    namaParfum: z.string().min(1, 'Nama parfum tidak boleh kosong'),
    deskripsiParfum: z.string().optional(),
    kualitas: z.string().min(1, 'Kualitas tidak boleh kosong'),
    jenisAroma: z.string().min(1, 'Jenis aroma tidak boleh kosong'),
    sex: z.string().min(1, 'Jenis kelamin tidak boleh kosong'),
    topNotes: z.string().optional(),
    middleNotes: z.string().optional(),
    baseNotes: z.string().optional(),
    penggunaan: z.string().optional(),
    lokasi: z.string().optional(),
});

// Fungsi untuk mendapatkan semua parfum dengan opsi pencarian
export async function getAllPerfumes(searchQuery: string = ''): Promise<Perfume[]> {
    try {
        const db = await getDb();
        const perfumesRef = db.collection('perfumes');
        
        const querySnapshot = await perfumesRef.get();

        const allPerfumes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Perfume[];

        if (!searchQuery) {
            return allPerfumes;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        
        const filteredPerfumes = allPerfumes.filter(perfume => {
            return (
              perfume.namaParfum.toLowerCase().includes(lowercasedQuery) ||
              perfume.jenisAroma.toLowerCase().includes(lowercasedQuery) ||
              perfume.kualitas.toLowerCase().includes(lowercasedQuery) ||
              perfume.sex.toLowerCase().includes(lowercasedQuery)
            )
        });

        return filteredPerfumes;

    } catch (error) {
        console.error("Error getting all perfumes: ", error);
        throw new Error("Could not fetch perfumes.");
    }
}


// Fungsi untuk mendapatkan satu parfum berdasarkan ID
export async function getPerfumeById(id: string): Promise<Perfume | null> {
    try {
        const db = await getDb();
        const docRef = db.collection('perfumes').doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Perfume;
        }
        return null;
    } catch (error) {
        console.error(`Error getting perfume by ID (${id}): `, error);
        return null; // Return null on error to prevent crashes
    }
}

// Fungsi untuk menambah parfum baru
export async function addPerfume(data: unknown) {
    const db = await getDb();

    const validation = perfumeSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    try {
        await db.collection('perfumes').add(validation.data);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error adding perfume: ", error);
        return { success: false, errors: { _server: ["Gagal menambahkan parfum. Silakan coba lagi."] } };
    }
}

// Fungsi untuk mengupdate parfum
export async function updatePerfume(id: string, data: unknown) {
    const db = await getDb();
    
    const validation = perfumeSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    try {
        const docRef = db.collection('perfumes').doc(id);
        await docRef.update(validation.data);
        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/edit/${id}`);
        revalidatePath(`/perfume/${id}`);
        return { success: true };
    } catch (error) {
        console.error(`Error updating perfume (${id}): `, error);
        return { success: false, errors: { _server: ["Gagal mengupdate parfum. Silakan coba lagi."] } };
    }
}

// Fungsi untuk menghapus satu parfum
export async function deletePerfume(id: string) {
    const db = await getDb();
    try {
        await db.collection('perfumes').doc(id).delete();
        revalidatePath("/dashboard");
    } catch (error) {
        console.error(`Error deleting perfume (${id}): `, error);
        throw new Error('Could not delete perfume.');
    }
}

// Fungsi untuk menghapus banyak parfum
export async function deleteManyPerfumes(ids: string[]) {
    const db = await getDb();
    try {
        const batch = db.batch();
        ids.forEach(id => {
            const docRef = db.collection('perfumes').doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Error deleting multiple perfumes: ", error);
        throw new Error("Could not delete selected perfumes.");
    }
}

// Fungsi untuk menambah parfum secara batch dari Excel
export async function addPerfumesBatch(data: any[]) {
    const db = await getDb();
    const batch = db.batch();
    const errors: string[] = [];
    let successCount = 0;

    data.forEach((item, index) => {
        // Membersihkan dan memvalidasi setiap baris
        const cleanedItem = {
            namaParfum: item['namaParfum'] || item['Nama Parfum'] || '',
            deskripsiParfum: item['deskripsiParfum'] || item['Deskripsi Parfum'] || '',
            kualitas: item['kualitas'] || item['Kualitas'] || '',
            jenisAroma: item['jenisAroma'] || item['Jenis Aroma'] || '',
            sex: item['sex'] || item['Sex'] || '',
            topNotes: item['topNotes'] || item['Top Notes'] || '',
            middleNotes: item['middleNotes'] || item['Middle Notes'] || '',
            baseNotes: item['baseNotes'] || item['Base Notes'] || '',
            penggunaan: item['penggunaan'] || item['Penggunaan'] || '',
            lokasi: item['lokasi'] || item['Lokasi'] || '',
        }

        const validation = perfumeSchema.safeParse(cleanedItem);

        if (validation.success) {
            const docRef = db.collection('perfumes').doc(); // Membuat doc ref baru
            batch.set(docRef, validation.data);
            successCount++;
        } else {
            const errorMessages = Object.values(validation.error.flatten().fieldErrors).join(', ');
            errors.push(`Row ${index + 2}: ${errorMessages}`);
        }
    });

    try {
        await batch.commit();
        revalidatePath("/dashboard");
        return { successCount, errors };
    } catch (error) {
        console.error("Error committing batch: ", error);
        return {
            successCount: 0,
            errors: ["An unexpected server error occurred while saving the data."],
        };
    }
}
