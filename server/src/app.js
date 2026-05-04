require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { sequelize, User, Patient, Subject, Message, MessageRecipient } = require('./models');

const usersRouter = require('./routes/users');
const patientsRouter = require('./routes/patients');
const subjectsRouter = require('./routes/subjects');
const messagesRouter = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/messages', messagesRouter);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Usuario ${userId} se unió a su room`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, subjectId, title, body, recipientIds } = data;

      const message = await Message.create({ senderId, subjectId, title, body });

      const recipients = [...new Set(recipientIds || [])].map(recipientId => ({
        messageId: message.id,
        recipientId,
      }));
      await MessageRecipient.bulkCreate(recipients);

      const fullMessage = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name'] },
          { model: Subject, as: 'subject' },
        ],
      });

      recipientIds.forEach(recipientId => {
        io.to(recipientId).emit('new_message', fullMessage);
      });

      socket.emit('message_sent', fullMessage);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('mark_read', async (data) => {
    try {
      const { messageId, userId } = data;

      const recipient = await MessageRecipient.findOne({
        where: { messageId, recipientId: userId },
      });

      if (recipient) {
        await recipient.update({ readAt: new Date() });
        if (data.senderId) {
          io.to(data.senderId).emit('message_read', { messageId, userId });
        }
        io.to(userId).emit('message_read', { messageId, userId });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

const seedInitialUsers = async () => {
  const users = [
    {
      name: 'Dra. Ana Martínez',
      email: 'ana.martinez@consultorio.local',
      role: 'medico',
      active: true,
    },
    {
      name: 'Recepción',
      email: 'recepcion@consultorio.local',
      role: 'recepcionista',
      active: true,
    },
  ];

  await Promise.all(
    users.map((user) =>
      User.findOrCreate({
        where: { email: user.email },
        defaults: user,
      })
    )
  );
};

const seedInitialSubjects = async () => {
  const subjects = [
    { name: 'Administrativo', type: 'administrativo' },
    { name: 'Consulta', type: 'consulta' },
    { name: 'Informe', type: 'informe' },
  ];

  await Promise.all(
    subjects.map((subject) =>
      Subject.findOrCreate({
        where: { type: subject.type, patientId: null },
        defaults: subject,
      })
    )
  );
};

sequelize.sync({ force: false }).then(async () => {
  console.log('Base de datos sincronizada');
  await seedInitialUsers();
  await seedInitialSubjects();
  console.log('Datos iniciales verificados');
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar base de datos:', err);
});

module.exports = { app, server, io };
