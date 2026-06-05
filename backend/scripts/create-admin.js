require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt   = require('bcryptjs');
const readline = require('readline');
const db       = require('../src/config/db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('─── Create Admin User ───────────────────────');
  const email    = await ask('Email: ');
  const password = await ask('Password: ');

  if (!email || !password) {
    console.error('Email and password are required.');
    process.exit(1);
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.error('A user with this email already exists.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, "admin")',
    [email, hash]
  );

  console.log(`Admin created with id=${result.insertId}`);
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
