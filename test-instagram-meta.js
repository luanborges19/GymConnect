/**
 * Teste específico para Instagram via Meta API
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Simula payload real da Meta API para Instagram
const metaInstagramPayloads = [
  {
    name: "Meta Instagram Messaging Format",
    payload: {
      object: "instagram",
      entry: [
        {
          id: "instagram_page_id",
          time: Date.now(),
          messaging: [
            {
              sender: {
                id: "instagram_user_123456789"
              },
              recipient: {
                id: "instagram_page_id"
              },
              timestamp: Date.now(),
              message: {
                mid: "msg_instagram_001",
                text: "Oi, quero saber sobre a academia"
              }
            }
          ]
        }
      ]
    }
  },
  {
    name: "Meta Instagram Changes Format",
    payload: {
      object: "instagram",
      entry: [
        {
          id: "instagram_page_id", 
          time: Date.now(),
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  {
                    from: "instagram_user_987654321",
                    id: "msg_instagram_002",
                    timestamp: Date.now(),
                    text: {
                      body: "Quanto custa a mensalidade?"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    name: "Instagram Direct Message",
    payload: {
      object: "instagram",
      entry: [
        {
          id: "instagram_page_id",
          time: Date.now(),
          messaging: [
            {
              sender: {
                id: "instagram_user_555666777"
              },
              recipient: {
                id: "instagram_page_id"
              },
              timestamp: Date.now(),
              message: {
                mid: "msg_instagram_003",
                text: "Vocês têm personal trainer?"
              }
            }
          ]
        }
      ]
    }
  }
];

/**
 * Testa verificação do webhook Instagram (Meta)
 */
async function testInstagramVerification() {
  try {
    console.log('\n🔍 TESTANDO VERIFICAÇÃO WEBHOOK INSTAGRAM (META API)');
    console.log('='.repeat(70));

    const response = await axios.get(`${BASE_URL}/webhook/instagram`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'GymConnect_WhatsApp_2024_SKZ7mPqR9jLn2xVwKyU5Dt8BF',
        'hub.challenge': 'meta_challenge_instagram_123'
      }
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📤 Challenge retornado: "${response.data}"`);
    console.log('✅ Verificação Meta Instagram funcionando!');

  } catch (error) {
    console.error('❌ Erro na verificação Instagram:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

/**
 * Testa payload específico do Instagram
 */
async function testInstagramMetaPayload(testCase) {
  try {
    console.log(`\n🧪 TESTANDO: ${testCase.name}`);
    console.log('='.repeat(70));
    console.log('📥 Payload Meta Instagram:');
    console.log(JSON.stringify(testCase.payload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/webhook/instagram`,
      testCase.payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=test_signature' // Para desenvolvimento
        },
        timeout: 15000
      }
    );

    console.log(`✅ Status: ${response.status}`);
    console.log('📤 Resposta do servidor:');
    console.log(JSON.stringify(response.data, null, 2));

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error(`❌ Erro no teste "${testCase.name}":`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

/**
 * Verifica configurações necessárias
 */
async function checkInstagramConfig() {
  try {
    console.log('\n🔧 VERIFICANDO CONFIGURAÇÕES INSTAGRAM');
    console.log('='.repeat(70));

    const response = await axios.get(`${BASE_URL}/debug`);
    const config = response.data;

    console.log('📊 Status das configurações:');
    console.log(`   META_APP_ID: ${process.env.META_APP_ID ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`   META_APP_SECRET: ${process.env.META_APP_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`   META_INSTAGRAM_ACCESS_TOKEN: ${process.env.META_INSTAGRAM_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`   META_INSTAGRAM_PAGE_ID: ${process.env.META_INSTAGRAM_PAGE_ID ? '✅ Configurado' : '❌ Não configurado'}`);

    console.log('\n📋 Próximos passos:');
    if (!process.env.META_APP_ID || process.env.META_APP_ID === 'COLE_SEU_APP_ID_AQUI') {
      console.log('   1. ❌ Criar app no Meta for Developers');
      console.log('   2. ❌ Configurar META_APP_ID no .env');
    } else {
      console.log('   1. ✅ App ID configurado');
    }

    if (!process.env.META_APP_SECRET || process.env.META_APP_SECRET === 'COLE_SEU_APP_SECRET_AQUI') {
      console.log('   3. ❌ Configurar META_APP_SECRET no .env');
    } else {
      console.log('   2. ✅ App Secret configurado');
    }

    if (!process.env.META_INSTAGRAM_PAGE_ID || process.env.META_INSTAGRAM_PAGE_ID === 'COLE_SEU_PAGE_ID_AQUI') {
      console.log('   4. ❌ Configurar META_INSTAGRAM_PAGE_ID no .env');
    } else {
      console.log('   3. ✅ Page ID configurado');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error.message);
  }
}

/**
 * Verifica conversas do Instagram no banco
 */
async function checkInstagramConversations() {
  console.log('\n🔍 VERIFICANDO CONVERSAS INSTAGRAM NO BANCO...\n');
  
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
    LIMIT 5
  `, (err, rows) => {
    if (err) {
      console.error('❌ Erro ao consultar banco:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('📭 Nenhuma conversa do Instagram encontrada no banco');
      return;
    }

    console.log(`📊 Últimas ${rows.length} conversas do Instagram:`);
    rows.forEach((row, index) => {
      console.log(`\n📸 INSTAGRAM #${index + 1}`);
      console.log(`👤 ${row.user_name || 'N/A'} (${row.user_id})`);
      console.log(`⏰ ${row.created_at}`);
      console.log(`📥 "${row.message_text}"`);
      console.log(`🤖 "${row.response_text}"`);
    });

    db.close();
  });
}

/**
 * Executa todos os testes do Instagram Meta API
 */
async function runAllInstagramTests() {
  console.log('🚀 INICIANDO TESTES INSTAGRAM META API');
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  // Verifica configurações
  await checkInstagramConfig();

  // Testa verificação
  await testInstagramVerification();

  // Testa cada formato de payload
  for (const testCase of metaInstagramPayloads) {
    await testInstagramMetaPayload(testCase);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ TODOS OS TESTES INSTAGRAM META API CONCLUÍDOS!');
  console.log(`📊 Total de formatos testados: ${metaInstagramPayloads.length}`);
  console.log('='.repeat(70));

  // Verifica conversas no banco
  setTimeout(checkInstagramConversations, 2000);
}

// Execução baseada em argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  runAllInstagramTests();
} else if (args[0] === 'config') {
  checkInstagramConfig();
} else if (args[0] === 'verify') {
  testInstagramVerification();
} else if (args[0] === 'conversations') {
  checkInstagramConversations();
} else {
  console.log(`
Uso: node test-instagram-meta.js [opção]

Opções:
  (sem argumentos)  - Executa todos os testes
  config           - Verifica configurações necessárias
  verify           - Testa apenas verificação do webhook
  conversations    - Mostra conversas do Instagram no banco
  `);
}