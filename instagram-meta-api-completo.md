# 🚀 INSTAGRAM COM META API - GUIA COMPLETO

## ✅ SEU CÓDIGO JÁ ESTÁ PRONTO!

Acabei de atualizar sua aplicação para funcionar diretamente com a Meta API do Instagram:

- ✅ **Webhook configurado** - Recebe mensagens do Instagram
- ✅ **IA integrada** - Responde automaticamente
- ✅ **Envio de mensagens** - Envia respostas via Meta API
- ✅ **Banco de dados** - Salva todas as conversas
- ✅ **Validação de segurança** - Verifica assinatura do Meta

## 🎯 AGORA VOCÊ PRECISA FAZER:

### **ETAPA 1: Criar App no Meta for Developers**

1. **Acesse**: https://developers.facebook.com
2. **Faça login** com sua conta Facebook/Meta
3. **Clique**: "Meus Apps" → "Criar App"
4. **Escolha**: "Empresa" (para uso comercial)
5. **Preencha**:
   - **Nome do app**: "Academia Lucas Rodrigues Bot"
   - **Email**: seu email
   - **Finalidade**: "Atendimento ao cliente"

### **ETAPA 2: Configurar Instagram Basic Display**

1. **No painel do app**, clique em "Adicionar produto"
2. **Encontre**: "Instagram Basic Display" → "Configurar"
3. **Em "Configurações básicas"**:
   - **Valid OAuth Redirect URIs**: `https://sua-url.com/auth/callback`
   - **Deauthorize Callback URL**: `https://sua-url.com/auth/deauthorize`
   - **Data Deletion Request URL**: `https://sua-url.com/auth/delete`

### **ETAPA 3: Obter Credenciais**

1. **No painel principal do app**:
   - **App ID**: Copie este número
   - **App Secret**: Vá em "Configurações" → "Básico" → "Mostrar"

2. **Cole no seu arquivo `src/.env`**:
```env
META_APP_ID=SEU_APP_ID_AQUI
META_APP_SECRET=SEU_APP_SECRET_AQUI
```

### **ETAPA 4: Configurar Webhooks**

1. **No painel do app**, vá em "Webhooks"
2. **Clique**: "Configurar Webhooks"
3. **Configure**:
   - **Callback URL**: `https://sua-url.com/webhook/instagram`
   - **Verify Token**: `GymConnect_WhatsApp_2024_SKZ7mPqR9jLn2xVwKyU5Dt8BF`
   - **Campos**: Marque `messages`

### **ETAPA 5: Conectar sua Página Instagram**

1. **Vá em**: Instagram Basic Display → "Roles"
2. **Adicione**: Sua conta Instagram como "Instagram Tester"
3. **Autorize**: O app a acessar sua página
4. **Copie**: O Page ID gerado
5. **Cole no .env**:
```env
META_INSTAGRAM_PAGE_ID=SEU_PAGE_ID_AQUI
```

### **ETAPA 6: Gerar Access Token**

1. **Use a Graph API Explorer**: https://developers.facebook.com/tools/explorer/
2. **Selecione**: Seu app
3. **Gere**: Um token com permissões `instagram_basic`, `pages_messaging`
4. **Cole no .env**:
```env
META_INSTAGRAM_ACCESS_TOKEN=SEU_TOKEN_AQUI
```

## 🧪 TESTAR SUA CONFIGURAÇÃO

### **1. Verificar Configurações**
```bash
node test-instagram-meta.js config
```

### **2. Testar Webhook**
```bash
node test-instagram-meta.js verify
```

### **3. Simular Mensagem**
```bash
node test-instagram-meta.js
```

### **4. Ver Conversas**
```bash
node test-instagram-meta.js conversations
```

## 🌐 EXPOR SEU SERVIDOR

### **OPÇÃO A: Ngrok (Para testes)**
```bash
# Instalar
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Usar URL gerada: https://abc123.ngrok.io
```

### **OPÇÃO B: Render.com (Para produção)**
1. **Acesse**: https://render.com
2. **Conecte**: Seu repositório GitHub
3. **Configure**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Copie do seu .env
4. **Deploy**: Automático
5. **URL**: `https://seu-app.render.com`

## 📋 CHECKLIST FINAL

### ✅ **Configurações no Meta**
- [ ] App criado no Meta for Developers
- [ ] Instagram Basic Display configurado
- [ ] Webhooks configurados
- [ ] Página Instagram conectada
- [ ] Tokens gerados

### ✅ **Configurações no Código**
- [ ] META_APP_ID no .env
- [ ] META_APP_SECRET no .env
- [ ] META_INSTAGRAM_PAGE_ID no .env
- [ ] META_INSTAGRAM_ACCESS_TOKEN no .env

### ✅ **Servidor**
- [ ] Servidor exposto na internet (ngrok/render)
- [ ] Webhook URL configurada no Meta
- [ ] Testes passando

## 🎉 COMO VAI FUNCIONAR

1. **Cliente envia mensagem** no Instagram da academia
2. **Meta envia webhook** para sua URL
3. **Sua IA processa** e gera resposta
4. **Resposta é enviada** automaticamente via Meta API
5. **Cliente recebe** resposta instantânea

## 🔧 TROUBLESHOOTING

### **Erro: "Invalid App ID"**
- Verifique se META_APP_ID está correto no .env

### **Erro: "Invalid Access Token"**
- Gere novo token na Graph API Explorer
- Verifique permissões: instagram_basic, pages_messaging

### **Webhook não recebe mensagens**
- Confirme URL pública acessível
- Teste: `curl https://sua-url.com/webhook/instagram`
- Verifique logs do servidor

### **Mensagens não são enviadas**
- Verifique META_INSTAGRAM_ACCESS_TOKEN
- Confirme META_INSTAGRAM_PAGE_ID
- Teste permissões do token

## 📞 PRÓXIMOS PASSOS

1. **Criar app no Meta** (15 minutos)
2. **Configurar .env** (5 minutos)  
3. **Expor servidor** (10 minutos)
4. **Testar tudo** (5 minutos)

**Total: ~35 minutos para ter Instagram funcionando!**

Quer que eu te ajude com alguma etapa específica?