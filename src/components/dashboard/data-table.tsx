'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef, SortingState, VisibilityState, RowSelectionState, OnChangeFn } from '@tanstack/react-table';
import { useDebouncedCallback } from 'use-debounce';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/components/ui/data-table/data-table-view-options';
import { Input } from "@/components/ui/input"

// Menambahkan batasan generik untuk memastikan data memiliki properti `id`
interface BaseData {
    id: string;
}

interface DataTableProps<TData extends BaseData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick: (data: TData) => void;
  selectedPerfumeId?: string | null;
  rowSelection: RowSelectionState;
  // Menggunakan tipe yang benar dari @tanstack/react-table
  setRowSelection: OnChangeFn<RowSelectionState>; 
}

export function DataTable<TData extends BaseData, TValue>({
  columns,
  data,
  onRowClick,
  selectedPerfumeId,
  rowSelection,
  setRowSelection
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true, 
    getRowId: (row) => row.id, // Memberi tahu tabel cara mendapatkan ID baris
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0">
            <Input
              placeholder="Cari berdasarkan nama parfum..."
              defaultValue={searchParams.get('q') || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
           <DataTableViewOptions table={table} />
        </div>
      <div className="rounded-md border flex-grow overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick(row.original)}
                  className={`cursor-pointer ${row.original.id === selectedPerfumeId ? 'bg-muted/50' : ''}`}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex-shrink-0">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
