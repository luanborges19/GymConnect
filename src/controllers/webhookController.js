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
 * Valida o token de verificação
 */
function validateVerifyToken(token) {
  const verifyToken = process.env.VERIFY_TOKEN || 'gymconnect_verify';
  return token === verifyToken;
}

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
 * Processa webhook do WhatsApp Cloud API (Meta)
 * 
 * Espera payload no formato:
 * {
 *   "entry": [{
 *     "changes": [{
 *       "value": {
 *         "messages": [{
 *           "from": "5511999999999",
 *           "text": { "body": "Mensagem aqui" }
 *         }]
 *       }
 *     }]
 *   }]
 * }
 * 
 * Também ignora status updates e notificações sem messages
 */
async function handleWhatsAppWebhook(req, res) {
  // IMPORTANTE: Retorna 200 OK IMEDIATAMENTE para evitar retry do Meta
  // Processamento continua em background
  res.status(200).json({ success: true });

  try {
    const payload = req.body;

    // ═══════════════════════════════════════════════════════════
    // PASSO 1: Loga o payload bruto completo para debug
    // Visualizar em: Render Dashboard → seu serviço → Logs
    // ═══════════════════════════════════════════════════════════
    console.log('\n' + '='.repeat(70));
    console.log('📨 WEBHOOK WHATSAPP - PAYLOAD BRUTO RECEBIDO:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(payload, null, 2));
    console.log('='.repeat(70) + '\n');

    // ═══════════════════════════════════════════════════════════
    // PASSO 2: Valida estrutura básica do Meta
    // ═══════════════════════════════════════════════════════════
    if (!payload.entry || !Array.isArray(payload.entry) || payload.entry.length === 0) {
      console.log('⚠️  Payload sem entry array - ignorando');
      return;
    }

    const entry = payload.entry[0];
    if (!entry.changes || !Array.isArray(entry.changes) || entry.changes.length === 0) {
      console.log('⚠️  Entry sem changes array - ignorando');
      return;
    }

    const change = entry.changes[0];
    const value = change.value;

    // ═══════════════════════════════════════════════════════════
    // PASSO 3: Verifica se é uma mensagem ou apenas status
    // ═══════════════════════════════════════════════════════════
    if (!value.messages || !Array.isArray(value.messages) || value.messages.length === 0) {
      // Pode ser um status update (delivery, read, etc) - ignorar
      console.log('📊 Evento recebido é status/notificação, não mensagem - ignorando');
      console.log(`   Tipo: ${value.statuses ? 'status update' : 'outro evento'}`);
      return;
    }

    // ═══════════════════════════════════════════════════════════
    // PASSO 4: Extrai dados da mensagem
    // ═══════════════════════════════════════════════════════════
    const message = value.messages[0];
    const from = message.from; // ex: "5511999999999"
    const messageText = message.text?.body; // ex: "Olá"

    console.log(`📱 Mensagem extraída:`);
    console.log(`   De: ${from}`);
    console.log(`   Texto: ${messageText}`);

    // ═══════════════════════════════════════════════════════════
    // PASSO 5: Valida se tem texto
    // ═══════════════════════════════════════════════════════════
    if (!messageText || messageText.trim() === '') {
      console.log('⚠️  Mensagem vazia ou sem texto body - ignorando');
      return;
    }

    // ═══════════════════════════════════════════════════════════
    // PASSO 6: Salva/atualiza lead
    // ═══════════════════════════════════════════════════════════
    console.log('💾 Salvando lead...');
    await saveLead(
      'whatsapp',           // platform
      from,                 // userId
      null,                 // userName (não vem na Cloud API)
      from                  // phone
    );
    console.log('✅ Lead salvo');

    // ═══════════════════════════════════════════════════════════
    // PASSO 7: Busca histórico de conversas
    // ═══════════════════════════════════════════════════════════
    console.log('📋 Buscando histórico de conversas...');
    const history = await getConversationHistory('whatsapp', from, 5);
    console.log(`✅ Histórico carregado (${history.length} mensagens)`);

    // ═══════════════════════════════════════════════════════════
    // PASSO 8: Gera resposta com IA
    // ═══════════════════════════════════════════════════════════
    console.log('🤖 Enviando para IA...');
    const aiResponse = await openaiService.generateResponse(
      messageText,
      history
    );
    const formattedResponse = openaiService.formatResponse(aiResponse.response);
    console.log(`✅ Resposta IA gerada:`);
    console.log(`   ${formattedResponse.substring(0, 100)}...`);

    // ═══════════════════════════════════════════════════════════
    // PASSO 9: Salva conversa no banco de dados
    // ═══════════════════════════════════════════════════════════
    console.log('💾 Salvando conversa...');
    await saveConversation(
      'whatsapp',
      from,
      'user',
      messageText,
      formattedResponse,
      aiResponse.transferredToHuman
    );
    console.log('✅ Conversa salva');

    // ═══════════════════════════════════════════════════════════
    // PASSO 10: Envia resposta via Meta/WhatsApp Cloud API
    // ═══════════════════════════════════════════════════════════
    try {
      console.log(`📤 Enviando resposta via WhatsApp para ${from}...`);
      await whatsappService.sendWhatsAppMessage(from, formattedResponse);
      console.log(`✅ Resposta enviada com sucesso para ${from}`);
    } catch (sendError) {
      console.error(`❌ Erro ao enviar resposta WhatsApp para ${from}:`, sendError.message);
      // Continua mesmo se falhar (resposta já foi salva no banco)
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ WEBHOOK PROCESSADO COM SUCESSO');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ ERRO AO PROCESSAR WEBHOOK WHATSAPP:');
    console.error('='.repeat(70));
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(70) + '\n');
    
    // Não retorna erro para o Meta (já retornou 200 OK acima)
    // Apenas loga para debug
  }
}

