# 🎯 CONFIGURAÇÃO FINAL - INSTAGRAM META API

## ✅ TOKEN ATUALIZADO

Seu verify token está configurado corretamente:
```
GymConnect_WhatsApp_2024_SKZ7mPqR9jLn2xVwKyU5Dt8BF
```

## 🚀 PRÓXIMOS PASSOS

### **1. CRIAR APP NO META FOR DEVELOPERS**

1. **Acesse**: https://developers.facebook.com
2. **Login** com sua conta Facebook/Meta
3. **Criar App**:
   - Clique "Meus Apps" → "Criar App"
   - Escolha: "Empresa"
   - Nome: "Academia Lucas Rodrigues Bot"
   - Email: seu email

### **2. CONFIGURAR INSTAGRAM BASIC DISPLAY**

1. **Adicionar Produto**: "Instagram Basic Display"
2. **Configurações Básicas**:
   - Valid OAuth Redirect URIs: `https://sua-url.com/auth/callback`
   - Deauthorize Callback URL: `https://sua-url.com/auth/deauthorize`
   - Data Deletion Request URL: `https://sua-url.com/auth/delete`

### **3. CONFIGURAR WEBHOOKS**

**IMPORTANTE**: Use exatamente este token:

1. **Webhooks** → "Configurar Webhooks"
2. **Callback URL**: `https://sua-url.com/webhook/instagram`
3. **Verify Token**: `GymConnect_WhatsApp_2024_SKZ7mPqR9jLn2xVwKyU5Dt8BF`
4. **Subscription Fields**: Marque `messages`

### **4. OBTER CREDENCIAIS**

Após criar o app, copie para o `src/.env`:

```env
# META/INSTAGRAM API
META_APP_ID=COLE_SEU_APP_ID_AQUI
META_APP_SECRET=COLE_SEU_APP_SECRET_AQUI
META_INSTAGRAM_ACCESS_TOKEN=SERA_GERADO_APOS_AUTORIZACAO
META_INSTAGRAM_PAGE_ID=COLE_SEU_PAGE_ID_AQUI
```

### **5. EXPOR SERVIDOR**

**Opção A - Ngrok (teste rápido):**
```bash
npm install -g ngrok
ngrok http 3000
```
Use a URL gerada: `https://abc123.ngrok.io`

**Opção B - Render (produção):**
- Deploy no Render.com
- URL: `https://seu-app.render.com`

## 🧪 TESTAR CONFIGURAÇÃO

### **Verificar Token (já funciona):**
```bash
node test-instagram-meta.js verify
```
✅ **Status**: Funcionando com seu token!

### **Verificar Configurações:**
```bash
node test-instagram-meta.js config
```

### **Simular Mensagens:**
```bash
node test-instagram-meta.js
```

## 📋 CHECKLIST

### ✅ **Já Configurado**
- [x] Verify token correto no .env
- [x] Webhook Instagram funcionando
- [x] IA processando mensagens
- [x] Banco de dados salvando conversas

### 🔧 **Falta Configurar**
- [ ] App no Meta for Developers
- [ ] META_APP_ID no .env
- [ ] META_APP_SECRET no .env
- [ ] META_INSTAGRAM_PAGE_ID no .env
- [ ] META_INSTAGRAM_ACCESS_TOKEN no .env
- [ ] Servidor exposto na internet

## 🎯 IMPORTANTE

**Quando configurar o webhook no Meta, use EXATAMENTE:**
```
Verify Token: GymConnect_WhatsApp_2024_SKZ7mPqR9jLn2xVwKyU5Dt8BF
```

**Não pode ter espaços, deve ser exatamente igual ao seu .env!**

## 🚀 PRÓXIMA AÇÃO

**O que você quer fazer agora?**

1. **🏗️ Criar app no Meta** - Te guio passo a passo
2. **🌐 Expor servidor** - Ngrok para testar
3. **📋 Ver status atual** - `node test-instagram-meta.js config`

Me fala qual você prefere!