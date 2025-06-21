const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-here';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// MySQL Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3307,
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

// Routes
app.get('/', (req, res) => {
  res.send('🌟 Server is running fine!');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, year_of_passing, current_position } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const connection = await pool.getConnection();
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      'INSERT INTO users (name, email, password, role, department, year_of_passing, current_position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department || null, year_of_passing || null, current_position || null]
    );
    connection.release();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();
    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/alumni', authenticateJWT, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [alumni] = await connection.query(
      'SELECT user_id, name, department, year_of_passing, current_position, email FROM users WHERE role = "alumni"'
    );
    connection.release();
    res.json(alumni);
  } catch (err) {
    console.error('Error fetching alumni:', err);
    res.status(500).json({ message: 'Error fetching alumni data' });
  }
});

app.get('/meetings', authenticateJWT, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [meetings] = await connection.query('SELECT * FROM meetings');
    connection.release();
    res.json(meetings);
  } catch (err) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ message: 'Error fetching meetings' });
  }
});

app.post('/meetings', authenticateJWT, async (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO meetings (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
      [title, description, start_date, end_date]
    );
    const [newMeeting] = await connection.query('SELECT * FROM meetings WHERE id = LAST_INSERT_ID()');
    connection.release();
    res.status(201).json(newMeeting[0]);
  } catch (err) {
    console.error('Meeting creation error:', err);
    res.status(500).json({ message: 'Error scheduling meeting' });
  }
});

app.post('/api/scholarships', async (req, res) => {
  const { title, description, eligibility, deadline, amount, created_by } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO scholarships (title, description, eligibility, deadline, amount, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, eligibility, deadline, amount, created_by]
    );
    connection.release();
    res.status(201).json({ message: 'Scholarship posted successfully' });
  } catch (err) {
    console.error('Scholarship error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/api/scholarships', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(`
      SELECT s.*, u.name AS alumni_name 
      FROM scholarships s 
      JOIN users u ON s.created_by = u.user_id
      ORDER BY s.deadline DESC
    `);
    connection.release();
    res.json(results);
  } catch (err) {
    console.error('Scholarship fetch error:', err);
    res.status(500).json({ message: 'Error fetching scholarships' });
  }
});

app.post('/api/apply', upload.single('document'), async (req, res) => {
  const { student_id, scholarship_id } = req.body;
  const documentPath = req.file ? req.file.filename : null;
  try {
    const connection = await pool.getConnection();
    const [existing] = await connection.query(
      'SELECT * FROM applications WHERE student_id = ? AND scholarship_id = ?',
      [student_id, scholarship_id]
    );
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Already applied" });
    }
    await connection.query(
      'INSERT INTO applications (student_id, scholarship_id, status, document_path) VALUES (?, ?, ?, ?)',
      [student_id, scholarship_id, 'pending', documentPath]
    );
    connection.release();
    res.status(201).json({ message: "Application submitted with document" });
  } catch (err) {
    console.error("Error applying:", err);
    res.status(500).json({ message: "Error applying to scholarship" });
  }
});

app.get('/api/applications/:scholarshipId', async (req, res) => {
  const { scholarshipId } = req.params;
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(`
      SELECT a.id, u.name AS student_name, u.email, a.status, a.document_path
      FROM applications a
      JOIN users u ON a.student_id = u.user_id
      WHERE a.scholarship_id = ?
    `, [scholarshipId]);
    connection.release();
    res.json(results);
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

app.post('/api/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, id]
    );
    connection.release();
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Error updating status' });
  }
});

app.get('/api/my-scholarships/:alumniId', async (req, res) => {
  const { alumniId } = req.params;
  try {
    const connection = await pool.getConnection();
    const [applications] = await connection.query(`
      SELECT 
        a.id, a.status, a.document_path,
        u.name AS student_name, u.email,
        s.title AS scholarship_title
      FROM applications a
      JOIN users u ON a.student_id = u.user_id
      JOIN scholarships s ON a.scholarship_id = s.id
      WHERE s.created_by = ?
    `, [alumniId]);
    connection.release();
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Error fetching applications" });
  }
});

app.get('/api/my-applications/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  try {
    const connection = await pool.getConnection();
    const [applications] = await connection.query(`
      SELECT a.scholarship_id, a.status
      FROM applications a
      WHERE a.student_id = ?
    `, [studentId]);
    connection.release();
    res.json(applications);
  } catch (err) {
    console.error("Error fetching student's applications:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database!');
    connection.release();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
})();
