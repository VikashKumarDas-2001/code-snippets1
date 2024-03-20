// backend/app.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3001;

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306', // Default MySQL port used by XAMPP
    user: 'root',
    password: '',
    database: 'mydatabase'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err.stack);
        return;
    }
    console.log('Connected to MySQL as ID: ', connection.threadId);
});

// Middleware
app.use(bodyParser.json());

// CORS middleware for development (optional)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API Endpoints
app.post('/submit', (req, res) => {
    const { username, language, stdin, sourcecode } = req.body;
    const timestamp = new Date().toISOString();
    const sql = 'INSERT INTO code_snippets (username, language, stdin, sourcecode, timestamp) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [username, language, stdin, sourcecode, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting code snippet: ', err.stack);
            res.status(500).json({ error: 'Error submitting code snippet' });
            return;
        }
        console.log('Code snippet submitted successfully');
        res.status(200).json({ message: 'Code snippet submitted successfully' });
    });
});

app.get('/snippets', (req, res) => {
    const sql = 'SELECT username, language, stdin, timestamp, LEFT(sourcecode, 100) AS sourcecode FROM code_snippets';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving code snippets: ', err.stack);
            res.status(500).json({ error: 'Error retrieving code snippets' });
            return;
        }
        res.status(200).json(results);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
