/**
 * Teste específico para webhook do Instagram
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Simula diferentes formatos de payload do Instagram/ManyChat
const testPayloads = [
  {
    name: "ManyChat Format 1",
    payload: {
      subscriber: {
        id: "instagram_123456789",
        first_name: "Maria",
        user_id: "maria_instagram"
      },
      message: {
        id: "msg_001",
        text: "Oi, quero saber sobre a academia"
      }
    }
  },
  {
    name: "ManyChat Format 2", 
    payload: {
      user_id: "instagram_987654321",
      first_name: "João",
      text: "Quanto custa a mensalidade?",
      message_id: "msg_002"
    }
  },
  {
    name: "Generic Instagram Format",
    payload: {
      userId: "instagram_555666777",
      userName: "Ana Silva",
      message: "Vocês têm aulas de pilates?",
      messageId: "msg_003"
    }
  }
];

/**
 * Testa verificação do webhook (GET)
 */
async function testWebhookVerification() {
  try {
    console.log('\n🔍 TESTANDO VERIFICAÇÃO DO WEBHOOK INSTAGRAM');
    console.log('='.repeat(60));

    const response = await axios.get(`${BASE_URL}/webhook/instagram`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'GymConnect_WhatsApp_2024_SKZ7mPqR9jLn2xVwKyU5Dt8BF',
        'hub.challenge': 'test_challenge_123'
      }
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📤 Resposta: "${response.data}"`);
    console.log('✅ Verificação do webhook funcionando!');

  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

/**
 * Testa um payload específico
 */
async function testInstagramPayload(testCase) {
  try {
    console.log(`\n🧪 TESTANDO: ${testCase.name}`);
    console.log('='.repeat(60));
    console.log('📥 Payload enviado:');
    console.log(JSON.stringify(testCase.payload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/webhook/instagram`,
      testCase.payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ Status: ${response.status}`);
    console.log('📤 Resposta do servidor:');
    console.log(JSON.stringify(response.data, null, 2));

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error(`❌ Erro no teste "${testCase.name}":`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

/**
 * Executa todos os testes do Instagram
 */
async function runInstagramTests() {
  console.log('🚀 INICIANDO TESTES DO WEBHOOK INSTAGRAM');
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  // Testa verificação primeiro
  await testWebhookVerification();

  // Testa cada formato de payload
  for (const testCase of testPayloads) {
    await testInstagramPayload(testCase);
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TODOS OS TESTES DO INSTAGRAM CONCLUÍDOS!');
  console.log(`📊 Total de formatos testados: ${testPayloads.length}`);
  console.log('='.repeat(60));
}

/**
 * Verifica respostas no banco
 */
async function checkInstagramResponses() {
  console.log('\n🔍 VERIFICANDO RESPOSTAS DO INSTAGRAM NO BANCO...\n');
  
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, 'database', 'academia.db');
  
  const db = new sqlite3.Database(dbPath);

  db.all(`
    SELECT 
      c.platform,
      c.user_id,
      l.user_name,
      c.message_text,
      c.response_text,
      datetime(c.created_at, 'localtime') as created_at
    FROM conversations c
    LEFT JOIN leads l ON c.platform = l.platform AND c.user_id = l.user_id
    WHERE c.platform = 'instagram'
    ORDER BY c.created_at DESC
    LIMIT 10
  `, (err, rows) => {
    if (err) {
      console.error('❌ Erro ao consultar banco:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('📭 Nenhuma conversa do Instagram encontrada');
      return;
    }

    rows.forEach((row, index) => {
      console.log(`📱 INSTAGRAM #${index + 1}`);
      console.log(`👤 ${row.user_name || 'N/A'} (${row.user_id})`);
      console.log(`⏰ ${row.created_at}`);
      console.log(`📥 "${row.message_text}"`);
      console.log(`🤖 "${row.response_text}"`);
      console.log('-'.repeat(50));
    });

    db.close();
  });
}

// Execução baseada em argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  // Executa todos os testes
  runInstagramTests().then(() => {
    setTimeout(checkInstagramResponses, 2000);
  });
} else if (args[0] === 'verify') {
  // Testa apenas verificação
  testWebhookVerification();
} else if (args[0] === 'responses') {
  // Mostra apenas respostas
  checkInstagramResponses();
} else {
  console.log(`
Uso: node test-instagram.js [opção]

Opções:
  (sem argumentos)  - Executa todos os testes
  verify           - Testa apenas verificação do webhook
  responses        - Mostra conversas do Instagram no banco
  `);
}