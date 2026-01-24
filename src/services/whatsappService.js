/**
 * Serviço de integração com WhatsApp
 * 
 * Suporta múltiplas APIs: Z-API, WATI, Twilio
 * Normaliza diferentes formatos de webhook
 */

const axios = require('axios');

// Configuração baseada na variável de ambiente
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || 'zapi'; // zapi, wati, twilio

/**
 * Envia mensagem via Z-API
 */
async function sendViaZAPI(phoneNumber, message) {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const baseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io';

  try {
    const response = await axios.post(
      `${baseUrl}/instances/${instanceId}/token/${token}/send-text`,
      {
        phone: phoneNumber,
        message: message
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao enviar via Z-API:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envia mensagem via WATI
 */
async function sendViaWATI(phoneNumber, message) {
  const apiKey = process.env.WATI_API_KEY;
  const baseUrl = process.env.WATI_BASE_URL || 'https://api.wati.io';

  try {
    const response = await axios.post(
      `${baseUrl}/v1/sendSessionMessage/${phoneNumber}`,
      {
        text: message
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao enviar via WATI:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envia mensagem via Twilio
 */
async function sendViaTwilio(phoneNumber, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const baseUrl = `https://${accountSid}:${authToken}@api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  try {
    const response = await axios.post(
      baseUrl,
      new URLSearchParams({
        From: fromNumber,
        To: phoneNumber,
        Body: message
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao enviar via Twilio:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envia mensagem via WhatsApp usando o provedor configurado
 */
async function sendWhatsAppMessage(phoneNumber, message) {
  // Normaliza número de telefone (remove caracteres especiais)
  const normalizedPhone = phoneNumber.replace(/\D/g, '');

  switch (WHATSAPP_PROVIDER.toLowerCase()) {
    case 'zapi':
      return await sendViaZAPI(normalizedPhone, message);
    
    case 'wati':
      return await sendViaWATI(normalizedPhone, message);
    
    case 'twilio':
      return await sendViaTwilio(normalizedPhone, message);
    
    default:
      throw new Error(`Provedor WhatsApp não suportado: ${WHATSAPP_PROVIDER}`);
  }
}

/**
 * Normaliza payload de webhook do WhatsApp (suporta diferentes formatos)
 */
function normalizeWhatsAppPayload(payload) {
  // Formato Z-API
  if (payload.phone && payload.message) {
    return {
      platform: 'whatsapp',
      userId: payload.phone.replace(/\D/g, ''),
      userName: payload.name || payload.contactName || null,
      phone: payload.phone.replace(/\D/g, ''),
      message: payload.message,
      messageId: payload.messageId || payload.id || null
    };
  }

  // Formato WATI
  if (payload.waId && payload.text) {
    return {
      platform: 'whatsapp',
      userId: payload.waId,
      userName: payload.name || null,
      phone: payload.waId,
      message: payload.text,
      messageId: payload.id || null
    };
  }

  // Formato Twilio
  if (payload.From && payload.Body) {
    return {
      platform: 'whatsapp',
      userId: payload.From.replace('whatsapp:', '').replace(/\D/g, ''),
      userName: null,
      phone: payload.From.replace('whatsapp:', '').replace(/\D/g, ''),
      message: payload.Body,
      messageId: payload.MessageSid || null
    };
  }

  // Formato genérico (tenta extrair informações comuns)
  // Para testes, se só tiver message, gera um userId temporário
  const userId = payload.userId || payload.from || payload.phone || `test_${Date.now()}`;
  const phone = payload.phone || payload.from || null;
  
  return {
    platform: 'whatsapp',
    userId: phone ? phone.replace(/\D/g, '') : userId,
    userName: payload.userName || payload.name || null,
    phone: phone ? phone.replace(/\D/g, '') : null,
    message: payload.message || payload.text || payload.body || '',
    messageId: payload.messageId || payload.id || null
  };
}

module.exports = {
  sendWhatsAppMessage,
  normalizeWhatsAppPayload
};
