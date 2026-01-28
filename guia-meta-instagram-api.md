# 📘 CONFIGURAR INSTAGRAM COM META API - GUIA COMPLETO

## 🎯 VANTAGENS DA META API
- ✅ **Gratuito** - Sem custos mensais
- ✅ **Controle total** - Seu código, suas regras
- ✅ **Sem intermediários** - Direto com o Instagram
- ✅ **Mais recursos** - Acesso completo à API

## 📋 PRÉ-REQUISITOS

### **1. Conta Instagram Business**
- ✅ Página do Instagram convertida para Business
- ✅ Conectada a uma página do Facebook

### **2. Conta Meta for Developers**
- ✅ Conta no https://developers.facebook.com
- ✅ Verificação de identidade (pode ser necessária)

## 🚀 PASSO A PASSO

### **ETAPA 1: Criar App no Meta for Developers**

1. **Acesse**: https://developers.facebook.com
2. **Clique**: "Meus Apps" → "Criar App"
3. **Escolha**: "Consumidor" ou "Empresa"
4. **Preencha**:
   - Nome do app: "Academia Lucas Rodrigues Bot"
   - Email de contato: seu email
   - Finalidade: "Atendimento ao cliente"

### **ETAPA 2: Adicionar Produtos**

1. **No painel do app**, adicione:
   - **Instagram Basic Display** (para receber mensagens)
   - **Webhooks** (para notificações)

### **ETAPA 3: Configurar Instagram Basic Display**

1. **Vá em**: Instagram Basic Display → Configurações básicas
2. **Adicione URLs**:
   - **Valid OAuth Redirect URIs**: `https://sua-url.com/auth/callback`
   - **Deauthorize Callback URL**: `https://sua-url.com/auth/deauthorize`
   - **Data Deletion Request URL**: `https://sua-url.com/auth/delete`

### **ETAPA 4: Configurar Webhooks**

1. **Vá em**: Webhooks → Configurar
2. **Callback URL**: `https://sua-url.com/webhook/instagram`
3. **Verify Token**: `gymconnect_verify` (mesmo do seu .env)
4. **Campos**: Marque `messages`

### **ETAPA 5: Obter Tokens**

1. **App ID**: Copie do painel principal
2. **App Secret**: Em Configurações → Básico
3. **Access Token**: Será gerado após autorização

## 🔧 CONFIGURAR SEU CÓDIGO

### **1. Atualizar .env**
```env
# META/INSTAGRAM API
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
META_INSTAGRAM_ACCESS_TOKEN=será_gerado
INSTAGRAM_USER_ID=seu_instagram_user_id

# WEBHOOK
VERIFY_TOKEN=gymconnect_verify
```

### **2. Criar Serviço de Envio para Instagram**