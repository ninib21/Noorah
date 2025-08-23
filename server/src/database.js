// Production Database Connection and ORM
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
    // Production: Use environment variables
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nannyradar_prod',
    user: process.env.DB_USER || 'nannyradar_user',
    password: process.env.DB_PASSWORD || 'your_secure_password',
    
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    
    // SSL for production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Database connection wrapper
class Database {
    constructor() {
        this.pool = pool;
    }

    // Execute query with error handling
    async query(text, params = []) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('Database query error:', { text: text.substring(0, 100), error: error.message });
            throw error;
        }
    }

    // Get a client from the pool for transactions
    async getClient() {
        return await this.pool.connect();
    }

    // Close all connections
    async close() {
        await this.pool.end();
    }

    // Health check
    async healthCheck() {
        try {
            const result = await this.query('SELECT NOW() as current_time, version() as version');
            return { status: 'healthy', ...result.rows[0] };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    // Run database migrations
    async migrate() {
        try {
            // Create migrations table if it doesn't exist
            await this.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `);

            // Read and execute schema.sql
            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                await this.query(schema);
                console.log('✅ Database schema created successfully');
                
                // Record migration
                await this.query(
                    'INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
                    ['schema.sql']
                );
            }

            return { success: true, message: 'Migrations completed successfully' };
        } catch (error) {
            console.error('Migration error:', error);
            return { success: false, error: error.message };
        }
    }
}

// User model
class UserModel {
    constructor(db) {
        this.db = db;
    }

    async create(userData) {
        const { email, password_hash, role, full_name, phone } = userData;
        const result = await this.db.query(
            'INSERT INTO users (email, password_hash, role, full_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, password_hash, role, full_name, phone]
        );
        return result.rows[0];
    }

    async findByEmail(email) {
        const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    async findById(id) {
        const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    async updateProfile(userId, profileData) {
        const fields = Object.keys(profileData);
        const values = Object.values(profileData);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        
        const result = await this.db.query(
            `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
            [userId, ...values]
        );
        return result.rows[0];
    }
}

// Booking model
class BookingModel {
    constructor(db) {
        this.db = db;
    }

    async create(bookingData) {
        const { parent_id, sitter_id, start_time, end_time, total_amount, location, special_instructions, children_info } = bookingData;
        const result = await this.db.query(
            'INSERT INTO bookings (parent_id, sitter_id, start_time, end_time, total_amount, location, special_instructions, children_info) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [parent_id, sitter_id, start_time, end_time, total_amount, JSON.stringify(location), special_instructions, JSON.stringify(children_info)]
        );
        return result.rows[0];
    }

    async findByUserId(userId, role = 'parent') {
        const column = role === 'parent' ? 'parent_id' : 'sitter_id';
        const result = await this.db.query(
            `SELECT b.*, u1.full_name as parent_name, u2.full_name as sitter_name 
             FROM bookings b 
             JOIN users u1 ON b.parent_id = u1.id 
             JOIN users u2 ON b.sitter_id = u2.id 
             WHERE b.${column} = $1 
             ORDER BY b.start_time DESC`,
            [userId]
        );
        return result.rows;
    }

    async updateStatus(bookingId, status) {
        const result = await this.db.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, bookingId]
        );
        return result.rows[0];
    }
}

// Payment model
class PaymentModel {
    constructor(db) {
        this.db = db;
    }

    async create(paymentData) {
        const { booking_id, stripe_payment_intent_id, amount, currency, payment_method, tip_amount } = paymentData;
        const result = await this.db.query(
            'INSERT INTO payments (booking_id, stripe_payment_intent_id, amount, currency, payment_method, tip_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [booking_id, stripe_payment_intent_id, amount, currency, payment_method, tip_amount || 0]
        );
        return result.rows[0];
    }

    async updateStatus(paymentId, status) {
        const result = await this.db.query(
            'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
            [status, paymentId]
        );
        return result.rows[0];
    }
}

// Initialize database and models
const db = new Database();
const User = new UserModel(db);
const Booking = new BookingModel(db);
const Payment = new PaymentModel(db);

// Export everything
module.exports = {
    db,
    User,
    Booking,
    Payment,
    Database
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing database connections...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Closing database connections...');
    await db.close();
    process.exit(0);
});
