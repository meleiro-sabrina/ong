'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface UserPermissions {
  [module: string]: Permission;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions?: string; // JSON string
}

interface PermissionsContextType {
  user: UserData | null;
  permissions: UserPermissions;
  loading: boolean;
  canView: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const defaultPermissions: UserPermissions = {
  'Dashboard': { view: true, edit: false, delete: false },
  'Alunos': { view: true, edit: false, delete: false },
  'Turmas': { view: true, edit: false, delete: false },
  'Professores': { view: true, edit: false, delete: false },
  'Voluntários': { view: true, edit: false, delete: false },
  'Presença': { view: true, edit: false, delete: false },
  'Calendário': { view: true, edit: false, delete: false },
  'Documentos': { view: true, edit: false, delete: false },
  'Mensagens': { view: true, edit: false, delete: false },
  'Doações': { view: true, edit: false, delete: false },
  'Estoque': { view: true, edit: false, delete: false },
  'Relatórios': { view: true, edit: false, delete: false },
  'Usuários': { view: false, edit: false, delete: false }, // Só admin vê
};

// Permissões específicas por role
const rolePermissions: Record<string, UserPermissions> = {
  'Professor': {
    'Dashboard': { view: false, edit: false, delete: false },
    'Alunos': { view: false, edit: false, delete: false },
    'Turmas': { view: true, edit: false, delete: false },
    'Professores': { view: false, edit: false, delete: false },
    'Voluntários': { view: false, edit: false, delete: false },
    'Presença': { view: true, edit: true, delete: false },
    'Calendário': { view: false, edit: false, delete: false },
    'Documentos': { view: false, edit: false, delete: false },
    'Mensagens': { view: false, edit: false, delete: false },
    'Doações': { view: false, edit: false, delete: false },
    'Estoque': { view: false, edit: false, delete: false },
    'Relatórios': { view: false, edit: false, delete: false },
    'Usuários': { view: false, edit: false, delete: false },
  },
  'Voluntário': {
    'Dashboard': { view: true, edit: false, delete: false },
    'Alunos': { view: true, edit: true, delete: false },
    'Turmas': { view: true, edit: false, delete: false },
    'Professores': { view: false, edit: false, delete: false },
    'Voluntários': { view: false, edit: false, delete: false },
    'Presença': { view: true, edit: true, delete: false },
    'Calendário': { view: true, edit: true, delete: false },
    'Documentos': { view: true, edit: true, delete: false },
    'Mensagens': { view: true, edit: true, delete: false },
    'Doações': { view: false, edit: false, delete: false },
    'Estoque': { view: true, edit: true, delete: false },
    'Relatórios': { view: false, edit: false, delete: false },
    'Usuários': { view: false, edit: false, delete: false },
  },
};

const PermissionsContext = createContext<PermissionsContextType>({
  user: null,
  permissions: defaultPermissions,
  loading: true,
  canView: () => true,
  canEdit: () => false,
  canDelete: () => false,
  refreshPermissions: async () => {},
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);

  const loadUserAndPermissions = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const userData = data.user as UserData;
        setUser(userData);
        
        // Admin tem todas as permissões
        if (userData.role === 'Administrador') {
          const adminPerms: UserPermissions = {};
          Object.keys(defaultPermissions).forEach(key => {
            adminPerms[key] = { view: true, edit: true, delete: true };
          });
          setPermissions(adminPerms);
          setLoading(false);
          return;
        }
        
        // Parse permissions - se tiver permissões personalizadas no banco, usa elas
        if (userData.permissions) {
          try {
            const parsedPerms = JSON.parse(userData.permissions) as UserPermissions;
            // Merge with defaults
            setPermissions({ ...defaultPermissions, ...parsedPerms });
            setLoading(false);
            return;
          } catch {
            console.error('Erro ao parsear permissões');
          }
        }
        
        // Se não tem permissões personalizadas, aplica permissões baseadas na role
        if (userData.role && rolePermissions[userData.role]) {
          setPermissions(rolePermissions[userData.role]);
        } else {
          // Fallback para permissões padrão
          setPermissions(defaultPermissions);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndPermissions();
  }, []);

  const canView = (module: string): boolean => {
    return permissions[module]?.view ?? false;
  };

  const canEdit = (module: string): boolean => {
    return permissions[module]?.edit ?? false;
  };

  const canDelete = (module: string): boolean => {
    return permissions[module]?.delete ?? false;
  };

  return (
    <PermissionsContext.Provider value={{ 
      user, 
      permissions, 
      loading, 
      canView, 
      canEdit, 
      canDelete,
      refreshPermissions: loadUserAndPermissions 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionsContext);

// Mapeamento de rotas para nomes de módulos
export const routeToModule: Record<string, string> = {
  '/': 'Dashboard',
  '/alunos': 'Alunos',
  '/turmas': 'Turmas',
  '/professores': 'Professores',
  '/voluntarios': 'Voluntários',
  '/presenca': 'Presença',
  '/calendario': 'Calendário',
  '/documentos': 'Documentos',
  '/mensagens': 'Mensagens',
  '/doacoes': 'Doações',
  '/estoque': 'Estoque',
  '/relatorios': 'Relatórios',
  '/usuarios': 'Usuários',
};