/**
 * Verifica webhook do Instagram/Facebook (Meta)
 * Usado durante a configuração do webhook
 * 
 * Meta envia GET com query params:
 * - hub.mode=subscribe
 * - hub.verify_token=<token>
 * - hub.challenge=<challenge_string>
 * 
 * Deve retornar hub.challenge como string se token válido
 */
function verifyInstagramWebhook(req, res) {
  try {
    // Log para debug
    console.log('🔍 Verificação Instagram - Query params:', req.query);
    console.log('🔍 Verificação Instagram - Headers:', req.headers);
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`📋 Mode: ${mode}, Token recebido: ${token}, Challenge: ${challenge}`);

    const verifyToken = process.env.VERIFY_TOKEN || 'gymconnect_verify';
    console.log(`🔑 Token esperado: ${verifyToken}`);

    // Validação conforme especificação do Meta
    if (mode === 'subscribe' && token && token === verifyToken && challenge) {
      console.log('✅ Webhook Instagram verificado com sucesso');
      // Retorna o challenge como string pura (não JSON) - OBRIGATÓRIO
      res.status(200).send(String(challenge));
    } else {
      console.log('❌ Falha na verificação do webhook Instagram');
      console.log(`   Mode correto? ${mode === 'subscribe'}`);
      console.log(`   Token presente? ${!!token}`);
      console.log(`   Token correto? ${token === verifyToken}`);
      console.log(`   Challenge presente? ${!!challenge}`);
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar webhook Instagram:', error);
    res.sendStatus(500);
  }
}

/**
 * Verifica webhook do WhatsApp (Meta)
 * Usado durante a configuração do webhook
 * 
 * Meta envia GET com query params:
 * - hub.mode=subscribe
 * - hub.verify_token=<token>
 * - hub.challenge=<challenge_string>
 * 
 * Deve retornar hub.challenge como string se token válido
 */
function verifyWhatsAppWebhook(req, res) {
  try {
    // Log para debug
    console.log('🔍 Verificação WhatsApp - Query params:', req.query);
    console.log('🔍 Verificação WhatsApp - Headers:', req.headers);
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`📋 Mode: ${mode}, Token recebido: ${token}, Challenge: ${challenge}`);

    const verifyToken = process.env.VERIFY_TOKEN || 'gymconnect_verify';
    console.log(`🔑 Token esperado: ${verifyToken}`);

    // Validação conforme especificação do Meta
    if (mode === 'subscribe' && token && token === verifyToken && challenge) {
      console.log('✅ Webhook WhatsApp verificado com sucesso');
      // Retorna o challenge como string pura (não JSON) - OBRIGATÓRIO
      res.status(200).send(String(challenge));
    } else {
      console.log('❌ Falha na verificação do webhook WhatsApp');
      console.log(`   Mode correto? ${mode === 'subscribe'}`);
      console.log(`   Token presente? ${!!token}`);
      console.log(`   Token correto? ${token === verifyToken}`);
      console.log(`   Challenge presente? ${!!challenge}`);
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar webhook WhatsApp:', error);
    res.sendStatus(500);
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
  verifyInstagramWebhook,
  verifyWhatsAppWebhook,
  testWebhook
};
