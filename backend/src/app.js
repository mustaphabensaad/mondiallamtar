require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin:  process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Socket.io ────────────────────────────────────────────────────────────────
require('./config/socket')(io);
app.set('io', io);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/tournament',  require('./routes/tournament.routes'));
app.use('/api/teams',       require('./routes/team.routes'));
app.use('/api/players',     require('./routes/player.routes'));
app.use('/api/matches',     require('./routes/match.routes'));
app.use('/api/groups',      require('./routes/group.routes'));
app.use('/api/sponsors',    require('./routes/sponsor.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));
app.use('/api/payment',     require('./routes/payment.routes'));
app.use('/api/referees',    require('./routes/referee.routes'));
app.use('/api/knockout',    require('./routes/knockout.routes'));
app.use('/api/association-images', require('./routes/association.routes'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
