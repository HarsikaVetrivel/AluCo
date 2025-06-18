const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-here';  // You can change this secret key

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json());

// MySQL Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'LearnGrow123$', // Use your MySQL password
  database: 'alumni_connect',
});

// JWT Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// ➤ Get Alumni Directory
app.get('/alumni', authenticateJWT, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [alumni] = await connection.query(
      'SELECT user_id, name, department, year_of_passing, current_position, email FROM users WHERE role = "alumni"'
    );
    connection.release();
    res.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ message: 'Error fetching alumni data' });
  }
});


// ➤ TEST Route
app.get('/', (req, res) => {
  res.send('🌟 Server is running fine!');
});

// ➤ Register Route
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, year_of_passing, current_position } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await connection.query(
      'INSERT INTO users (name, email, password, role, department, year_of_passing, current_position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department || null, year_of_passing || null, current_position || null]
    );

    connection.release();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});


// ➤ Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ➤ Get Meetings
app.get('/meetings', authenticateJWT, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [meetings] = await connection.query('SELECT * FROM meetings');
    connection.release();
    res.json(meetings);
    console.log(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Error fetching meetings data' });
  }
});

// ➤ Create Meeting (only for authenticated users)
app.post('/meetings', authenticateJWT, async (req, res) => {
  try {
    const { title, description, start_date, end_date } = req.body;

    if (!title || !description || !start_date || !end_date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Received meeting details:', { title, description, start_date, end_date });

    const connection = await pool.getConnection();

    // Insert the meeting
    await connection.query(
      'INSERT INTO meetings (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
      [title, description, start_date, end_date]
    );

    // Retrieve the inserted meeting
    const [rows] = await connection.query(
      'SELECT * FROM meetings WHERE id = LAST_INSERT_ID()'
    );

    connection.release();

    if (rows.length === 0) {
      return res.status(500).json({ message: 'Failed to retrieve the newly scheduled meeting' });
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error scheduling meeting:', error.message, error.stack);
    res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
  }
});

// ➤ Start Server with DB check
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database!');
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
})();
