module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
      console.log(`[Socket] ${socket.id} joined match_${matchId}`);
    });

    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
