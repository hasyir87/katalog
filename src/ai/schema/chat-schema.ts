import {z} from 'genkit';

export const ChatInputSchema = z.object({
  query: z.string().describe('The user query or message.'),
  fileDataUri: z
    .string()
    .optional()
    .describe(
      "A file, if provided, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user query.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
