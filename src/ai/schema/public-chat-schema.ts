import {z} from 'genkit';

export const PublicChatInputSchema = z.object({
  query: z.string().describe('The user query or message.'),
});
export type PublicChatInput = z.infer<typeof PublicChatInputSchema>;

export const PublicChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user query.'),
});
export type PublicChatOutput = z.infer<typeof PublicChatOutputSchema>;
