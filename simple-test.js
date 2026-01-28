/**
 * Teste simples da IA
 */

const axios = require('axios');

async function testSimple() {
  try {
    console.log('🧪 Testando mensagem simples...\n');

    const payload = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: "5511123456789",
              text: {
                body: "Olá, quero conhecer a academia"
              }
            }]
          }
        }]
      }]
    };

    const response = await axios.post('http://localhost:3000/webhook/whatsapp', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    console.log('✅ Resposta do servidor:', response.status, response.data);
    
    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🔍 Verificando resposta no banco...');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSimple();