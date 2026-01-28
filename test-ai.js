/**
 * Script de teste para a IA da academia
 * Simula diferentes tipos de mensagens que os clientes podem enviar
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Mensagens de teste simulando diferentes cenários
const testMessages = [
  {
    name: "Interesse inicial",
    payload: {
      platform: "whatsapp",
      userId: "5511999999999",
      userName: "João Silva",
      phone: "5511999999999",
      message: "Oi, queria saber sobre a academia"
    }
  },
  {
    name: "Pergunta sobre preços",
    payload: {
      platform: "whatsapp", 
      userId: "5511999999999",
      userName: "João Silva",
      phone: "5511999999999",
      message: "Quanto custa a mensalidade?"
    }
  },
  {
    name: "Pergunta sobre horários",
    payload: {
      platform: "whatsapp",
      userId: "5511888888888", 
      userName: "Maria Santos",
      phone: "5511888888888",
      message: "Que horas vocês abrem?"
    }
  },
  {
    name: "Interesse em aula experimental",
    payload: {
      platform: "whatsapp",
      userId: "5511777777777",
      userName: "Pedro Costa", 
      phone: "5511777777777",
      message: "Posso fazer uma aula experimental?"
    }
  },
  {
    name: "Pergunta sobre localização",
    payload: {
      platform: "whatsapp",
      userId: "5511666666666",
      userName: "Ana Lima",
      phone: "5511666666666", 
      message: "Onde vocês ficam?"
    }
  },
  {
    name: "Solicitação de atendente humano",
    payload: {
      platform: "whatsapp",
      userId: "5511555555555",
      userName: "Carlos Oliveira",
      phone: "5511555555555",
      message: "Quero falar com um atendente"
    }
  },
  {
    name: "Pergunta sobre modalidades",
    payload: {
      platform: "whatsapp",
      userId: "5511444444444",
      userName: "Lucia Ferreira", 
      phone: "5511444444444",
      message: "Vocês têm aulas de pilates?"
    }
  },
  {
    name: "Pergunta sobre equipamentos",
    payload: {
      platform: "whatsapp",
      userId: "5511333333333",
      userName: "Roberto Silva",
      phone: "5511333333333",
      message: "Que equipamentos vocês têm?"
    }
  }
];

/**
 * Simula um webhook do WhatsApp no formato Meta/Facebook
 */
function createMetaWebhookPayload(testData) {
  return {
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: testData.userId,
            text: {
              body: testData.message
            }
          }]
        }
      }]
    }]
  };
}

/**
 * Testa um cenário específico
 */
async function testScenario(scenario) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTANDO: ${scenario.name}`);
    console.log(`📱 Usuário: ${scenario.payload.userName} (${scenario.payload.userId})`);
    console.log(`💬 Mensagem: "${scenario.payload.message}"`);
    console.log(`${'='.repeat(60)}`);

    // Cria payload no formato Meta/WhatsApp
    const webhookPayload = createMetaWebhookPayload(scenario.payload);

    // Envia para o webhook
    const response = await axios.post(
      `${BASE_URL}/webhook/whatsapp`,
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ Status: ${response.status}`);
    console.log(`📤 Resposta do servidor:`, response.data);

    // Aguarda um pouco para o processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error(`❌ Erro no teste "${scenario.name}":`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados:`, error.response.data);
    }
  }
}

/**
 * Testa o endpoint de health check
 */
async function testHealthCheck() {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏥 TESTANDO: Health Check`);
    console.log(`${'='.repeat(60)}`);

    const response = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Resposta:`, response.data);
  } catch (error) {
    console.error(`❌ Erro no health check:`, error.message);
  }
}

/**
 * Testa o endpoint de debug
 */
async function testDebug() {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 TESTANDO: Debug Info`);
    console.log(`${'='.repeat(60)}`);

    const response = await axios.get(`${BASE_URL}/debug`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`🔧 Configurações:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`❌ Erro no debug:`, error.message);
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log(`🚀 INICIANDO TESTES DA IA DA ACADEMIA`);
  console.log(`⏰ ${new Date().toLocaleString()}`);

  // Testa health check primeiro
  await testHealthCheck();
  
  // Testa debug
  await testDebug();

  // Testa cada cenário
  for (const scenario of testMessages) {
    await testScenario(scenario);
    
    // Pausa entre testes para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ TODOS OS TESTES CONCLUÍDOS!`);
  console.log(`📊 Total de cenários testados: ${testMessages.length}`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Testa um cenário específico por índice
 */
async function testSingle(index) {
  if (index < 0 || index >= testMessages.length) {
    console.error(`❌ Índice inválido. Use 0-${testMessages.length - 1}`);
    return;
  }

  await testScenario(testMessages[index]);
}

// Execução baseada em argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
  // Sem argumentos: executa todos os testes
  runAllTests();
} else if (args[0] === 'health') {
  // Testa apenas health check
  testHealthCheck();
} else if (args[0] === 'debug') {
  // Testa apenas debug
  testDebug();
} else if (!isNaN(args[0])) {
  // Número: testa cenário específico
  testSingle(parseInt(args[0]));
} else {
  console.log(`
Uso: node test-ai.js [opção]

Opções:
  (sem argumentos)  - Executa todos os testes
  health           - Testa apenas health check
  debug            - Testa apenas debug info
  0-${testMessages.length - 1}             - Testa cenário específico

Cenários disponíveis:
${testMessages.map((msg, i) => `  ${i}: ${msg.name}`).join('\n')}
  `);
}