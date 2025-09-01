const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// הגדרת CORS
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "https://school-management-system-eim9.vercel.app/" // 👈 החליפי לדומיין האמיתי מה-Vercel
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // טיפול בבקשות preflight
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "secret123"; 

// Middleware לבדוק טוקן
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// מסלול התחברות
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'client' && password === 'password123') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// routers
const studentsRouter = require('./routes/students');
const classesRouter = require('./routes/classes');
const teachersRouter = require('./routes/teachers');
const treatmentsRouter = require('./routes/treatments');
const schedulesRouter = require('./routes/schedules');
const gradesRouter = require('./routes/grades');
const rolesRouter = require('./routes/roles');
const subjectsRouter = require('./routes/subjects');

// routes עם הגנה
app.use('/students', authenticateToken, studentsRouter);
app.use('/classes', authenticateToken, classesRouter);
app.use('/teachers', authenticateToken, teachersRouter);
app.use('/treatments', authenticateToken, treatmentsRouter);
app.use('/schedules', authenticateToken, schedulesRouter);
app.use('/grades', authenticateToken, gradesRouter);
app.use('/roles', authenticateToken, rolesRouter);
app.use('/subjects', authenticateToken, subjectsRouter);

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
