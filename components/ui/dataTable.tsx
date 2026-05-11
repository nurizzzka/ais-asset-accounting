// components/DataTable.tsx (универсальный компонент)
'use client';

import { ReactNode } from 'react';
import { useTableData } from '@/hooks/useTableData';
import { SortableHeader } from '@/components/ui/sortableHeader';
import { TableToolbar } from '@/components/ui/tableToolbar';
import {
  Table,
  TableBody,
  TableCaption,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface Column<T> {
  field: keyof T;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  searchFields = [],
  searchPlaceholder = 'Поиск...',
  onRowClick,
}: DataTableProps<T>) {
  const {
    data: filteredData,
    sortConfig,
    handleSort,
    globalSearch,
    setGlobalSearch,
    resetAll,
    hasActiveFilters,
  } = useTableData<T>({
    data,
    initialSort: { field: columns[0]?.field as string || 'id', direction: 'asc' },
    searchFields,
  });

  return (
    <div>
      <TableToolbar
        globalSearch={globalSearch}
        onSearchChange={setGlobalSearch}
        onReset={resetAll}
        hasActiveFilters={hasActiveFilters}
        placeholder={searchPlaceholder}
      />
      
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              col.sortable !== false ? (
                <SortableHeader
                  key={String(col.field)}
                  field={String(col.field)}
                  label={col.label}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className={col.className}
                />
              ) : (
                <TableHead key={String(col.field)} className={col.className}>
                  {col.label}
                </TableHead>
              )
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item, idx) => (
              <TableRow 
                key={idx} 
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((col) => (
                  <TableCell key={String(col.field)} className={col.className}>
                    {col.render ? col.render(item) : item[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}