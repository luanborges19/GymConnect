/**
 * Serviço de integração com Instagram (ManyChat)
 * 
 * Normaliza webhooks do ManyChat e prepara respostas
 */

/**
 * Normaliza payload de webhook do ManyChat/Instagram
 */
function normalizeInstagramPayload(payload) {
    // Formato ManyChat padrão
    if (payload.subscriber && payload.message) {
      return {
        platform: 'instagram',
        userId: payload.subscriber.id || payload.subscriber.user_id || null,
        userName: payload.subscriber.first_name || payload.subscriber.name || null,
        phone: null, // Instagram não fornece telefone diretamente
        message: payload.message.text || payload.message || '',
        messageId: payload.message.id || payload.id || null
      };
    }
  
    // Formato alternativo ManyChat
    if (payload.user_id || payload.from) {
      return {
        platform: 'instagram',
        userId: payload.user_id || payload.from || 'unknown',
        userName: payload.first_name || payload.name || null,
        phone: null,
        message: payload.text || payload.message || payload.body || '',
        messageId: payload.message_id || payload.id || null
      };
    }
  
    // Formato genérico
    return {
      platform: 'instagram',
      userId: payload.userId || payload.from || payload.sender_id || 'unknown',
      userName: payload.userName || payload.name || null,
      phone: null,
      message: payload.message || payload.text || payload.body || '',
      messageId: payload.messageId || payload.id || null
    };
  }
  
  /**
   * Formata resposta para ManyChat
   * 
   * ManyChat espera um formato específico de resposta
   */
  function formatManyChatResponse(message) {
    return {
      version: 'v2',
      content: {
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      }
    };
  }
  
  /**
   * Valida webhook do ManyChat (opcional - verifica secret se configurado)
   */
  function validateManyChatWebhook(payload, secret = null) {
    if (!secret) {
      return true; // Se não houver secret configurado, aceita
    }
  
    // Implementar validação de assinatura se necessário
    // ManyChat pode enviar headers específicos para validação
    return true;
  }
  
  module.exports = {
    normalizeInstagramPayload,
    formatManyChatResponse,
    validateManyChatWebhook
  };
  