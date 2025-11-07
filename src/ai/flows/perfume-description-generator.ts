'use server';
/**
 * @fileOverview An AI agent to generate perfume descriptions based on attributes.
 *
 * - generatePerfumeDescription - A function that generates perfume descriptions.
 * - PerfumeDescriptionInput - The input type for the generatePerfumeDescription function.
 * - PerfumeDescriptionOutput - The return type for the generatePerfumeDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerfumeDescriptionInputSchema = z.object({
  namaParfum: z.string().describe('The name of the perfume.'),
  topNotes: z.string().describe('The top notes of the perfume.'),
  middleNotes: z.string().describe('The middle notes of the perfume.'),
  baseNotes: z.string().describe('The base notes of the perfume.'),
  penggunaan: z.string().describe('The use case of the perfume (e.g., day, night, special occasion).'),
  sex: z.string().describe('The gender associated with the perfume (e.g., male, female, unisex).'),
  jenisAroma: z.string().describe('The type/family of scent of the perfume (e.g. floral, woody, citrus).'),
  kualitas: z.string().describe('The quality or concentration of the perfume (e.g., Eau de Parfum, Eau de Toilette).'),
});
export type PerfumeDescriptionInput = z.infer<typeof PerfumeDescriptionInputSchema>;

const PerfumeDescriptionOutputSchema = z.object({
  deskripsiParfum: z.string().describe('A detailed description of the perfume, suitable for marketing or catalog purposes.'),
});
export type PerfumeDescriptionOutput = z.infer<typeof PerfumeDescriptionOutputSchema>;

export async function generatePerfumeDescription(input: PerfumeDescriptionInput): Promise<PerfumeDescriptionOutput> {
  return perfumeDescriptionGeneratorFlow(input);
}

const perfumeDescriptionPrompt = ai.definePrompt({
  name: 'perfumeDescriptionPrompt',
  input: {schema: PerfumeDescriptionInputSchema},
  output: {schema: PerfumeDescriptionOutputSchema},
  prompt: `You are an expert perfume descriptor, skilled in creating compelling and evocative descriptions.
  Based on the attributes of the perfume, create a description that highlights its unique qualities and makes it appealing to potential customers.
  Use the following information to craft the description:

  Name: {{{namaParfum}}}
  Top Notes: {{{topNotes}}}
  Middle Notes: {{{middleNotes}}}
  Base Notes: {{{baseNotes}}}
  Use Case: {{{penggunaan}}}
  Gender: {{{sex}}}
  Scent Type: {{{jenisAroma}}}
  Quality: {{{kualitas}}}

  Write a detailed and engaging description of the perfume that captures its essence.
  `,
});

const perfumeDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'perfumeDescriptionGeneratorFlow',
    inputSchema: PerfumeDescriptionInputSchema,
    outputSchema: PerfumeDescriptionOutputSchema,
  },
  async input => {
    const {output} = await perfumeDescriptionPrompt(input);
    return output!;
  }
);
