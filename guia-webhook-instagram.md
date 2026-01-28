# 📱 GUIA: Configurar Webhook do Instagram

## 🎯 OPÇÕES DISPONÍVEIS

Sua aplicação suporta **2 formas** de receber mensagens do Instagram:

### 1. 🤖 **ManyChat** (Recomendado - Mais Fácil)
- Plataforma de chatbot que conecta com Instagram
- Configuração mais simples
- Não precisa de aprovação do Meta

### 2. 📘 **Meta/Facebook API** (Mais Complexo)
- Integração direta com Instagram via Meta
- Requer aprovação e verificação
- Mais controle, mas mais burocrático

---

## 🤖 OPÇÃO 1: MANYCHAT (RECOMENDADO)

### **Passo 1: Criar Conta no ManyChat**
1. Acesse: https://manychat.com
2. Crie uma conta gratuita
3. Conecte sua página do Instagram Business

### **Passo 2: Configurar Webhook no ManyChat**
1. No ManyChat, vá em **Settings** → **API**
2. Em **Webhook**, configure:
   - **URL**: `https://seu-dominio.com/webhook/instagram`
   - **Method**: POST
   - **Events**: Message Received

### **Passo 3: Testar Webhook**
1. Envie uma mensagem para sua página no Instagram
2. Verifique se chegou no seu servidor
3. Use: `node check-responses.js` para ver no banco

---

## 📘 OPÇÃO 2: META/FACEBOOK API

### **Pré-requisitos**
- Página do Instagram Business
- Conta Meta for Developers
- App Facebook aprovado

### **Passo 1: Criar App no Meta for Developers**
1. Acesse: https://developers.facebook.com
2. Crie um novo app
3. Adicione produto **Instagram Basic Display**

### **Passo 2: Configurar Webhook**
1. No painel do app, vá em **Instagram Basic Display**
2. Em **Webhooks**, configure:
   - **Callback URL**: `https://seu-dominio.com/webhook/instagram`
   - **Verify Token**: `gymconnect_verify` (mesmo do seu .env)
   - **Fields**: `messages`

### **Passo 3: Verificar Webhook**
O Meta vai fazer uma requisição GET para verificar:
```
GET https://seu-dominio.com/webhook/instagram?hub.mode=subscribe&hub.verify_token=gymconnect_verify&hub.challenge=CHALLENGE_STRING
```

Sua aplicação já está preparada para responder corretamente!

---

## 🚀 CONFIGURAÇÃO NO SEU SERVIDOR

### **1. Verificar se está rodando**
```bash
# Verificar se servidor está ativo
curl http://localhost:3000/health

# Testar endpoint Instagram
curl http://localhost:3000/webhook/test/instagram
```

### **2. Expor servidor para internet**
Você precisa de uma URL pública. Opções:

#### **A) Ngrok (Para testes)**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Usar a URL gerada: https://abc123.ngrok.io
```

#### **B) Render/Heroku (Para produção)**
- Deploy no Render.com ou Heroku
- URL automática: `https://seu-app.render.com`

### **3. URL do Webhook**
Sua URL final será:
```
https://seu-dominio.com/webhook/instagram
```

---

## 🧪 TESTAR CONFIGURAÇÃO

### **1. Teste Manual**
```bash
# Simular webhook do Instagram
curl -X POST https://seu-dominio.com/webhook/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": {
      "id": "123456789",
      "first_name": "João"
    },
    "message": {
      "text": "Olá, quero saber sobre a academia"
    }
  }'
```

### **2. Verificar Resposta**
```bash
# Ver conversas no banco
node check-responses.js
```

---

## ⚙️ CONFIGURAÇÕES ADICIONAIS

### **Arquivo .env**
Adicione se necessário:
```env
# INSTAGRAM/MANYCHAT
MANYCHAT_WEBHOOK_SECRET=seu_secret_opcional

# META/FACEBOOK (se usar API direta)
META_INSTAGRAM_ACCESS_TOKEN=seu_token
META_INSTAGRAM_APP_SECRET=seu_app_secret
```

### **Verificar Configuração**
```bash
# Ver status de todas as configurações
curl http://localhost:3000/debug
```

---

## 🔍 TROUBLESHOOTING

### **Webhook não recebe mensagens**
1. ✅ Verificar se URL está acessível publicamente
2. ✅ Confirmar que retorna 200 OK
3. ✅ Verificar logs do servidor
4. ✅ Testar com curl manual

### **Erro 403 na verificação**
- Verificar se `VERIFY_TOKEN` no .env está correto
- Confirmar que é exatamente `gymconnect_verify`

### **Mensagens não aparecem no banco**
- Verificar logs do servidor: `node server.js`
- Testar IA: `node test-ai.js`
- Ver banco: `node check-responses.js`

---

## 🎉 PRÓXIMOS PASSOS

1. **Escolher**: ManyChat ou Meta API
2. **Expor**: Servidor para internet (ngrok/render)
3. **Configurar**: Webhook na plataforma escolhida
4. **Testar**: Enviar mensagem no Instagram
5. **Verificar**: Resposta da IA no banco

**Qual opção você prefere? ManyChat (mais fácil) ou Meta API (mais controle)?**