const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, 'nannyradar.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ Initializing NannyRadar SQLite Database...');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'sitter', 'admin')),
    isEmailVerified BOOLEAN DEFAULT FALSE,
    isPhoneVerified BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    lastLoginAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sitter profiles table
  db.run(`CREATE TABLE IF NOT EXISTS sitter_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    bio TEXT,
    hourlyRate DECIMAL(10,2),
    experience INTEGER,
    availability TEXT,
    location VARCHAR(255),
    radius INTEGER DEFAULT 10,
    isBackgroundChecked BOOLEAN DEFAULT FALSE,
    isAvailable BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0,
    totalReviews INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id)
  )`);

  // Parent profiles table
  db.run(`CREATE TABLE IF NOT EXISTS parent_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    address VARCHAR(255),
    emergencyContact VARCHAR(255),
    specialInstructions TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id)
  )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parentId INTEGER NOT NULL,
    sitterId INTEGER NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    totalAmount DECIMAL(10,2),
    specialInstructions TEXT,
    confirmedAt DATETIME,
    startedAt DATETIME,
    completedAt DATETIME,
    rating DECIMAL(3,2),
    review TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES user(id),
    FOREIGN KEY (sitterId) REFERENCES user(id)
  )`);

  console.log('✅ Database tables created successfully!');
  
  // Insert sample data
  const sampleUsers = [
    {
      email: 'parent@example.com',
      password: '$2b$10$example.hash.for.password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      role: 'parent'
    },
    {
      email: 'sitter@example.com',
      password: '$2b$10$example.hash.for.password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1234567891',
      role: 'sitter'
    }
  ];

  const insertUser = db.prepare(`INSERT INTO user (email, password, firstName, lastName, phoneNumber, role, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  
  sampleUsers.forEach(user => {
    insertUser.run(user.email, user.password, user.firstName, user.lastName, user.phoneNumber, user.role, true);
  });
  
  insertUser.finalize();
  
  console.log('✅ Sample users created!');
  console.log('📧 Parent login: parent@example.com / password123');
  console.log('👶 Sitter login: sitter@example.com / password123');
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err.message);
  } else {
    console.log('🎉 Database initialization complete!');
    console.log(`📁 Database file: ${dbPath}`);
  }
});
