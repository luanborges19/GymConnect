/**
 * Servidor principal da aplicação
 * 
 * Inicializa Express, banco de dados e rotas
 */

require('dotenv').config({ path: './src/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./src/config/database');
const webhookRoutes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));  // Servir arquivos estáticos (privacy-policy.html, etc)

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'GymConnect API - Webhook Service',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: {
        whatsapp: {
          get: '/webhook/whatsapp',
          post: '/webhook/whatsapp'
        },
        instagram: {
          get: '/webhook/instagram',
          post: '/webhook/instagram'
        }
      },
      health: '/health'
    }
  });
});

// Rotas de webhook
app.use('/webhook', webhookRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'checking...'
  });
});

// Rota de debug - verifica se tudo está funcionando
app.get('/debug', (req, res) => {
  console.log('🔍 DEBUG CHECK');
  console.log('✅ Servidor respondendo');
  console.log('✅ Banco de dados inicializado');
  console.log(`✅ PORT: ${PORT}`);
  console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`✅ VERIFY_TOKEN: ${process.env.VERIFY_TOKEN ? 'configurado' : 'NÃO configurado'}`);
  console.log(`✅ OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'configurado' : 'NÃO configurado'}`);
  console.log(`✅ META_ACCESS_TOKEN: ${process.env.META_ACCESS_TOKEN ? 'configurado' : 'NÃO configurado'}`);
  
  res.json({ 
    status: 'ok',
    server: 'respondendo',
    database: 'inicializado',
    env: {
      PORT,
      NODE_ENV: process.env.NODE_ENV,
      VERIFY_TOKEN: process.env.VERIFY_TOKEN ? '✅ configurado' : '❌ NÃO configurado',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ configurado' : '❌ NÃO configurado',
      META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? '✅ configurado' : '❌ NÃO configurado'
    }
  });
});

// Inicializa banco de dados e inicia servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Endpoints disponíveis:`);
      console.log(`   - GET /webhook/instagram (verificação)`);
      console.log(`   - POST /webhook/instagram`);
      console.log(`   - GET /webhook/whatsapp (verificação)`);
      console.log(`   - POST /webhook/whatsapp`);
      console.log(`   - GET /webhook/test/:platform`);
      console.log(`   - GET /health`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao inicializar banco de dados:', err);
    process.exit(1);
  });
