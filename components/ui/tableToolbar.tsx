// components/TableToolbar.tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

interface TableToolbarProps {
  globalSearch: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  placeholder?: string;
}

export function TableToolbar({
  globalSearch,
  onSearchChange,
  onReset,
  hasActiveFilters,
  placeholder = 'Поиск...',
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder={placeholder}
          value={globalSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <X className="h-4 w-4 mr-1" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}