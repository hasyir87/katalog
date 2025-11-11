'use server';

/**
 * @fileOverview A conversational AI chat agent that can interact with the perfume database.
 * This is the ADMIN chat flow with write capabilities.
 *
 * - chatWithAI - A function that handles the chat process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ChatInputSchema, ChatOutputSchema, type ChatInput, type ChatOutput } from '@/ai/schema/chat-schema';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';
import { PerfumeMixerOutputSchema } from '@/ai/schema/perfume-mixer-schema';

// Base schema for a perfume, used by both tools.
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

    return filteredPerfumes.slice(0, 10).map(item => ({
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
    console.error("Error executing queryDatabase tool:", error);
    return [];
  }
});

const getRelevantPerfumesForMixer = ai.defineTool({
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

    return filteredPerfumes.slice(0, 10).map(item => ({
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
    console.error("Error fetching perfumes for AI mixer tool:", error);
    return [];
  }
});


export async function chatWithAI(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const MixerPrompt = ai.definePrompt({
    name: 'perfumeMixerPromptInternal',
    input: { schema: z.object({ preference: z.string(), ingredients: z.array(PerfumeSchema) }) },
    output: { schema: PerfumeMixerOutputSchema },
    prompt: `You are an expert perfumer, a "nose," with a talent for creating unique scent combinations.
A user wants you to create a new perfume mix based on their preferences.

Your task is to:
1.  Analyze the user's preference and the provided list of potential perfume ingredients.
2.  Select 2-3 of the most suitable perfumes from the list to serve as base ingredients for the mix.
3.  Invent a recipe for a new scent.
4.  Give your new creation a creative and fitting name.
5.  Specify the mixing recipe, including the names of the source perfumes and the recommended proportions (e.g., "2 parts 'Sunset Oud', 1 part 'Ocean Breeze'").
6.  Write a compelling description of the final mixed aroma, explaining how the notes from the source perfumes combine to create a new, harmonious experience.
7.  If the provided ingredient list is empty, respond by saying you couldn't find suitable ingredients and ask the user to try a different, more specific query.

User's Request: {{{preference}}}

Available Ingredients:
{{#each ingredients}}
- {{Nama_Parfum}}: {{Deskripsi_Parfum}}
{{/each}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {

    const mainPrompt = ai.definePrompt({
        name: 'chatRouterPrompt',
        input: { schema: ChatInputSchema },
        tools: [queryDatabase, getRelevantPerfumesForMixer],
        prompt: `You are a helpful AI assistant for a perfume catalog named 'Aroma'. Your ONLY function is to discuss perfumes.

- **Analyze the user's intent:**
  - If the user is asking for recommendations or information about perfumes (e.g., "find me a floral scent", "tell me about Sunset Oud"), use the 'queryDatabase' tool.
  - If the user wants to create a new mix or blend (e.g., "mix something woody and spicy", "create a recipe for a summer scent"), use the 'getRelevantPerfumesForMixer' tool.
  - If the user provides a file, analyze its content to inform your tool query.

- **Interaction rules:**
  - After using a tool and getting results, present them clearly. Do not just dump JSON. Summarize findings, list perfumes, or present the created mix recipe.
  - If a tool returns no results, inform the user kindly and suggest a different query.
  - **IMPORTANT:** If the user asks a question NOT related to perfumes, you MUST politely decline. Say: "Maaf, saya hanya bisa membantu dengan pertanyaan seputar parfum." Do not answer any other questions.

User's message: {{{query}}}

{{#if fileDataUri}}
The user has also uploaded a file. Here is its content:
'''
{{media url=fileDataUri}}
'''
{{/if}}
`,
    });

    const llmResponse = await mainPrompt(input);
    const toolOutputs = await llmResponse.toolRequest?.waitForToolResults();

    // Check if the mixer tool was called
    const mixerRequest = llmResponse.toolRequests.find(req => req.tool.name === 'getRelevantPerfumesForMixer');
    const mixerOutput = toolOutputs?.results.find(res => res.tool.name === 'getRelevantPerfumesForMixer');

    if (mixerRequest && mixerOutput) {
        const ingredients = mixerOutput.output as z.infer<typeof PerfumeSchema>[];
        if (ingredients.length === 0) {
            return { response: "Maaf, saya tidak dapat menemukan bahan yang cocok untuk permintaan Anda. Coba deskripsikan aroma yang Anda inginkan dengan lebih spesifik." };
        }

        // If we have ingredients, call a second prompt to generate the mix recipe.
        const mixResult = await MixerPrompt({
            preference: input.query,
            ingredients: ingredients
        });
        
        const recipe = mixResult.output!;
        const formattedResponse = `Tentu, saya telah membuat resep spesial untuk Anda!\n\n**Nama Campuran:** ${recipe.mixName}\n\n**Resep:**\n${recipe.recipe.map(r => `- ${r.parts} bagian "${r.perfumeName}"`).join('\n')}\n\n**Deskripsi Aroma:**\n${recipe.description}`;
        
        return { response: formattedResponse };
    }
    
    // If it wasn't a mixer request, just return the AI's response.
    const finalResponse = await llmResponse.output();
    if (!finalResponse) {
      return { response: "Maaf, saya tidak dapat memproses permintaan itu. Silakan coba lagi." };
    }

    return { response: finalResponse };
  }
);
