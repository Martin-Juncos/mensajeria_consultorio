const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageRecipient = sequelize.define('MessageRecipient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'message_recipients',
  timestamps: true,
});

module.exports = MessageRecipient;