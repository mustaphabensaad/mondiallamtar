const jwt  = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function generateInviteToken() {
  return uuidv4().replace(/-/g, '');
}

function buildInviteLink(token) {
  return `${process.env.FRONTEND_URL}/join/${token}`;
}

module.exports = { signToken, generateInviteToken, buildInviteLink };
