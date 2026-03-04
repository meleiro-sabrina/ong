import { useState, useEffect } from 'react';

interface Student {
  id: string;
  enrollment: string;
  name: string;
  status: string;
  [key: string]: any;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StudentsResponse {
  students: Student[];
  pagination: PaginationData;
}

export function useStudents(page: number = 1, limit: number = 10, status?: string, q?: string) {
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status && status !== 'todos') qs.set('status', status);
      if (q && q.trim() !== '') qs.set('q', q);

      const res = await fetch(`/api/students?${qs.toString()}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Falha ao carregar alunos');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit, status, q]);

  const refetch = () => fetchStudents();

  return { data, loading, error, refetch };
}
