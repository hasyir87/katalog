export type Perfume = {
  id: string;
  number: number;
  namaParfum: string;
  deskripsiParfum: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  penggunaan: string;
  sex: 'Male' | 'Female' | 'Unisex';
  lokasi: string;
  jenisAroma: string;
  kualitas: 'Premium' | 'Extrait';
};
