// components/SortableHeader.tsx
import { TableHead } from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
  field: string;
  label: string;
  sortConfig: { field: string; direction: 'asc' | 'desc' | null };
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHeader({ field, label, sortConfig, onSort, className }: SortableHeaderProps) {
  const isActive = sortConfig.field === field;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 ${className || ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {direction === 'asc' && <ArrowUp className="h-3 w-3" />}
        {direction === 'desc' && <ArrowDown className="h-3 w-3" />}
        {!isActive && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
      </div>
    </TableHead>
  );
}