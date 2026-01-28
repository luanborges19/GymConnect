/**
 * Script para verificar as respostas da IA no banco de dados
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'academia.db');

function checkResponses() {
  const db = new sqlite3.Database(dbPath);

  console.log('🔍 VERIFICANDO RESPOSTAS DA IA NO BANCO DE DADOS\n');

  // Busca as últimas conversas
  db.all(`
    SELECT 
      c.platform,
      c.user_id,
      l.user_name,
      c.message_text,
      c.response_text,
      c.transferred_to_human,
      datetime(c.created_at, 'localtime') as created_at
    FROM conversations c
    LEFT JOIN leads l ON c.platform = l.platform AND c.user_id = l.user_id
    ORDER BY c.created_at DESC
    LIMIT 20
  `, (err, rows) => {
    if (err) {
      console.error('❌ Erro ao consultar banco:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('📭 Nenhuma conversa encontrada no banco de dados');
      return;
    }

    rows.forEach((row, index) => {
      console.log(`${'='.repeat(80)}`);
      console.log(`💬 CONVERSA #${index + 1}`);
      console.log(`📱 Plataforma: ${row.platform}`);
      console.log(`👤 Usuário: ${row.user_name || 'N/A'} (${row.user_id})`);
      console.log(`⏰ Data: ${row.created_at}`);
      console.log(`📥 Mensagem do cliente: "${row.message_text}"`);
      console.log(`🤖 Resposta da IA: "${row.response_text}"`);
      console.log(`🔄 Transferido para humano: ${row.transferred_to_human ? 'SIM' : 'NÃO'}`);
      console.log(`${'='.repeat(80)}\n`);
    });

    db.close();
  });
}

checkResponses();