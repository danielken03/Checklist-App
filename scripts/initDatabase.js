const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database opened successfully');
});

async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('employee', 'admin')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) console.error('Error creating users table:', err);
          else console.log('✓ Users table created');
        });

        // Task templates table
        db.run(`CREATE TABLE IF NOT EXISTS task_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly')),
          is_active INTEGER DEFAULT 1,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )`, (err) => {
          if (err) console.error('Error creating task_templates table:', err);
          else console.log('✓ Task templates table created');
        });

        // Tasks table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          template_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly')),
          due_date DATE NOT NULL,
          week_start DATE,
          month_start DATE,
          is_one_off INTEGER DEFAULT 0,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (template_id) REFERENCES task_templates(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )`, (err) => {
          if (err) console.error('Error creating tasks table:', err);
          else console.log('✓ Tasks table created');
        });

        // Task completions
        db.run(`CREATE TABLE IF NOT EXISTS task_completions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
          if (err) console.error('Error creating task_completions table:', err);
          else console.log('✓ Task completions table created');
        });

        // Comments
        db.run(`CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
          if (err) console.error('Error creating comments table:', err);
          else console.log('✓ Comments table created');
        });

        // File uploads
        db.run(`CREATE TABLE IF NOT EXISTS file_uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
          if (err) console.error('Error creating file_uploads table:', err);
          else console.log('✓ File uploads table created');
        });

        // Wait a bit for tables to be created
        setTimeout(async () => {
          console.log('\nCreating users...');
          const hashedPassword = await bcrypt.hash('password123', 10);
          console.log('Password hashed:', hashedPassword.substring(0, 20) + '...');
          
          const adminStmt = db.prepare('INSERT OR REPLACE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)');
          
          // 5 Admins
          for (let i = 1; i <= 5; i++) {
            adminStmt.run(`admin${i}`, hashedPassword, `Admin ${i}`, 'admin', (err) => {
              if (err) console.error(`Error creating admin${i}:`, err);
              else console.log(`✓ Created admin${i}`);
            });
          }
          
          // 15 Employees
          for (let i = 1; i <= 15; i++) {
            adminStmt.run(`employee${i}`, hashedPassword, `Employee ${i}`, 'employee', (err) => {
              if (err) console.error(`Error creating employee${i}:`, err);
              else console.log(`✓ Created employee${i}`);
            });
          }
          
          adminStmt.finalize();

          // Create sample task templates
          setTimeout(() => {
            console.log('\nCreating task templates...');
            const templateStmt = db.prepare(`
              INSERT OR REPLACE INTO task_templates (title, description, frequency, created_by) 
              VALUES (?, ?, ?, 1)
            `);
            
            templateStmt.run('Check emails and respond', 'Review and respond to all pending emails', 'daily');
            templateStmt.run('Update daily log', 'Document today\'s activities and progress', 'daily');
            templateStmt.run('Team standup meeting', 'Attend daily team standup', 'daily');
            
            templateStmt.run('Weekly report submission', 'Submit weekly progress report to management', 'weekly');
            templateStmt.run('Team meeting', 'Attend weekly team meeting', 'weekly');
            templateStmt.run('Clean workspace', 'Organize and clean work area', 'weekly');
            
            templateStmt.run('Monthly inventory check', 'Complete monthly inventory audit', 'monthly');
            templateStmt.run('Review monthly goals', 'Review and update monthly objectives', 'monthly');
            templateStmt.run('Submit expense reports', 'Submit all monthly expenses', 'monthly');
            
            templateStmt.finalize(() => {
              console.log('✓ Task templates created');
              
              console.log('\n✅ Database initialized successfully!');
              console.log('\n📝 Default Accounts Created:');
              console.log('   Admins: admin1 to admin5 (password: password123)');
              console.log('   Employees: employee1 to employee15 (password: password123)');
              console.log('\n🔧 Sample task templates have been created.');
              
              resolve();
            });
          }, 500);
        }, 500);
      } catch (error) {
        console.error('Error in initialization:', error);
        reject(error);
      }
    });
  });
}

initDatabase()
  .then(() => {
    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 1000);
  })
  .catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });
