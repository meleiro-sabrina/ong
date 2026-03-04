import { useState, useCallback } from 'react';

type LoadingState = {
  [key: string]: boolean;
};

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const executeWithLoading = useCallback(async <T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T | undefined> => {
    if (loadingStates[key]) {
      return undefined; // Já está executando, ignora
    }

    setLoading(key, true);
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(key, false);
    }
  }, [loadingStates, setLoading]);

  return {
    setLoading,
    isLoading,
    executeWithLoading
  };
}

// Hook específico para ações de salvamento
export function useSaveLoading() {
  const { isLoading, executeWithLoading } = useLoadingStates();

  const executeSave = useCallback(async <T>(
    id: string | null,
    saveFn: () => Promise<T>
  ): Promise<T | undefined> => {
    const key = id ? `save-${id}` : 'save-new';
    return executeWithLoading(key, saveFn);
  }, [executeWithLoading]);

  const isSaving = useCallback((id: string | null) => {
    const key = id ? `save-${id}` : 'save-new';
    return isLoading(key);
  }, [isLoading]);

  return {
    executeSave,
    isSaving
  };
}

// Hook específico para ações de exclusão
export function useDeleteLoading() {
  const { isLoading, executeWithLoading } = useLoadingStates();

  const executeDelete = useCallback(async <T>(
    id: string,
    deleteFn: () => Promise<T>
  ): Promise<T | undefined> => {
    const key = `delete-${id}`;
    return executeWithLoading(key, deleteFn);
  }, [executeWithLoading]);

  const isDeleting = useCallback((id: string) => {
    return isLoading(`delete-${id}`);
  }, [isLoading]);

  return {
    executeDelete,
    isDeleting
  };
}

// Hook específico para confirmações
export function useConfirmationLoading() {
  const { isLoading, executeWithLoading } = useLoadingStates();

  const executeConfirmation = useCallback(async <T>(
    key: string,
    confirmFn: () => Promise<T>
  ): Promise<T | undefined> => {
    return executeWithLoading(`confirm-${key}`, confirmFn);
  }, [executeWithLoading]);

  const isConfirming = useCallback((key: string) => {
    return isLoading(`confirm-${key}`);
  }, [isLoading]);

  return {
    executeConfirmation,
    isConfirming
  };
}
