import {z} from 'genkit';

export const PerfumeMixerInputSchema = z.object({
  preference: z.string().describe('The user\'s preference for the perfume mix, e.g., "something woody and citrusy for a summer evening".'),
});
export type PerfumeMixerInput = z.infer<typeof PerfumeMixerInputSchema>;

export const PerfumeMixerOutputSchema = z.object({
  mixName: z.string().describe('A creative and fitting name for the new perfume mix.'),
  recipe: z.array(z.object({
    perfumeName: z.string().describe('The name of the source perfume to use in the mix.'),
    parts: z.number().describe('The proportion or number of parts for this perfume in the mix.'),
  })).describe('The recipe for the mix, specifying source perfumes and their proportions.'),
  description: z.string().describe('A compelling description of the final mixed aroma and its character.'),
});
export type PerfumeMixerOutput = z.infer<typeof PerfumeMixerOutputSchema>;
