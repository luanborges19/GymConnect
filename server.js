/**
 * Servidor principal da aplicação
 * 
 * Inicializa Express, banco de dados e rotas
 */

require('dotenv').config({ path: './src/.env' });
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/config/database');
const webhookRoutes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/webhook', webhookRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Inicializa banco de dados e inicia servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Endpoints disponíveis:`);
      console.log(`   - POST /webhook/whatsapp`);
      console.log(`   - POST /webhook/instagram`);
      console.log(`   - GET /webhook/test/:platform`);
      console.log(`   - GET /health`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao inicializar banco de dados:', err);
    process.exit(1);
  });
