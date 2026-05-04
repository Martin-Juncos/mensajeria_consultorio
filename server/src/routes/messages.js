const express = require('express');
const router = express.Router();
const { Message, MessageRecipient, User, Subject, Patient } = require('../models');

const messageInclude = [
  { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
  { model: Subject, as: 'subject', include: [{ model: Patient, as: 'patient', attributes: ['id', 'name'] }] },
  {
    model: MessageRecipient,
    as: 'recipients',
    include: [{ model: User, as: 'recipient', attributes: ['id', 'name', 'role'] }],
  },
];

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    if (type === 'sent') {
      const messages = await Message.findAll({
        where: { senderId: userId },
        include: messageInclude,
        order: [['createdAt', 'DESC']],
      });
      return res.json(messages);
    } else {
      const messages = await Message.findAll({
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
          { model: Subject, as: 'subject', include: [{ model: Patient, as: 'patient', attributes: ['id', 'name'] }] },
          {
            model: MessageRecipient,
            as: 'recipients',
            where: { recipientId: userId },
            required: true,
            include: [{ model: User, as: 'recipient', attributes: ['id', 'name'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      return res.json(messages);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: Subject, as: 'subject', include: [{ model: Patient, as: 'patient' }] },
        {
          model: MessageRecipient,
          as: 'recipients',
          include: [{ model: User, as: 'recipient', attributes: ['id', 'name', 'role'] }],
        },
      ],
    });
    if (!message) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { senderId, subjectId, title, body, recipientIds } = req.body;

    if (!senderId || !subjectId || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'senderId, subjectId, title y body son requeridos' });
    }

    const uniqueRecipientIds = [...new Set(recipientIds || [])].filter(Boolean);

    if (!uniqueRecipientIds.length) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un destinatario' });
    }

    if (uniqueRecipientIds.includes(senderId)) {
      return res.status(400).json({ error: 'No podés enviarte un mensaje a vos mismo' });
    }

    const [sender, subject, recipients] = await Promise.all([
      User.findOne({ where: { id: senderId, active: true } }),
      Subject.findByPk(subjectId),
      User.findAll({ where: { id: uniqueRecipientIds, active: true } }),
    ]);

    if (!sender) {
      return res.status(400).json({ error: 'El remitente no existe o está inactivo' });
    }

    if (!subject) {
      return res.status(400).json({ error: 'El asunto no existe' });
    }

    if (recipients.length !== uniqueRecipientIds.length) {
      return res.status(400).json({ error: 'Uno o más destinatarios no existen o están inactivos' });
    }

    const message = await Message.create({
      senderId,
      subjectId,
      title: title.trim(),
      body: body.trim(),
    });

    await MessageRecipient.bulkCreate(
      uniqueRecipientIds.map(recipientId => ({
        messageId: message.id,
        recipientId,
      }))
    );

    const fullMessage = await Message.findByPk(message.id, {
      include: messageInclude,
    });

    res.status(201).json(fullMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    const messageId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const recipient = await MessageRecipient.findOne({
      where: { messageId, recipientId: userId },
      include: [{ model: User, as: 'recipient', attributes: ['id', 'name', 'role'] }],
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Destinatario no encontrado' });
    }

    await recipient.update({ readAt: new Date() });
    res.json(recipient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Mensaje no encontrado' });

    await MessageRecipient.destroy({ where: { messageId: req.params.id } });
    await message.destroy();

    res.json({ message: 'Mensaje eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
