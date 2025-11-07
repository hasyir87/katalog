'use server';

import { revalidatePath } from 'next/cache';
import { perfumes } from '@/lib/data';
import type { Perfume } from '@/lib/types';

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPerfumes(): Promise<Perfume[]> {
  await delay(500);
  return perfumes;
}

export async function getPerfumeById(id: string): Promise<Perfume | undefined> {
  await delay(500);
  return perfumes.find(p => p.id === id);
}

export async function getPerfumesByAroma(aroma: string): Promise<Perfume[]> {
  await delay(500);
  return perfumes.filter(p => p.jenisAroma.toLowerCase() === aroma.toLowerCase());
}

export async function addPerfume(data: Omit<Perfume, 'id'>) {
  await delay(1000);
  const newPerfume: Perfume = {
    id: (Math.max(...perfumes.map(p => parseInt(p.id))) + 1).toString(),
    ...data,
  };
  perfumes.push(newPerfume);
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/perfume/${newPerfume.id}`);
  revalidatePath(`/aroma/${newPerfume.jenisAroma}`);
  return newPerfume;
}

export async function updatePerfume(id: string, data: Partial<Omit<Perfume, 'id'>>) {
  await delay(1000);
  const index = perfumes.findIndex(p => p.id === id);
  if (index !== -1) {
    perfumes[index] = { ...perfumes[index], ...data };
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/perfume/${id}`);
    revalidatePath(`/aroma/${perfumes[index].jenisAroma}`);
    if (data.jenisAroma && data.jenisAroma !== perfumes[index].jenisAroma) {
       revalidatePath(`/aroma/${data.jenisAroma}`);
    }
    return perfumes[index];
  }
  throw new Error('Perfume not found');
}

export async function deletePerfume(id: string) {
  await delay(1000);
  const index = perfumes.findIndex(p => p.id === id);
  if (index !== -1) {
    const deletedPerfume = perfumes.splice(index, 1)[0];
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/aroma/${deletedPerfume.jenisAroma}`);
    return { message: 'Perfume deleted successfully' };
  }
  throw new Error('Perfume not found');
}
