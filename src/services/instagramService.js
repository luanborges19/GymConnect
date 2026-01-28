/**
 * Serviço de integração com Instagram via Meta API
 * 
 * Gerencia webhooks e envio de mensagens direto pela API do Instagram
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * Normaliza payload de webhook do Instagram/Meta
 */
function normalizeInstagramPayload(payload) {
  // Formato Meta/Instagram API (webhook oficial)
  if (payload.entry && payload.entry[0] && payload.entry[0].messaging) {
    const messaging = payload.entry[0].messaging[0];
    
    return {
      platform: 'instagram',
      userId: messaging.sender.id,
      userName: null, // Nome não vem no webhook básico
      phone: null,
      message: messaging.message?.text || '',
      messageId: messaging.message?.mid || null,
      timestamp: messaging.timestamp
    };
  }

  // Formato alternativo Meta (changes format)
  if (payload.entry && payload.entry[0] && payload.entry[0].changes) {
    const change = payload.entry[0].changes[0];
    const value = change.value;
    
    if (value.messages && value.messages[0]) {
      const message = value.messages[0];
      return {
        platform: 'instagram',
        userId: message.from,
        userName: null,
        phone: null,
        message: message.text?.body || '',
        messageId: message.id || null,
        timestamp: message.timestamp
      };
    }
  }

  // Formato ManyChat (compatibilidade)
  if (payload.subscriber && payload.message) {
    return {
      platform: 'instagram',
      userId: payload.subscriber.id || payload.subscriber.user_id || null,
      userName: payload.subscriber.first_name || payload.subscriber.name || null,
      phone: null,
      message: payload.message.text || payload.message || '',
      messageId: payload.message.id || payload.id || null
    };
  }

  // Formato genérico para testes
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
 * Envia mensagem via Instagram API (Meta)
 */
async function sendInstagramMessage(userId, message) {
  const accessToken = process.env.META_INSTAGRAM_ACCESS_TOKEN;
  const pageId = process.env.META_INSTAGRAM_PAGE_ID;

  if (!accessToken || !pageId) {
    throw new Error('META_INSTAGRAM_ACCESS_TOKEN ou META_INSTAGRAM_PAGE_ID não configurados');
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/messages`,
      {
        recipient: {
          id: userId
        },
        message: {
          text: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao enviar mensagem Instagram:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Valida webhook do Meta/Instagram usando App Secret
 */
function validateMetaWebhook(payload, signature, appSecret) {
  if (!signature || !appSecret) {
    return true; // Se não configurado, aceita (para desenvolvimento)
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

/**
 * Formata resposta para diferentes contextos
 */
function formatInstagramResponse(message, context = 'webhook') {
  if (context === 'manychat') {
    // Compatibilidade com ManyChat
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

  // Para Meta API, apenas retorna sucesso (mensagem é enviada via API)
  return {
    success: true,
    message: 'Mensagem processada'
  };
}

/**
 * Obtém informações do usuário Instagram (se necessário)
 */
async function getInstagramUserInfo(userId) {
  const accessToken = process.env.META_INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${userId}`,
      {
        params: {
          fields: 'name,profile_pic',
          access_token: accessToken
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar info do usuário Instagram:', error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  normalizeInstagramPayload,
  sendInstagramMessage,
  validateMetaWebhook,
  formatInstagramResponse,
  getInstagramUserInfo,
  // Compatibilidade com código existente
  formatManyChatResponse: (message) => formatInstagramResponse(message, 'manychat'),
  validateManyChatWebhook: validateMetaWebhook
};
  