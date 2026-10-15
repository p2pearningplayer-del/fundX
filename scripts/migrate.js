/**
 * FundX Panel — Automated MySQL Database Migration & Seed Runner
 * Connects to the database configured in .env and executes database.sql
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Simple .env parser to avoid extra dependencies
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function runMigration() {
  loadEnv();

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'u591469534_fundx';
  const password = process.env.DB_PASS || 'Fund@123@1';
  const database = process.env.DB_NAME || 'u591469534_fund';

  console.log('======================================================');
  console.log('FundX Panel — MySQL Database Migration & Seeder');
  console.log('======================================================');
  console.log(`Connecting to MySQL database:`);
  console.log(`Host:     ${host}:${port}`);
  console.log(`User:     ${user}`);
  console.log(`Database: ${database}`);
  console.log('------------------------------------------------------');

  const sqlFilePath = path.join(process.cwd(), 'database.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`Error: database.sql not found at ${sqlFilePath}`);
    process.exit(1);
  }

  const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    console.log('Connected to MySQL successfully.');
    console.log('Executing database.sql...');

    await connection.query(sqlScript);

    console.log('Database tables & seed data executed successfully.');

    // Verification check
    const [tables] = await connection.query('SHOW TABLES;');
    console.log(`Total tables present in database: ${tables.length}`);
    tables.forEach((row, idx) => {
      console.log(`  [${idx + 1}] ${Object.values(row)[0]}`);
    });

    console.log('======================================================');
    console.log('Migration Completed Successfully!');
    console.log('======================================================');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nNOTE: If running locally without a local MySQL server, connect via Hostinger SSH or import via Hostinger phpMyAdmin.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
