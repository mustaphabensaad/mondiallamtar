function broadcastMatchUpdate(io, matchId, data) {
  io.to(`match_${matchId}`).emit('match_update', data);
}

function broadcastGoal(io, matchId, eventData) {
  io.to(`match_${matchId}`).emit('goal', eventData);
}

function broadcastCard(io, matchId, eventData) {
  io.to(`match_${matchId}`).emit('card', eventData);
}

function broadcastMatchStart(io, matchId) {
  io.to(`match_${matchId}`).emit('match_started', { matchId, time: new Date() });
}

function broadcastMatchEnd(io, matchId, finalScore) {
  io.to(`match_${matchId}`).emit('match_ended', { matchId, finalScore });
}

module.exports = {
  broadcastMatchUpdate,
  broadcastGoal,
  broadcastCard,
  broadcastMatchStart,
  broadcastMatchEnd,
};
