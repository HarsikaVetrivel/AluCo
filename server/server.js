const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'LearnGrow123$', // replace with your MySQL password
    database: 'meeting_scheduler'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Create a meeting
app.post('/api/meetings', (req, res) => {
    const { title, description, start_time, end_time, participants } = req.body;
    
    const query = 'INSERT INTO meetings (title, description, start_time, end_time, participants) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, start_time, end_time, participants], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.status(201).send({ id: result.insertId, ...req.body });
    });
});

// Get all meetings
app.get('/api/meetings', (req, res) => {
    const query = 'SELECT * FROM meetings ORDER BY start_time';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});