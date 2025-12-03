export type Perfume = {
  id: string;
  namaParfum: string;
  deskripsiParfum: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  penggunaan: string;
  sex: 'Male' | 'Female' | 'Unisex';
  lokasi: string;
  jenisAroma: string;
  number?: number;
};
