'use server';

/**
 * @fileOverview A conversational AI chat agent that can interact with the perfume database.
 *
 * - chatWithAI - A function that handles the chat process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ChatInputSchema, ChatOutputSchema, type ChatInput, type ChatOutput } from '@/ai/schema/chat-schema';
import { PerfumeSchema } from '@/ai/schema/perfume-recommendation-schema';
import { getDb } from '@/firebase/server-init';
import type { Perfume } from '@/lib/types';


const queryDatabase = ai.defineTool({
  name: 'queryDatabase',
  description: 'Searches the perfume database for entries matching a natural language query. Use this to answer any questions about specific perfumes, scents, occasions, etc.',
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

    // A more advanced implementation might use vector search/embeddings.
    // For now, we perform a case-insensitive text search across multiple fields.
    const query = input.query.toLowerCase();
    const keywords = query.split(' ').filter(kw => kw.length > 2); // Get keywords

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
      // Check if all keywords are present in the combined text
      return keywords.every(keyword => combinedText.includes(keyword));
    });

    // Map to the AI schema, ensuring all fields are correctly typed and named.
    return filteredPerfumes.slice(0, 10).map(p => ({ // Limit to 10 results
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
    console.error("Error executing queryDatabase tool:", error);
    return []; // Return empty on error to allow the AI to respond gracefully.
  }
});

export async function chatWithAI(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [queryDatabase],
  prompt: `You are a helpful AI assistant for a perfume catalog. Your name is 'Aroma'.

- Your primary function is to answer user questions about the perfumes in the database.
- Use the 'queryDatabase' tool whenever the user asks for perfume recommendations or information about perfumes. Formulate your tool query based on the user's message.
- If the user provides a file, analyze its content. The file content will be available in the prompt. You can use the file content to inform your database query. For example, if the file contains "notes of rose and sandalwood", use that to query the database.
- When you get results from the tool, present them to the user in a clear, friendly, and readable format. Do not just dump the JSON. Summarize the findings. If you found multiple perfumes, list them out.
- If the tool returns no results, inform the user kindly and suggest they try a different query.
- If the user asks a general question not related to perfumes, answer it politely but briefly, and gently guide them back to the topic of perfumes.

User's message: {{{query}}}

{{#if fileDataUri}}
The user has also uploaded a file. Here is its content:
'''
{{media url=fileDataUri}}
'''
{{/if}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output;

    if (!output) {
      return { response: "I'm sorry, I couldn't process that request. Please try again." };
    }
    
    // Check if the model decided to use a tool
    if (llmResponse.toolRequests.length > 0) {
      // The Genkit prompt handler automatically calls the tool and re-prompts the model
      // with the tool's output. The final response will be in llmResponse.output.
      // So we just need to format the final text response.
    }
    
    return { response: output.response };
  }
);
