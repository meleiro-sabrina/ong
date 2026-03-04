# Guia de Implementação de Alerts/Toasts

## Como Usar o Sistema de Toasts

O sistema de toasts foi completamente redesenhado para combinar com a identidade visual da ONG e fornecer feedback claro e bonito para todas as ações do usuário.

### Importação

```tsx
import { useToast } from '@/components/ToastProvider';

function MeuComponente() {
  const toast = useToast();
  // ...
}
```

### Métodos Disponíveis

#### 1. **Métodos Genéricos**
```tsx
toast.success('Título', 'Descrição opcional');
toast.error('Título', 'Descrição opcional');
toast.info('Título', 'Descrição opcional');
toast.warning('Título', 'Descrição opcional');
```

#### 2. **Métodos Específicos (Recomendado)**
```tsx
toast.created('Aluno');           // "Aluno criado com sucesso!"
toast.updated('Turma');           // "Turma atualizada com sucesso!"
toast.saved('Presença');          // "Presença salva com sucesso!"
toast.deleted('Usuário');         // "Usuário excluído com sucesso!"
toast.attendance('saved', 25);    // "Presença salva com sucesso!" + "Registro de 25 alunos processados."
toast.attendance('updated', 25);  // "Presença atualizada com sucesso!"
```

### Exemplos de Implementação

#### **Módulo de Alunos**
```tsx
// Criar aluno
const handleCreateStudent = async () => {
  try {
    await fetch('/api/students', { /* ... */ });
    toast.created('Aluno');
  } catch (error) {
    toast.error('Erro ao criar aluno', error.message);
  }
};

// Editar aluno
const handleUpdateStudent = async () => {
  try {
    await fetch('/api/students/' + id, { /* ... */ });
    toast.updated('Aluno');
  } catch (error) {
    toast.error('Erro ao atualizar aluno', error.message);
  }
};

// Excluir aluno
const handleDeleteStudent = async () => {
  try {
    await fetch('/api/students/' + id, { method: 'DELETE' });
    toast.deleted('Aluno');
  } catch (error) {
    toast.error('Erro ao excluir aluno', error.message);
  }
};
```

#### **Módulo de Turmas**
```tsx
// Criar turma
const handleCreateClass = async () => {
  try {
    await fetch('/api/classes', { /* ... */ });
    toast.created('Turma');
  } catch (error) {
    toast.error('Erro ao criar turma', 'Verifique os dados e tente novamente.');
  }
};

// Adicionar aluno à turma
const handleAddStudent = async () => {
  try {
    await fetch('/api/classes/' + classId + '/students', { /* ... */ });
    toast.success('Aluno adicionado', 'O aluno foi matriculado na turma com sucesso.');
  } catch (error) {
    toast.error('Erro ao matricular aluno', error.message);
  }
};
```

#### **Módulo de Usuários**
```tsx
// Criar usuário
const handleCreateUser = async () => {
  try {
    await fetch('/api/users', { /* ... */ });
    toast.created('Usuário');
  } catch (error) {
    toast.error('Erro ao criar usuário', 'Verifique se o email já está em uso.');
  }
};

// Resetar senha
const handleResetPassword = async () => {
  try {
    await fetch('/api/users/' + id + '/reset-password', { /* ... */ });
    toast.info('Senha resetada', 'Um email foi enviado com as instruções.');
  } catch (error) {
    toast.error('Erro ao resetar senha', error.message);
  }
};
```

#### **Módulo de Doações**
```tsx
// Registrar doação
const handleCreateDonation = async () => {
  try {
    await fetch('/api/donations', { /* ... */ });
    toast.created('Doação');
  } catch (error) {
    toast.error('Erro ao registrar doação', error.message);
  }
};

// Confirmar doação
const handleConfirmDonation = async () => {
  try {
    await fetch('/api/donations/' + id + '/confirm', { /* ... */ });
    toast.success('Doação confirmada', 'Obrigado pela generosidade!');
  } catch (error) {
    toast.error('Erro ao confirmar doação', error.message);
  }
};
```

### Design e Comportamento

#### **Cores e Gradientes**
- ✅ **Sucesso**: Gradiente verde (`from-green-50 to-emerald-50`)
- ❌ **Erro**: Gradiente vermelho (`from-red-50 to-rose-50`)
- ⚠️ **Alerta**: Gradiente âmbar (`from-amber-50 to-yellow-50`)
- ℹ️ **Info**: Gradiente azul (`from-blue-50 to-indigo-50`)

#### **Animações**
- Entrada: `fade-in slide-in-from-top-2`
- Hover: `hover:scale-[1.02]` (efeito sutil)
- Duração padrão: 4 segundos

#### **Posicionamento**
- Canto superior direito
- Z-index: 70 (acima de modais)
- Máximo 4 toasts simultâneos
- Responsivo: `max-w-[calc(100vw-2rem)]`

### Boas Práticas

1. **Seja específico**: Use os métodos específicos (`created`, `updated`, etc.)
2. **Mencione a entidade**: Sempre inclua o nome da entidade ("Aluno", "Turma", etc.)
3. **Forneça contexto**: Adicione descrições úteis quando necessário
4. **Erros descritivos**: Sempre explique o que deu errado e como resolver
5. **Não abuse**: Use apenas para ações importantes do usuário

### Migração de `alert()` para Toast

**Antes:**
```tsx
alert('Presenças salvas com sucesso!');
alert('Erro ao salvar: ' + error.message);
```

**Depois:**
```tsx
toast.attendance('saved', students.length);
toast.error('Erro ao salvar presenças', error.message);
```

O sistema está pronto para uso em todos os módulos! 🎉
