'use server';

/**
 * @fileOverview A perfume recommendation AI agent.
 *
 * - recommendPerfume - A function that handles the perfume recommendation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RecommendPerfumeInputSchema, RecommendPerfumeOutputSchema, PerfumeSchema, type RecommendPerfumeInput, type RecommendPerfumeOutput } from '@/ai/schema/perfume-recommendation-schema';


const getRelevantPerfumes = ai.defineTool({
  name: 'getRelevantPerfumes',
  description: 'Retrieves perfumes from the database based on the user provided query.',
  inputSchema: z.object({
    query: z.string().describe('The user query to find perfumes based on preference.'),
  }),
  outputSchema: z.array(PerfumeSchema),
}, async (input) => {
  // TODO: Implement the database retrieval logic here
  // Replace this with actual data retrieval from the database
  const mockPerfumes: z.infer<typeof PerfumeSchema>[] = [
    {
      Number: 1,
      Nama_Parfum: 'Rose Delight',
      Deskripsi_Parfum: 'A floral fragrance with a hint of spice.',
      Top_Notes: 'Rose, Bergamot',
      Middle_Notes: 'Jasmine, Violet',
      Base_Notes: 'Sandalwood, Musk',
      Penggunaan: 'Daytime',
      Sex: 'Female',
      Lokasi: 'Office',
      Jenis_Aroma: 'Floral',
      Kualitas: 'High',
    },
    {
      Number: 2,
      Nama_Parfum: 'Ocean Breeze',
      Deskripsi_Parfum: 'A refreshing aquatic fragrance.',
      Top_Notes: 'Sea Salt, Lemon',
      Middle_Notes: 'Marine Accord, Lavender',
      Base_Notes: 'Driftwood, Ambergris',
      Penggunaan: 'Casual',
      Sex: 'Male',
      Lokasi: 'Beach',
      Jenis_Aroma: 'Aquatic',
      Kualitas: 'Medium',
    },
  ];

  // Filter perfumes based on the query (simple example, refine as needed)
  const filteredPerfumes = mockPerfumes.filter(perfume =>
    perfume.Deskripsi_Parfum.toLowerCase().includes(input.query.toLowerCase()) ||
    perfume.Top_Notes.toLowerCase().includes(input.query.toLowerCase()) ||
    perfume.Middle_Notes.toLowerCase().includes(input.query.toLowerCase()) ||
    perfume.Base_Notes.toLowerCase().includes(input.query.toLowerCase())
  );

  return filteredPerfumes;
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

  Return the recommendations in the requested JSON format.
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
