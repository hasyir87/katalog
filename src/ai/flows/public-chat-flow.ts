'use server';

/**
 * @fileOverview A conversational AI chat agent for public users.
 * This flow is READ-ONLY and cannot modify the database.
 *
 * - publicChat - A function that handles the public chat process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PublicChatInputSchema, PublicChatOutputSchema, type PublicChatInput, type PublicChatOutput } from '@/ai/schema/public-chat-schema';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';

// Base schema for a perfume, used by the tool.
const PerfumeSchema = z.object({
  Number: z.number(),
  Nama_Parfum: z.string(),
  Deskripsi_Parfum: z.string(),
  Top_Notes: z.string(),
  Middle_Notes: z.string(),
  Base_Notes: z.string(),
  Penggunaan: z.string(),
  Sex: z.string(),
  Lokasi: z.string(),
  Jenis_Aroma: z.string(),
  Kualitas: z.string(),
});

const queryDatabase = ai.defineTool({
  name: 'queryDatabase',
  description: 'Searches the perfume database for entries matching a natural language query. Use this to answer any questions about specific perfumes, scents, occasions, or to provide recommendations.',
  inputSchema: z.object({
    query: z.string().describe('The natural language query to search for perfumes. For example: "sweet and floral for daytime", "unisex extrait quality", "perfumes with jasmine".'),
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

    const filteredPerfumes = allPerfumes
      .map(p => {
        const combinedText = [
          p.namaParfum, p.deskripsiParfum, p.topNotes, p.middleNotes, p.baseNotes,
          p.jenisAroma, p.penggunaan, p.lokasi, p.sex, p.kualitas,
        ].join(' ').toLowerCase();
        
        const matchCount = keywords.reduce((count, keyword) => 
          combinedText.includes(keyword) ? count + 1 : count, 0);

        return { perfume: p, matchCount };
      })
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    return filteredPerfumes.slice(0, 5).map(item => ({
        Number: item.perfume.number ?? 0,
        Nama_Parfum: item.perfume.namaParfum,
        Deskripsi_Parfum: item.perfume.deskripsiParfum,
        Top_Notes: item.perfume.topNotes,
        Middle_Notes: item.perfume.middleNotes,
        Base_Notes: item.perfume.baseNotes,
        Penggunaan: item.perfume.penggunaan,
        Sex: item.perfume.sex,
        Lokasi: item.perfume.lokasi,
        Jenis_Aroma: item.perfume.jenisAroma,
        Kualitas: item.perfume.kualitas,
    }));
  } catch (error) {
    console.error("Error executing public queryDatabase tool:", error);
    return [];
  }
});


export async function publicChat(input: PublicChatInput): Promise<PublicChatOutput> {
  return publicChatFlow(input);
}

const publicChatFlow = ai.defineFlow(
  {
    name: 'publicChatFlow',
    inputSchema: PublicChatInputSchema,
    outputSchema: PublicChatOutputSchema,
  },
  async (input) => {

    const mainPrompt = ai.definePrompt({
        name: 'publicChatPrompt',
        input: { schema: PublicChatInputSchema },
        tools: [queryDatabase],
        prompt: `You are a friendly and helpful shopping assistant for a perfume catalog named 'Aroma'. Your ONLY function is to help users discover and learn about perfumes.

- **Your Goal:** Help the user find the perfect perfume from the catalog.
- **Analyze the user's request:** If the user is asking for recommendations or information about perfumes (e.g., "find me a floral scent", "tell me about Sunset Oud", "what do you have for men?"), use the 'queryDatabase' tool to find relevant information.

- **Interaction rules:**
  - After using the tool and getting results, present them clearly and conversationally. Do not just dump JSON. Summarize your findings and list the recommended perfumes.
  - If the tool returns no results, inform the user kindly and suggest they try a different or more general query.
  - **IMPORTANT:** If the user asks a question NOT related to perfumes, or asks to mix perfumes, you MUST politely decline. Say: "Maaf, saya hanya bisa membantu dengan pertanyaan seputar parfum di katalog kami." Do not answer any other questions. You CANNOT mix perfumes.

User's message: {{{query}}}
`,
    });

    const llmResponse = await mainPrompt(input);
    
    // Just return the AI's response.
    const finalResponse = await llmResponse.output();
    if (!finalResponse) {
      return { response: "Maaf, saya tidak dapat memproses permintaan itu. Silakan coba lagi." };
    }

    return { response: finalResponse };
  }
);
