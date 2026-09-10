#!/usr/bin/env node

/**
 * Script de Sincronização e Relatório do MindFlow para o Antigravity (ESM)
 * Leitura de backups JSON do MindFlow Journaling & Habit Tracker
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BACKUP_PATH = path.join(__dirname, '..', 'mindflow_backup.json')

function runSync() {
  console.log('🧘 [MindFlow -> Antigravity Sync Tool]')
  
  if (!fs.existsSync(BACKUP_PATH)) {
    console.log(`ℹ️ Nenhum arquivo de backup encontrado em: ${BACKUP_PATH}`)
    console.log(`👉 Dica: Baixe o backup JSON no app MindFlow com o botão de Backup e salve como: mindflow_backup.json`)
    process.exit(0)
  }

  try {
    const rawData = fs.readFileSync(BACKUP_PATH, 'utf8')
    const data = JSON.parse(rawData)

    console.log(`\n✅ Backup Carregado Com Sucesso!`)
    console.log(`👤 Usuário: ${data.user ? data.user.name : 'Ariel'}`)
    console.log(`📅 Data de Exportação: ${data.exportedAt || 'Desconhecida'}`)

    console.log('\n🎯 --- Status dos Hábitos ---')
    if (data.habits && data.habits.length > 0) {
      data.habits.forEach(h => {
        console.log(`  • ${h.name} | Sequência Ativa: 🔥 ${h.streak || 0} dias | Total Concluído: ${h.history ? h.history.length : 0} vezes`)
      })
    } else {
      console.log('  Nenhum hábito cadastrado.')
    }

    console.log('\n📝 --- Últimas Entradas do Diário ---')
    if (data.entries && data.entries.length > 0) {
      data.entries.slice(0, 3).forEach((e, idx) => {
        const dateStr = new Date(e.date).toLocaleDateString('pt-BR')
        console.log(`  [${idx + 1}] ${dateStr} (${e.mood || 'sem mood'}) | ${e.category || 'geral'}`)
        console.log(`      "${e.content}"`)
      })
    } else {
      console.log('  Nenhuma nota registrada.')
    }

    console.log('\n🚀 Sincronização concluída com sucesso para o ecossistema Antigravity.\n')
  } catch (err) {
    console.error('❌ Erro ao processar o backup do MindFlow:', err.message)
  }
}

runSync()
