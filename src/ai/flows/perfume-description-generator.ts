'use server';
/**
 * @fileOverview An AI agent to generate perfume descriptions based on attributes.
 *
 * - generatePerfumeDescription - A function that generates perfume descriptions.
 */

import {ai} from '@/ai/genkit';
import { PerfumeDescriptionInputSchema, PerfumeDescriptionOutputSchema, type PerfumeDescriptionInput, type PerfumeDescriptionOutput } from '@/ai/schema/perfume-description-schema';

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
