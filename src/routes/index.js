/**
 * Rotas principais do sistema
 * 
 * Define endpoints para webhooks e funcionalidades auxiliares
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * POST /webhook/instagram
 * Recebe webhooks do ManyChat/Instagram
 */
router.post('/instagram', webhookController.handleInstagramWebhook);

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
