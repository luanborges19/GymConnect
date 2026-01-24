/**
 * Controller principal para processamento de webhooks
 * 
 * Gerencia fluxo completo:
 * 1. Recebe webhook
 * 2. Normaliza dados
 * 3. Salva lead
 * 4. Busca histórico
 * 5. Gera resposta com IA
 * 6. Salva conversa
 * 7. Envia resposta
 */

const openaiService = require('../services/openaiService');
const whatsappService = require('../services/whatsappService');
const instagramService = require('../services/instagramService');
const { 
  saveLead, 
  saveConversation, 
  getConversationHistory 
} = require('../config/database');

/**
 * Processa webhook do Instagram (ManyChat)
 */
async function handleInstagramWebhook(req, res) {
  try {
    const payload = req.body;

    // Valida webhook (opcional)
    const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
    if (!instagramService.validateManyChatWebhook(payload, secret)) {
      return res.status(401).json({ error: 'Webhook não autorizado' });
    }

    // Normaliza payload
    const normalized = instagramService.normalizeInstagramPayload(payload);

    // Valida se tem mensagem
    if (!normalized.message || normalized.message.trim() === '') {
      return res.status(400).json({ error: 'Mensagem vazia' });
    }

    console.log(`📱 Instagram - Mensagem recebida de ${normalized.userName || normalized.userId}: ${normalized.message}`);

    // Salva/atualiza lead
    await saveLead(
      normalized.platform,
      normalized.userId,
      normalized.userName,
      normalized.phone
    );

    // Busca histórico de conversas
    const history = await getConversationHistory(normalized.platform, normalized.userId, 5);

    // Gera resposta com IA
    const aiResponse = await openaiService.generateResponse(
      normalized.message,
      history
    );

    const formattedResponse = openaiService.formatResponse(aiResponse.response);

    // Salva conversa no banco
    await saveConversation(
      normalized.platform,
      normalized.userId,
      'user',
      normalized.message,
      formattedResponse,
      aiResponse.transferredToHuman
    );

    console.log(`🤖 Resposta gerada: ${formattedResponse.substring(0, 50)}...`);

    // Formata resposta para ManyChat
    const manyChatResponse = instagramService.formatManyChatResponse(formattedResponse);

    // Retorna resposta formatada para ManyChat
    res.json(manyChatResponse);

  } catch (error) {
    console.error('Erro ao processar webhook Instagram:', error);
    res.status(500).json({ 
      error: 'Erro ao processar mensagem',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Processa webhook do WhatsApp
 */
async function handleWhatsAppWebhook(req, res) {
  try {
    const payload = req.body;

    // Normaliza payload (suporta Z-API, WATI, Twilio)
    const normalized = whatsappService.normalizeWhatsAppPayload(payload);

    // Valida se tem mensagem
    if (!normalized.message || normalized.message.trim() === '') {
      return res.status(400).json({ error: 'Mensagem vazia' });
    }

    console.log(`📱 WhatsApp - Mensagem recebida de ${normalized.userName || normalized.phone}: ${normalized.message}`);

    // Salva/atualiza lead
    await saveLead(
      normalized.platform,
      normalized.userId,
      normalized.userName,
      normalized.phone
    );

    // Busca histórico de conversas
    const history = await getConversationHistory(normalized.platform, normalized.userId, 5);

    // Gera resposta com IA
    const aiResponse = await openaiService.generateResponse(
      normalized.message,
      history
    );

    const formattedResponse = openaiService.formatResponse(aiResponse.response);

    // Salva conversa no banco
    await saveConversation(
      normalized.platform,
      normalized.userId,
      'user',
      normalized.message,
      formattedResponse,
      aiResponse.transferredToHuman
    );

    console.log(`🤖 Resposta gerada: ${formattedResponse.substring(0, 50)}...`);

    // Envia resposta via WhatsApp (apenas se tiver número de telefone)
    if (normalized.phone) {
      try {
        await whatsappService.sendWhatsAppMessage(normalized.phone, formattedResponse);
        console.log(`✅ Mensagem enviada via WhatsApp para ${normalized.phone}`);
      } catch (sendError) {
        console.error('Erro ao enviar mensagem WhatsApp:', sendError);
        // Continua mesmo se falhar o envio (a resposta já foi salva)
      }
    } else {
      console.log('ℹ️  Teste sem número de telefone - resposta não enviada via WhatsApp');
    }

    // Retorna confirmação
    res.json({ 
      success: true, 
      message: 'Mensagem processada e resposta enviada',
      response: formattedResponse
    });

  } catch (error) {
    console.error('Erro ao processar webhook WhatsApp:', error);
    res.status(500).json({ 
      error: 'Erro ao processar mensagem',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Endpoint de teste para verificar configuração
 */
async function testWebhook(req, res) {
  res.json({
    message: 'Webhook funcionando!',
    timestamp: new Date().toISOString(),
    platform: req.params.platform || 'unknown'
  });
}

module.exports = {
  handleInstagramWebhook,
  handleWhatsAppWebhook,
  testWebhook
};
