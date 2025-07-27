const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// routers
const studentsRouter = require('./routes/students');
const classesRouter = require('./routes/classes');
const teachersRouter = require('./routes/teachers');
const treatmentsRouter = require('./routes/treatments');
const schedulesRouter = require('./routes/schedules');
const gradesRouter = require('./routes/grades');
const rolesRouter = require('./routes/roles');
const subjectsRouter = require('./routes/subjects');

// routes
app.use('/students', studentsRouter);
app.use('/classes', classesRouter);
app.use('/teachers', teachersRouter);
app.use('/treatments', treatmentsRouter);
app.use('/schedules', schedulesRouter);
app.use('/grades', gradesRouter);
app.use('/roles', rolesRouter);
app.use('/subjects', subjectsRouter);

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
