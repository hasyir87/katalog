'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Perfume } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Perfume>[] = [
  {
    accessorKey: 'kualitas',
    header: 'Kualitas',
    cell: ({ row }) => <div className="capitalize">{row.getValue('kualitas')}</div>
  },
  {
    accessorKey: 'sex',
    header: 'Sex',
    cell: ({ row }) => {
        const sex = row.getValue('sex');
        const formattedSex = sex === 'Male' ? 'Pria' : sex === 'Female' ? 'Wanita' : 'Unisex';
        return <div>{formattedSex}</div>;
    }
  },
  {
    accessorKey: 'namaParfum',
    header: 'Nama Parfum',
  },
  {
    accessorKey: 'jenisAroma',
    header: 'Jenis Aroma',
    cell: ({ row }) => <Badge variant="outline">{row.original.jenisAroma}</Badge>
  },
  {
    accessorKey: 'penggunaan',
    header: 'Penggunaan',
  },
  {
    accessorKey: 'deskripsiParfum',
    header: 'Deskripsi',
    cell: ({ row }) => <div className="line-clamp-2 max-w-xs">{row.original.deskripsiParfum}</div>
  },
  {
    accessorKey: 'lokasi',
    header: 'Lokasi',
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
