'use client';

import type { Perfume } from '@/lib/types';
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { deletePerfume } from '@/lib/actions';
import { toast } from '@/hooks/use-toast';
import { QrCodeModal } from './qr-code-modal';

// Fungsi untuk menangani penghapusan parfum
const handleDelete = async (id: string, name: string) => {
  const confirmed = confirm(`Apakah Anda yakin ingin menghapus parfum "${name}"?`);
  if (confirmed) {
    try {
      await deletePerfume(id);
      toast({ title: `Parfum "${name}" berhasil dihapus.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal menghapus parfum. Silakan coba lagi.' });
    }
  }
};

export const columns: ColumnDef<Perfume>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="No" />,
    cell: ({ row }) => <div className="w-[30px]">{row.index + 1}</div>,
    enableSorting: false, // Sorting by display index doesn't make sense
  },
  {
    accessorKey: 'namaParfum',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Parfum" />,
    cell: ({ row }) => <div>{row.getValue('namaParfum')}</div>,
  },
  {
    accessorKey: 'kualitas',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kualitas" />,
    cell: ({ row }) => <div>{row.getValue('kualitas')}</div>,
  },
  {
    accessorKey: 'jenisAroma',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis Aroma" />,
    cell: ({ row }) => <div>{row.getValue('jenisAroma')}</div>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const perfume = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {/* Tombol QR Code */}
          <QrCodeModal perfumeId={perfume.id} perfumeName={perfume.namaParfum} />

          {/* Tombol Edit */}
          <Button asChild variant="outline" size="icon">
            <Link href={`/dashboard/edit/${perfume.id}`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>

          {/* Tombol Hapus */}
          <Button
            variant="destructive" // Menggunakan variant "destructive" untuk warna merah
            size="icon"
            onClick={() => handleDelete(perfume.id, perfume.namaParfum)}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Hapus</span>
          </Button>
        </div>
      );
    },
  },
];
