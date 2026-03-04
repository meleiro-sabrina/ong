# MobileSelect Component

## Descrição
O componente `MobileSelect` foi criado para resolver problemas de usabilidade em dispositivos móveis com selects que contém muitas opções. Ele substitui o select nativo por uma solução customizada que funciona melhor em telas pequenas.

## Problemas Resolvidos
- ✅ Dropdowns que apareciam fora da tela em dispositivos móveis
- ✅ Listas longas que eram difíceis de navegar
- ✅ Dificuldade em selecionar opções com textos longos
- ✅ Falta de funcionalidade de busca em listas extensas

## Características
- **Modal em Mobile**: Em dispositivos móveis, abre um modal em tela cheia para melhor usabilidade
- **Desktop Normal**: Em desktop, comporta-se como um dropdown normal
- **Busca Integrada**: Permite filtrar as opções enquanto digita
- **Títulos Longos**: Suporta textos longos com truncamento e tooltips
- **Acessibilidade**: Totalmente acessível e navegável por teclado

## Como Usar

```tsx
import { MobileSelect } from '@/components/MobileSelect';

const options = [
  { value: '1', label: 'TUR-2026-0001 - Reforço Escolar - Matemática' },
  { value: '2', label: 'TUR-2026-0002 - Teatro' },
  // ... mais opções
];

<MobileSelect
  value={selectedValue}
  onChange={setSelectedValue}
  options={options}
  placeholder="Selecione uma opção..."
  className="w-full"
  disabled={false}
/>
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `value` | `string` | Valor selecionado |
| `onChange` | `(value: string) => void` | Função chamada ao selecionar |
| `options` | `Array<{value: string, label: string, title?: string}>` | Lista de opções |
| `placeholder` | `string` | Texto quando nada está selecionado |
| `className` | `string` | Classes CSS adicionais |
| `disabled` | `boolean` | Se o select está desabilitado |

## Onde Aplicar
Substitua selects tradicionais que:
- Tenham mais de 10 opções
- Possuem textos longos nas opções
- Estejam causando problemas em dispositivos móveis

## Módulos Atualizados
- ✅ `/presenca` - Select de turmas
- Próximos: Aplicar em outros módulos com selects longos
