# 🚀 CONFIGURAR WEBHOOK INSTAGRAM - PASSO A PASSO

## ✅ STATUS ATUAL
- **Webhook Instagram**: ✅ Funcionando perfeitamente
- **Verificação**: ✅ Responde corretamente ao Meta/ManyChat
- **IA**: ✅ Gerando respostas específicas para Instagram
- **Banco**: ✅ Salvando conversas do Instagram

## 🎯 PRÓXIMOS PASSOS

### **1. EXPOR SEU SERVIDOR PARA INTERNET**

Atualmente seu servidor roda apenas local (localhost:3000). Para o Instagram enviar webhooks, precisa estar acessível na internet.

#### **OPÇÃO A: Ngrok (Para testes rápidos)**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000
```
Vai gerar uma URL tipo: `https://abc123.ngrok.io`

#### **OPÇÃO B: Render.com (Para produção)**
1. Acesse: https://render.com
2. Conecte seu GitHub
3. Deploy automático
4. URL: `https://seu-app.render.com`

### **2. ESCOLHER PLATAFORMA**

#### **🤖 MANYCHAT (Mais Fácil - Recomendado)**

**Vantagens:**
- ✅ Configuração em 5 minutos
- ✅ Não precisa aprovação do Meta
- ✅ Interface visual para criar fluxos
- ✅ Funciona imediatamente

**Como configurar:**
1. Acesse: https://manychat.com
2. Crie conta e conecte Instagram Business
3. Vá em **Settings** → **API** → **Webhook**
4. Configure:
   - **URL**: `https://sua-url.com/webhook/instagram`
   - **Method**: POST
   - **Events**: Message Received

#### **📘 META API (Mais Controle)**

**Vantagens:**
- ✅ Controle total
- ✅ Sem intermediários
- ✅ Mais recursos avançados

**Desvantagens:**
- ❌ Precisa aprovação do Meta
- ❌ Mais burocrático
- ❌ Configuração complexa

### **3. CONFIGURAR NO MANYCHAT (RECOMENDADO)**

#### **Passo 1: Criar Conta**
1. Vá em https://manychat.com
2. Clique em "Get Started Free"
3. Conecte sua página do Instagram Business

#### **Passo 2: Configurar Webhook**
1. No painel do ManyChat:
   - **Settings** → **API**
   - **Webhook URL**: `https://sua-url.com/webhook/instagram`
   - **Method**: POST
   - Marque: "Message Received"

#### **Passo 3: Configurar Fluxo**
1. Vá em **Flows** → **New Flow**
2. Trigger: "User sends a message"
3. Action: "Send HTTP Request"
4. Configure:
   - **URL**: `https://sua-url.com/webhook/instagram`
   - **Method**: POST
   - **Body**: Dados da mensagem

### **4. TESTAR CONFIGURAÇÃO**

#### **Teste 1: Verificar URL**
```bash
# Testar se sua URL está acessível
curl https://sua-url.com/health
```

#### **Teste 2: Simular Webhook**
```bash
# Testar webhook manualmente
curl -X POST https://sua-url.com/webhook/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": {
      "id": "test123",
      "first_name": "Teste"
    },
    "message": {
      "text": "Olá"
    }
  }'
```

#### **Teste 3: Mensagem Real**
1. Envie mensagem para sua página no Instagram
2. Verifique se chegou: `node test-instagram.js responses`

### **5. MONITORAR FUNCIONAMENTO**

#### **Ver Conversas do Instagram**
```bash
node test-instagram.js responses
```

#### **Ver Logs do Servidor**
```bash
# Se usando Render, ver logs no painel
# Se local, ver no terminal onde rodou npm start
```

#### **Testar IA**
```bash
node test-instagram.js
```

## 🔧 CONFIGURAÇÕES ADICIONAIS

### **Arquivo .env (Opcional)**
```env
# MANYCHAT (opcional)
MANYCHAT_WEBHOOK_SECRET=seu_secret

# INSTAGRAM ESPECÍFICO
INSTAGRAM_PAGE_ID=sua_pagina_id
```

### **Personalizar Respostas**
Edite `src/services/openaiService.js` para ajustar:
- Tom das respostas
- Informações da academia
- Call-to-actions específicos

## 🎉 RESULTADO ESPERADO

Quando configurado, vai funcionar assim:

1. **Cliente envia mensagem no Instagram**
2. **ManyChat/Meta envia webhook para sua URL**
3. **Sua IA processa e gera resposta**
4. **Resposta é enviada de volta**
5. **Cliente recebe resposta automática**

## 📞 PRÓXIMA AÇÃO

**Qual você prefere?**

1. **🤖 ManyChat** - Mais rápido, funciona em 10 minutos
2. **📘 Meta API** - Mais controle, mas demora mais

**E para expor o servidor?**

1. **⚡ Ngrok** - Para testar agora mesmo
2. **🚀 Render** - Para usar em produção

Me fala qual você escolhe e eu te ajudo a configurar!