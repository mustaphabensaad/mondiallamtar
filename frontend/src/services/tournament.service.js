import api from './api';

export const tournamentService = {
  get:           ()       => api.get('/api/tournament').then(r => r.data.tournament),
  getGroups:     ()       => api.get('/api/groups').then(r => r.data.groups),
  getSponsors:   ()       => api.get('/api/sponsors').then(r => r.data.sponsors),
  getImages:     ()       => api.get('/api/association-images').then(r => r.data.images),
};

export const matchService = {
  getAll:    (params) => api.get('/api/matches', { params }).then(r => r.data.matches),
  getToday:  ()       => api.get('/api/matches/today').then(r => r.data.matches),
  getLive:   ()       => api.get('/api/matches/live').then(r => r.data.matches),
  getById:   (id)     => api.get(`/api/matches/${id}`).then(r => r.data),
};

export const teamService = {
  getAll:    (params) => api.get('/api/teams', { params }).then(r => r.data.teams),
  getById:   (id)     => api.get(`/api/teams/${id}`).then(r => r.data.team),
  getPlayers:(id)     => api.get(`/api/teams/${id}/players`).then(r => r.data.players),
  getMyTeam: ()       => api.get('/api/teams/my-team').then(r => r.data),
};

export const playerService = {
  getTopScorers: (limit = 10) => api.get('/api/players/top-scorers', { params: { limit } }).then(r => r.data.scorers),
  getInvite:     (token)      => api.get(`/api/players/invite/${token}`).then(r => r.data.player),
  submitInvite:  (token, data) => api.post(`/api/players/invite/${token}`, data).then(r => r.data),
};

export const adminService = {
  getDashboard:  ()   => api.get('/api/admin/dashboard').then(r => r.data.stats),
  getPending:    ()   => api.get('/api/admin/teams/pending').then(r => r.data.teams),
  approveTeam:   (id) => api.put(`/api/admin/teams/${id}/approve`).then(r => r.data),
  rejectTeam:    (id) => api.put(`/api/admin/teams/${id}/reject`).then(r => r.data),
};
