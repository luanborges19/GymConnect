/**
 * Serviço de integração com OpenAI API
 * 
 * Gerencia comunicação com a OpenAI para gerar respostas contextuais
 * do chatbot da academia.
 */

const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Informações da academia (customizáveis via .env)
const ACADEMY_INFO = {
  name: process.env.ACADEMY_NAME || 'Academia Fit',
  address: process.env.ACADEMY_ADDRESS || 'Rua Exemplo, 123 - Centro',
  phone: process.env.ACADEMY_PHONE || '(11) 99999-9999',
  hours: process.env.ACADEMY_HOURS || 'Segunda a Sexta: 6h às 22h | Sábado: 8h às 18h | Domingo: 9h às 13h'
};

/**
 * Prompt do sistema que define o comportamento do bot
 */
const SYSTEM_PROMPT = `Você é um assistente virtual de atendimento da ${ACADEMY_INFO.name}, uma academia de ginástica.

SEU OBJETIVO PRINCIPAL: Converter visitantes em clientes, agendando aulas experimentais e matrículas.

INFORMAÇÕES DA ACADEMIA:
- Nome: ${ACADEMY_INFO.name}
- Endereço: ${ACADEMY_INFO.address}
- Telefone: ${ACADEMY_INFO.phone}
- Horários: ${ACADEMY_INFO.hours}

REGRAS DE COMUNICAÇÃO:
1. Use linguagem INFORMAL, EDUCADA e COMERCIAL
2. Seja OBJETIVO - evite respostas muito longas (máximo 3-4 frases)
3. SEMPRE tente converter: ofereça aula experimental ou agendamento
4. Seja EMPOLGADO e ENCORAJADOR
5. Use emojis com moderação (1-2 por mensagem)

ESTRUTURA IDEAL DE RESPOSTA:
1. Responda a dúvida do cliente de forma clara
2. Gere empatia ou incentivo breve
3. Finalize SEMPRE com uma pergunta simples para avançar a conversa

TÓPICOS QUE VOCÊ DEVE DOMINAR:
- NUNCA informe valores numéricos.
- NUNCA invente preços, descontos ou promoções.
- Sempre diga que os valores variam conforme o plano e objetivos do aluno.
- Horários: Use as informações fornecidas acima
- Endereço: Use o endereço fornecido acima
- Aula experimental: SEMPRE ofereça e seja entusiasmado ou transfira para atendimento humano.
- Matrícula: Explique que pode ser feita presencialmente ou via WhatsApp
- Formas de pagamento: Mencione que aceita cartão, PIX e boleto

AULA EXPERIMENTAL (REGRA DE CONVERSÃO):
- Trate a aula experimental como gratuita e sem compromisso (mesmo que não seja explicitamente gratuita)
- Use termos como: "conhecer a academia", "sentir o treino", "ver se gosta"
- Sempre convide de forma leve, nunca forçada

TRANSFERÊNCIA PARA HUMANO:
Se o usuário pedir explicitamente para "falar com atendente", "humano", "pessoa", "gerente" ou similar, 
ou se a dúvida for muito complexa/técnica, informe que um atendente entrará em contato em breve.

NUNCA invente informações que não foram fornecidas. Se não souber algo específico, 
ofereça agendar uma visita ou transferir para atendimento humano.`;

/**
 * Detecta se a mensagem contém palavras-chave que indicam necessidade de transferência humana
 */
function shouldTransferToHuman(message) {
  const transferKeywords = [
    'falar com atendente',
    'atendente',
    'humano',
    'pessoa',
    'gerente',
    'supervisor',
    'responsável',
    'quero falar com alguém',
    'preciso de ajuda humana',
    'não é um bot',
    'não é robô'
  ];

  const lowerMessage = message.toLowerCase();
  return transferKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Gera resposta usando OpenAI API
 * 
 * @param {string} userMessage - Mensagem do usuário
 * @param {Array} conversationHistory - Histórico de conversas anteriores
 * @returns {Promise<Object>} - Resposta do bot e flag de transferência
 */
async function generateResponse(userMessage, conversationHistory = []) {
  try {
    // Verifica se deve transferir para humano
    if (shouldTransferToHuman(userMessage)) {
      return {
        response: `Entendi! Um de nossos atendentes entrará em contato com você em breve. 😊\n\nEnquanto isso, posso ajudar com mais alguma coisa?`,
        transferredToHuman: true
      };
    }

    // Prepara histórico de mensagens para contexto
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Adiciona histórico (últimas 5 interações para manter contexto)
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach(conv => {
      if (conv.message_text) {
        messages.push({ role: 'user', content: conv.message_text });
      }
      if (conv.response_text) {
        messages.push({ role: 'assistant', content: conv.response_text });
      }
    });

    // Adiciona mensagem atual
    messages.push({ role: 'user', content: userMessage });

    // Chama API da OpenAI
    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 150 // Limita tamanho da resposta
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();

    return {
      response: aiResponse,
      transferredToHuman: false
    };

  } catch (error) {
    console.error('Erro ao chamar OpenAI API:', error.response?.data || error.message);
    
    // Resposta de fallback em caso de erro
    return {
      response: 'Desculpe, estou com dificuldades técnicas no momento. 😅\n\nPor favor, tente novamente em alguns instantes ou entre em contato pelo telefone.',
      transferredToHuman: false,
      error: true
    };
  }
}

/**
 * Formata resposta para ser mais natural e comercial
 */
function formatResponse(response) {
  // Remove espaços extras
  let formatted = response.trim();
  
  // Garante que não está vazia
  if (!formatted) {
    formatted = 'Olá! Como posso ajudar você hoje? 😊';
  }

  return formatted;
}

module.exports = {
  generateResponse,
  shouldTransferToHuman,
  formatResponse,
  ACADEMY_INFO
};
