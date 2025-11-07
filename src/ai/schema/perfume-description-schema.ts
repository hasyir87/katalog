import {z} from 'genkit';

export const PerfumeDescriptionInputSchema = z.object({
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

export const PerfumeDescriptionOutputSchema = z.object({
  deskripsiParfum: z.string().describe('A detailed description of the perfume, suitable for marketing or catalog purposes.'),
});
export type PerfumeDescriptionOutput = z.infer<typeof PerfumeDescriptionOutputSchema>;
