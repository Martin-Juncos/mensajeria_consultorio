const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('paciente', 'consulta', 'informe', 'administrativo'),
    allowNull: false,
    defaultValue: 'administrativo',
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'subjects',
  timestamps: true,
});

module.exports = Subject;