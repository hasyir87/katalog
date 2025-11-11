'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Perfume } from '@/lib/types';


interface DataTableProps<TData extends Perfume, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick: (row: TData) => void;
  selectedPerfumeId?: string | null;
}

export function DataTable<TData extends Perfume, TValue>({
  columns,
  data,
  onRowClick,
  selectedPerfumeId
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    // We don't need pagination for this view
    // so we disable the default pagination controls
    // by overriding the pageCount.
    pageCount: -1,
  });

  return (
    <div className="h-full flex flex-col">
        <div className="flex items-center py-4">
            <Input
            placeholder="Filter by name..."
            value={(table.getColumn("namaParfum")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("namaParfum")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
        </div>
      <div className="rounded-md border flex-grow overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} className="p-0">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.original.id === selectedPerfumeId ? 'selected' : ''}
                  onClick={() => onRowClick(row.original)}
                  className={cn(
                    "cursor-pointer",
                    row.original.id === selectedPerfumeId && "bg-muted/80 hover:bg-muted"
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2 px-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
