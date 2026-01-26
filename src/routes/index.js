/**
 * Rotas principais do sistema
 * 
 * Define endpoints para webhooks e funcionalidades auxiliares
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');


/**
 * Middleware para validar token de verificação
 * Valida o token enviado pelo Facebook/Meta no formato hub.verify_token
 */
function validateVerifyToken(req, res, next) {
  const verifyToken = process.env.VERIFY_TOKEN || 'gymconnect_verify';
  const token = req.query['hub.verify_token'];
  
  console.log('🔍 Middleware - Token recebido:', token);
  console.log('🔍 Middleware - Token esperado:', verifyToken);
  
  if (token && token === verifyToken) {
    console.log('✅ Middleware - Token válido');
    next();
  } else {
    console.log('❌ Middleware - Token de verificação inválido ou ausente');
    res.status(403).json({ error: 'Token de verificação inválido' });
  }
}

/**
 * GET /webhook/instagram
 * Verificação de webhook do Instagram/Facebook (Meta)
 * O token é validado no controller (não usar middleware aqui para não interferir)
 */
router.get('/instagram', webhookController.verifyInstagramWebhook);

/**
 * POST /webhook/instagram
 * Recebe webhooks do ManyChat/Instagram
 */
router.post('/instagram', webhookController.handleInstagramWebhook);

/**
 * GET /webhook/whatsapp
 * Verificação de webhook do WhatsApp (Meta)
 * O token é validado no controller (não usar middleware aqui para não interferir)
 * Meta envia: hub.mode, hub.verify_token, hub.challenge
 */
router.get('/whatsapp', webhookController.verifyWhatsAppWebhook);

/**
 * POST /webhook/whatsapp
 * Recebe webhooks do WhatsApp (Z-API, WATI, Twilio)
 */
router.post('/whatsapp', webhookController.handleWhatsAppWebhook);

/**
 * GET /webhook/test/:platform
 * Endpoint de teste para verificar se webhooks estão funcionando
 */
router.get('/test/:platform?', webhookController.testWebhook);

module.exports = router;
