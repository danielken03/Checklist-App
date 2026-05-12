const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = new sqlite3.Database('./database.sqlite');

async function createGrandAdmin() {
  return new Promise((resolve) => {
    rl.question('Enter username for Grand Admin: ', (username) => {
      rl.question('Enter password: ', (password) => {
        rl.question('Enter full name: ', async (name) => {
          
          const hashedPassword = await bcrypt.hash(password, 10);
          
          db.run(
            'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, name, 'grand_admin'],
            (err) => {
              if (err) {
                console.error('Error creating user:', err);
              } else {
                console.log('\n✓ Grand Admin account created successfully!');
                console.log(`Username: ${username}`);
                console.log(`Role: Grand Admin`);
              }
              db.close();
              rl.close();
              resolve();
            }
          );
        });
      });
    });
  });
}

createGrandAdmin();
