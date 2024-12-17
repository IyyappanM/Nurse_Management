const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Database
db.initializeDatabase();

// Routes
app.get('/api/nurses', async (req, res) => {
    const search = req.query.search || '';
    try {
        const connection = await db.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM Nurses WHERE name LIKE ? OR license_number LIKE ?',
            [`%${search}%`, `%${search}%`]
        );
        connection.release();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch nurses.' });
    }
});

app.post('/api/nurses', async (req, res) => {
    const { name, license_number, dob, age } = req.body;
    try {
        const connection = await db.getConnection();
        await connection.execute(
            'INSERT INTO Nurses (name, license_number, dob, age) VALUES (?, ?, ?, ?)',
            [name, license_number, dob, age]
        );
        connection.release();
        res.json({ message: 'Nurse added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add nurse.' });
    }
});

app.delete('/api/nurses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await db.getConnection();
        await connection.execute('DELETE FROM Nurses WHERE id = ?', [id]);
        connection.release();
        res.json({ message: 'Nurse removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove nurse.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
