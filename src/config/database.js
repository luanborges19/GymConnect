/**
 * Configuração e inicialização do banco de dados SQLite
 * 
 * Gerencia conexão e criação de tabelas para:
 * - Leads (clientes potenciais)
 * - Conversas (histórico de mensagens)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/academia.db');
const DB_DIR = path.dirname(DB_PATH);

// Garante que o diretório do banco existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * Cria conexão com o banco de dados
 */
function createConnection() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Erro ao conectar ao banco de dados:', err);
    return;
    }
    console.log('✅ Banco de dados SQLite conectado');
  });
}

/**
 * Inicializa as tabelas do banco de dados
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = createConnection();

    // Tabela de Leads
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new',
        notes TEXT,
        UNIQUE(platform, user_id)
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela leads:', err);
        db.close();
        reject(err);
        return;
      }
      console.log('✅ Tabela leads criada/verificada');

      // Tabela de Conversas (histórico)
      db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform TEXT NOT NULL,
          user_id TEXT NOT NULL,
          message_type TEXT NOT NULL,
          message_text TEXT,
          response_text TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          transferred_to_human BOOLEAN DEFAULT 0
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela conversations:', err);
          db.close();
          reject(err);
          return;
        }
        console.log('✅ Tabela conversations criada/verificada');

        // Índices para melhor performance
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_user_conversations 
          ON conversations(platform, user_id, created_at)
        `, (err) => {
          if (err) {
            console.error('Erro ao criar índice conversations:', err);
          }
        });

        db.run(`
          CREATE INDEX IF NOT EXISTS idx_leads_platform_user 
          ON leads(platform, user_id)
        `, (err) => {
          if (err) {
            console.error('Erro ao criar índice leads:', err);
          }
          db.close();
          resolve();
        });
      });
    });
  });
}

/**
 * Salva um novo lead ou atualiza existente
 */
function saveLead(platform, userId, userName = null, phone = null) {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    db.run(`
      INSERT INTO leads (platform, user_id, user_name, phone, status)
      VALUES (?, ?, ?, ?, 'new')
      ON CONFLICT(platform, user_id) 
      DO UPDATE SET 
        user_name = COALESCE(?, user_name),
        phone = COALESCE(?, phone),
        created_at = CASE 
          WHEN status = 'new' THEN created_at 
          ELSE CURRENT_TIMESTAMP 
        END
    `, [platform, userId, userName, phone, userName, phone], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Salva uma mensagem no histórico de conversas
 */
function saveConversation(platform, userId, messageType, messageText, responseText, transferredToHuman = false) {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    db.run(`
      INSERT INTO conversations 
      (platform, user_id, message_type, message_text, response_text, transferred_to_human)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [platform, userId, messageType, messageText, responseText, transferredToHuman ? 1 : 0], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
}

/**
 * Busca histórico de conversas de um usuário
 */
function getConversationHistory(platform, userId, limit = 10) {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    db.all(`
      SELECT message_type, message_text, response_text, created_at, transferred_to_human
      FROM conversations
      WHERE platform = ? AND user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [platform, userId, limit], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows.reverse()); // Retorna em ordem cronológica
      }
    });
  });
}

/**
 * Atualiza status de um lead
 */
function updateLeadStatus(platform, userId, status, notes = null) {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    db.run(`
      UPDATE leads 
      SET status = ?, notes = COALESCE(?, notes)
      WHERE platform = ? AND user_id = ?
    `, [status, notes, platform, userId], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  saveLead,
  saveConversation,
  getConversationHistory,
  updateLeadStatus,
  createConnection
};
