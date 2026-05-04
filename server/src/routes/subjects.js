const express = require('express');
const router = express.Router();
const { Subject, Patient } = require('../models');

router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [{ model: Patient, as: 'patient', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }],
    });
    if (!subject) return res.status(404).json({ error: 'Asunto no encontrado' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Asunto no encontrado' });
    await subject.update(req.body);
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Asunto no encontrado' });
    await subject.destroy();
    res.json({ message: 'Asunto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;