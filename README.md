# GymConnect

Chatbot com IA para academia - Integração com WhatsApp e Instagram

## Configuração do Webhook no Facebook Developers

### Passos para configurar:

1. **Acesse o Facebook Developers**: https://developers.facebook.com/

2. **Configure o Webhook**:
   - URL do Callback: `https://seu-dominio.com/webhook/instagram` (ou `/webhook/whatsapp`)
   - Token de Verificação: `gymconnect_verify`
   - Campos de Assinatura: `messages`, `messaging_postbacks`

3. **Importante**:
   - O servidor precisa estar **publicamente acessível** (não pode ser localhost)
   - Use um serviço como ngrok, Railway, Heroku, ou VPS para expor o servidor
   - O endpoint de verificação é `GET /webhook/instagram` ou `GET /webhook/whatsapp`

### Troubleshooting

Se receber erro "Não foi possível validar a URL de callback ou o token de verificação":

1. ✅ Verifique se o servidor está rodando e acessível publicamente
2. ✅ Confirme que o token está correto: `gymconnect_verify`
3. ✅ Verifique os logs do servidor para ver os parâmetros recebidos
4. ✅ Certifique-se de que a URL está acessível via HTTPS (Facebook requer HTTPS)
5. ✅ Verifique se o endpoint está respondendo corretamente (deve retornar o challenge como string)

### Testando localmente com ngrok:

```bash
# Terminal 1: Inicie o servidor
npm start

# Terminal 2: Exponha o servidor com ngrok
ngrok http 3000

# Use a URL do ngrok no Facebook Developers
# Exemplo: https://abc123.ngrok.io/webhook/instagram
```
