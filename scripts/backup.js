const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Créer le dossier backups s'il n'existe pas
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup de la base de données
const backupDatabase = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 19).replace(/:/g, '-');
  const backupPath = path.join(backupDir, `backup_${dateStr}.db`);
  const dbPath = path.join(__dirname, '../database/blog.db');
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`💾 Backup créé : ${backupPath}`);
    
    // Supprimer les backups de plus de 30 jours
    const files = fs.readdirSync(backupDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Ancien backup supprimé : ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Erreur backup:', error.message);
  }
};

// Backup toutes les 24 heures
setInterval(backupDatabase, 24 * 60 * 60 * 1000);
console.log('📁 Système de backup actif (toutes les 24h)');

// Backup au démarrage
backupDatabase();

// Backup manuel via API (optionnel)
const backupManual = () => backupDatabase();

module.exports = { backupDatabase, backupManual };
