import {z} from 'genkit';

export const RecommendPerfumeInputSchema = z.object({
  query: z.string().describe('The user query to find perfumes based on preference.'),
});
export type RecommendPerfumeInput = z.infer<typeof RecommendPerfumeInputSchema>;

export const PerfumeSchema = z.object({
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

export const RecommendPerfumeOutputSchema = z.object({
  recommendations: z.array(PerfumeSchema).describe('An array of recommended perfumes based on the user query.'),
});
export type RecommendPerfumeOutput = z.infer<typeof RecommendPerfumeOutputSchema>;
