
'use client';

import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';
import type { Perfume } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ExcelExporterProps {
  data: Perfume[];
}

export function ExcelExporter({ data }: ExcelExporterProps) {
  const { toast } = useToast();

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada Data',
        description: 'Tidak ada data parfum untuk diekspor.',
      });
      return;
    }

    try {
      // Map the data to match the import format headers for consistency
      const dataToExport = data.map(p => ({
        'Nama Parfum': p.namaParfum,
        'Deskripsi Parfum': p.deskripsiParfum,
        'Top Notes': p.topNotes,
        'Middle Notes': p.middleNotes,
        'Base Notes': p.baseNotes,
        'Penggunaan': p.penggunaan,
        'Sex': p.sex === 'Male' ? 'Pria' : p.sex === 'Female' ? 'Wanita' : 'Unisex',
        'Lokasi': p.lokasi,
        'Jenis Aroma': p.jenisAroma,
        'Kualitas': p.kualitas,
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Perfumes');

      // Generate a filename with the current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `perfume_backup_${date}.xlsx`;

      XLSX.writeFile(workbook, filename);

      toast({
        title: 'Ekspor Berhasil!',
        description: `${data.length} data parfum telah diekspor.`,
      });

    } catch (error) {
      console.error('Failed to export data to Excel:', error);
      toast({
        variant: 'destructive',
        title: 'Ekspor Gagal',
        description: 'Terjadi kesalahan saat membuat file Excel.',
      });
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
      <DownloadCloud className="mr-2 h-4 w-4" />
      Ekspor ke Excel
    </Button>
  );
}
