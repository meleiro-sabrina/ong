# 🔐 **CONFIGURAÇÃO GITHUB - PUSH DO PROJETO**

## ❌ **PROBLEMA DE AUTENTICAÇÃO:**

O GitHub não aceita mais autenticação por senha. É necessário usar um **Personal Access Token (PAT)**.

---

## ✅ **SOLUÇÃO - PASSO A PASSO:**

### **📋 1. Gerar Personal Access Token:**

1. **Acesse:** https://github.com/settings/tokens
2. **Clique:** "Generate new token" → "Generate new token (classic)"
3. **Configure:**
   - **Note:** "ONG Project Token"
   - **Expiration:** "90 days" (ou sua preferência)
   - **Scopes:** Marque as opções:
     - ✅ `repo` (Controle total de repositórios)
     - ✅ `workflow` (Controle de workflows)

4. **Clique:** "Generate token"
5. **⚠️ IMPORTANTE:** Copie o token imediatamente (ele não será exibido novamente)

---

### **📋 2. Configurar Git Local:**

#### **Opção A: Usar o Token Diretamente:**
```bash
# Remover remote atual
git remote remove origin

# Adicionar com token (substitua SEU_TOKEN)
git remote add origin https://SEU_TOKEN@github.com/meleiro-sabrina/ong.git

# Fazer push
git push -u origin main
```

#### **Opção B: Usar Git Credential Manager:**
```bash
# Configurar credential helper
git config --global credential.helper store

# Tentar push (será solicitado usuário e token)
git push -u origin main
```

---

### **📋 3. Exemplo Prático:**

```bash
# Substitua "ghp_xxxxxxxxxxxxxxxxxxxx" pelo seu token real
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/meleiro-sabrina/ong.git

# Fazer push
git push -u origin main
```

---

## ✅ **VERIFICAÇÃO:**

### **📋 Após Push Concluído:**
```bash
# Verificar status
git status

# Verificar remote
git remote -v

# Verificar log
git log --oneline
```

---

## 🎯 **RESULTADO ESPERADO:**

### **✅ Push Concluído com Sucesso:**
```
Enumerating objects: 119, done.
Counting objects: 100% (119/119), done.
Delta compression using up to 8 threads
Compressing objects: 100% (119/119), done.
Writing objects: 100% (119/119), 43.276 KiB | 2.5 MiB/s, done.
Total 119 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/meleiro-sabrina/ong.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🚨 **SEGURANÇA:**

### **📋 Importante:**
- ✅ **Nunca compartilhe** seu token
- ✅ **Guarde em local seguro**
- ✅ **Revogue** tokens não utilizados
- ✅ **Use tokens** com prazo de expiração

---

## 🔄 **ALTERNATIVAS:**

### **📋 SSH Key (Recomendado):**
```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "meleiro-sabrina@example.com"

# Adicionar ao GitHub
# Copie a chave pública e adicione em:
# https://github.com/settings/keys

# Usar remote SSH
git remote set-url origin git@github.com:meleiro-sabrina/ong.git

# Push com SSH
git push -u origin main
```

---

## 🎯 **CONCLUSÃO:**

**Configure seu Personal Access Token e faça o push do projeto!**

- ✅ **Token gerado** com permissões adequadas
- ✅ **Git configurado** para usar o token
- ✅ **Push realizado** com sucesso
- ✅ **Projeto disponível** no GitHub

**Seu projeto ONG estará disponível em:** https://github.com/meleiro-sabrina/ong 🎯
