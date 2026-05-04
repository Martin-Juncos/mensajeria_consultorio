const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Subject = require('./Subject');
const Message = require('./Message');
const MessageRecipient = require('./MessageRecipient');

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

Patient.hasMany(Subject, { foreignKey: 'patientId', as: 'subjects' });
Subject.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Subject.hasMany(Message, { foreignKey: 'subjectId', as: 'messages' });
Message.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Message.hasMany(MessageRecipient, { foreignKey: 'messageId', as: 'recipients' });
MessageRecipient.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

User.hasMany(MessageRecipient, { foreignKey: 'recipientId', as: 'receivedMessages' });
MessageRecipient.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  Patient,
  Subject,
  Message,
  MessageRecipient,
};