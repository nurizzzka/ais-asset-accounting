// hooks/useTableData.ts
import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  value: string | number | boolean | null;
}

export interface UseTableDataOptions<T> {
  data: T[];
  initialSort?: SortConfig;
  initialFilters?: FilterConfig[];
  searchFields?: (keyof T)[]; // поля для глобального поиска
}

export function useTableData<T extends Record<string, any>>({
  data,
  initialSort = { field: 'id', direction: 'asc' },
  initialFilters = [],
  searchFields = [],
}: UseTableDataOptions<T>) {
  // Состояния
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters);
  const [globalSearch, setGlobalSearch] = useState('');

  // Сортировка
  const handleSort = useCallback((field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc'
          ? 'desc'
          : prev.field === field && prev.direction === 'desc'
          ? null
          : 'asc',
    }));
  }, []);

  // Добавить фильтр
  const addFilter = useCallback((field: string, value: string | number | boolean | null) => {
    setFilters((prev) => {
      const existing = prev.findIndex((f) => f.field === field);
      if (existing !== -1) {
        if (value === null || value === '') {
          return prev.filter((f) => f.field !== field);
        }
        const newFilters = [...prev];
        newFilters[existing] = { field, value };
        return newFilters;
      }
      if (value !== null && value !== '') {
        return [...prev, { field, value }];
      }
      return prev;
    });
  }, []);

  // Удалить фильтр
  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
  }, []);

  // Сброс всех фильтров и сортировки
  const resetAll = useCallback(() => {
    setSortConfig(initialSort);
    setFilters([]);
    setGlobalSearch('');
  }, [initialSort]);

  // Сброс только фильтров
  const resetFilters = useCallback(() => {
    setFilters([]);
    setGlobalSearch('');
  }, []);

  // Применение фильтров и сортировки к данным
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Глобальный поиск
    if (globalSearch.trim() && searchFields.length > 0) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // 2. Фильтры по полям
    filters.forEach((filter) => {
      result = result.filter((item) => {
        const itemValue = item[filter.field];
        const filterValue = filter.value;
        
        if (itemValue === undefined || itemValue === null) return false;
        
        // Числовое сравнение
        if (typeof filterValue === 'number') {
          return Number(itemValue) === filterValue;
        }
        
        // Строковое сравнение (частичное совпадение)
        if (typeof filterValue === 'string') {
          return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
        }
        
        // Точное сравнение
        return itemValue === filterValue;
      });
    });

    // 3. Сортировка
    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.field];
        let bVal = b[sortConfig.field];

        // Обработка null/undefined
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        // Числа
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Даты
        if (aVal instanceof Date || bVal instanceof Date) {
          const aDate = new Date(aVal).getTime();
          const bDate = new Date(bVal).getTime();
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Строки
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr, 'ru');
        } else {
          return bStr.localeCompare(aStr, 'ru');
        }
      });
    }

    return result;
  }, [data, globalSearch, filters, sortConfig, searchFields]);

  return {
    // Данные
    data: processedData,
    rawData: data,
    
    // Сортировка
    sortConfig,
    handleSort,
    
    // Фильтры
    filters,
    addFilter,
    removeFilter,
    
    // Поиск
    globalSearch,
    setGlobalSearch,
    
    // Сбросы
    resetAll,
    resetFilters,
    
    // Полезные флаги
    hasActiveFilters: filters.length > 0 || globalSearch !== '',
  };
}