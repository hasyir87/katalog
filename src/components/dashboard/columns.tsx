'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Perfume } from '@/lib/types';
import { ChevronRight, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<Perfume>[] = [
  {
    id: 'number',
    header: () => (
      <div className="px-3 text-center w-[50px]">No.</div>
    ),
    cell: ({ row, table }) => (
       <div className="text-center">
        {table.getSortedRowModel().rows.findIndex(sortedRow => sortedRow.id === row.id) + 1}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'kualitas',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Kualitas
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize line-clamp-1 max-w-[100px]">{row.getValue('kualitas')}</div>
  },
  {
    accessorKey: 'sex',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sex
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const sex = row.getValue('sex');
        const formattedSex = sex === 'Male' ? 'Pria' : sex === 'Female' ? 'Wanita' : 'Unisex';
        return <div className="line-clamp-1 max-w-[80px]">{formattedSex}</div>;
    }
  },
  {
    accessorKey: 'namaParfum',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nama Parfum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
