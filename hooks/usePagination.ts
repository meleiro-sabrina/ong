'use client';

import { useMemo, useState } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  paginatedItems: T[];
  totalPages: number;
  startItem: number;
  endItem: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export function usePagination<T>({ items, itemsPerPage = 10 }: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, safeCurrentPage, itemsPerPage]);

  const startItem = (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  const hasNextPage = safeCurrentPage < safeTotalPages;
  const hasPrevPage = safeCurrentPage > 1;

  const setSafeCurrentPage = (page: number) => {
    const next = Math.min(Math.max(page, 1), safeTotalPages);
    setCurrentPage(next);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setSafeCurrentPage(safeCurrentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setSafeCurrentPage(safeCurrentPage - 1);
    }
  };

  return {
    currentPage: safeCurrentPage,
    setCurrentPage: setSafeCurrentPage,
    paginatedItems,
    totalPages: safeTotalPages,
    startItem,
    endItem,
    totalItems,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
  };
}
