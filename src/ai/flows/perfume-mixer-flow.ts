'use server';

/**
 * @fileOverview An AI agent to create perfume mix recipes.
 *
 * - mixPerfume - A function that handles the perfume mixing process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PerfumeMixerInputSchema, PerfumeMixerOutputSchema, type PerfumeMixerInput, type PerfumeMixerOutput } from '@/ai/schema/perfume-mixer-schema';
import { PerfumeSchema } from '@/ai/schema/perfume-recommendation-schema';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';


const getRelevantPerfumes = ai.defineTool({
  name: 'getRelevantPerfumesForMixer',
  description: 'Retrieves existing perfumes from the database based on user-provided scent preferences to be used as ingredients for a new mix.',
  inputSchema: z.object({
    query: z.string().describe('The user query describing the desired scent profile for the mix. e.g., "woody and citrus for a summer evening", "a powerful floral scent".'),
  }),
  outputSchema: z.array(PerfumeSchema),
}, async (input) => {
  try {
    const db = await getDb();
    const perfumesCollection = db.collection('perfumes');
    const snapshot = await perfumesCollection.get();
    const allPerfumes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));

    const query = input.query.toLowerCase();
    const keywords = query.split(' ').filter(kw => kw.length > 2);

    if (keywords.length === 0) return [];

    const filteredPerfumes = allPerfumes.filter(p => {
      const combinedText = [
        p.namaParfum,
        p.deskripsiParfum,
        p.topNotes,
        p.middleNotes,
        p.baseNotes,
        p.jenisAroma,
        p.penggunaan,
        p.lokasi,
        p.sex,
        p.kualitas,
      ].join(' ').toLowerCase();
      return keywords.some(keyword => combinedText.includes(keyword));
    });

    // Return up to 5 relevant perfumes to be used as potential ingredients.
    return filteredPerfumes.slice(0, 5).map(p => ({
        Number: p.number ?? 0,
        Nama_Parfum: p.namaParfum,
        Deskripsi_Parfum: p.deskripsiParfum,
        Top_Notes: p.topNotes,
        Middle_Notes: p.middleNotes,
        Base_Notes: p.baseNotes,
        Penggunaan: p.penggunaan,
        Sex: p.sex,
        Lokasi: p.lokasi,
        Jenis_Aroma: p.jenisAroma,
        Kualitas: p.kualitas,
    }));
  } catch (error) {
    console.error("Error fetching perfumes for AI mixer tool:", error);
    return [];
  }
});


export async function mixPerfume(input: PerfumeMixerInput): Promise<PerfumeMixerOutput> {
  return perfumeMixerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'perfumeMixerPrompt',
  input: { schema: PerfumeMixerInputSchema },
  output: { schema: PerfumeMixerOutputSchema },
  tools: [getRelevantPerfumes],
  prompt: `You are an expert perfumer, a "nose," with a talent for creating unique scent combinations.
A user wants you to create a new perfume mix based on their preferences.

Your task is to:
1.  Analyze the user's query to understand the desired scent profile, occasion, and feeling.
2.  Use the 'getRelevantPerfumesForMixer' tool to find 2-3 existing perfumes from the database that could serve as excellent base ingredients for the mix.
3.  Based on the tool results, invent a recipe for a new scent.
4.  Give your new creation a creative and fitting name.
5.  Specify the mixing recipe, including the names of the source perfumes and the recommended proportions (e.g., "2 parts 'Sunset Oud', 1 part 'Ocean Breeze'").
6.  Write a compelling description of the final mixed aroma, explaining how the notes from the source perfumes combine to create a new, harmonious experience.
7.  If the tool returns no relevant perfumes, respond by saying you couldn't find suitable ingredients and ask the user to try a different, more specific query.

User's Request: {{{preference}}}
`,
});

const perfumeMixerFlow = ai.defineFlow(
  {
    name: 'perfumeMixerFlow',
    inputSchema: PerfumeMixerInputSchema,
    outputSchema: PerfumeMixerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("The AI failed to generate a perfume mix.");
    }
    
    return output;
  }
);
