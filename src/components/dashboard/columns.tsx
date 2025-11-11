'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Perfume } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Perfume>[] = [
  {
    accessorKey: 'kualitas',
    header: 'Kualitas',
    cell: ({ row }) => <div className="capitalize line-clamp-1 max-w-[100px]">{row.getValue('kualitas')}</div>
  },
  {
    accessorKey: 'sex',
    header: 'Sex',
    cell: ({ row }) => {
        const sex = row.getValue('sex');
        const formattedSex = sex === 'Male' ? 'Pria' : sex === 'Female' ? 'Wanita' : 'Unisex';
        return <div className="line-clamp-1 max-w-[80px]">{formattedSex}</div>;
    }
  },
  {
    accessorKey: 'namaParfum',
    header: 'Nama Parfum',
    cell: ({ row }) => <div className="line-clamp-1 font-medium max-w-[200px]">{row.getValue('namaParfum')}</div>,
  },
  {
    accessorKey: 'jenisAroma',
    header: 'Jenis Aroma',
    cell: ({ row }) => (
        <div className="line-clamp-1 max-w-[120px]">
            <Badge variant="outline">{row.original.jenisAroma}</Badge>
        </div>
    )
  },
  {
    accessorKey: 'penggunaan',
    header: 'Penggunaan',
    cell: ({ row }) => <div className="line-clamp-1 max-w-[120px]">{row.getValue('penggunaan')}</div>
  },
  {
    accessorKey: 'deskripsiParfum',
    header: 'Deskripsi',
    cell: ({ row }) => <div className="line-clamp-1 max-w-xs">{row.original.deskripsiParfum}</div>
  },
  {
    accessorKey: 'lokasi',
    header: 'Lokasi',
    cell: ({ row }) => <div className="line-clamp-1 max-w-[120px]">{row.getValue('lokasi')}</div>
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <div className="flex justify-end">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    },
  },
];
