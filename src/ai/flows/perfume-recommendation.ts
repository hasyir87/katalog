
'use server';

/**
 * @fileOverview A perfume recommendation AI agent.
 *
 * - recommendPerfume - A function that handles the perfume recommendation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RecommendPerfumeInputSchema, RecommendPerfumeOutputSchema, PerfumeSchema, type RecommendPerfumeInput, type RecommendPerfumeOutput } from '@/ai/schema/perfume-recommendation-schema';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';


const getRelevantPerfumes = ai.defineTool({
  name: 'getRelevantPerfumes',
  description: 'Retrieves perfumes from the database based on the user provided query.',
  inputSchema: z.object({
    query: z.string().describe('The user query to find perfumes based on preference. Can be about scent, occasion, gender, or quality.'),
  }),
  outputSchema: z.array(PerfumeSchema),
}, async (input) => {
  try {
    const db = await getDb();
    const perfumesCollection = db.collection('perfumes');
    const snapshot = await perfumesCollection.get();
    const allPerfumes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Perfume));

    // For simplicity, we'll do a basic text search across relevant fields.
    // A more advanced implementation might use embeddings or more complex queries.
    const query = input.query.toLowerCase();
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
      return combinedText.includes(query);
    });

    // Map to the AI schema, ensuring all fields are strings or numbers as defined.
    return filteredPerfumes.map(p => ({
        Number: p.number,
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
    console.error("Error fetching perfumes for AI tool:", error);
    // Return empty array on error to prevent AI flow from crashing.
    return [];
  }
});

export async function recommendPerfume(input: RecommendPerfumeInput): Promise<RecommendPerfumeOutput> {
  return recommendPerfumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendPerfumePrompt',
  input: { schema: RecommendPerfumeInputSchema },
  output: { schema: RecommendPerfumeOutputSchema },
  tools: [getRelevantPerfumes],
  prompt: `You are a perfume expert. The user is asking for a perfume recommendation based on their preferences.

  Based on the user's query, use the getRelevantPerfumes tool to find perfumes that match their needs.

  User Query: {{{query}}}

  After getting the results from the tool, analyze them and return the top 4 most relevant recommendations to the user in the requested JSON format.
  If no relevant perfumes are found, return an empty array for recommendations.
  `,
});

const recommendPerfumeFlow = ai.defineFlow(
  {
    name: 'recommendPerfumeFlow',
    inputSchema: RecommendPerfumeInputSchema,
    outputSchema: RecommendPerfumeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
