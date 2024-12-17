const mysql = require('mysql2/promise');

// Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nurses_management'
};

const pool = mysql.createPool(dbConfig);

// Initialize Database
async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Nurses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                license_number VARCHAR(100) NOT NULL,
                dob DATE NOT NULL,
                age INT NOT NULL
            );
        `);
        console.log('Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        connection.release();
    }
}

// Get Connection from Pool
async function getConnection() {
    return pool.getConnection();
}

module.exports = { initializeDatabase, getConnection };
