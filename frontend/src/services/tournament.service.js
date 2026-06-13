import api from './api';

export const tournamentService = {
  get:           ()       => api.get('/api/tournament').then(r => r.data.tournament),
  getGroups:     ()       => api.get('/api/groups').then(r => r.data.groups),
  getSponsors:   ()       => api.get('/api/sponsors').then(r => r.data.sponsors),
  getImages:     ()       => api.get('/api/association-images').then(r => r.data.images),
};

export const matchService = {
  getAll:     (params)  => api.get('/api/matches', { params }).then(r => r.data.matches),
  getToday:   ()        => api.get('/api/matches/today').then(r => r.data.matches),
  getLive:    ()        => api.get('/api/matches/live').then(r => r.data.matches),
  getById:    (id)      => api.get(`/api/matches/${id}`).then(r => r.data),
  // admin
  create:     (data)    => api.post('/api/matches', data).then(r => r.data.match),
  update:     (id,data) => api.put(`/api/matches/${id}`, data).then(r => r.data.match),
  start:      (id)      => api.post(`/api/matches/${id}/start`).then(r => r.data.match),
  end:        (id,data) => api.post(`/api/matches/${id}/end`, data).then(r => r.data.match),
  addEvent:   (id,data) => api.post(`/api/matches/${id}/events`, data).then(r => r.data),
  deleteEvent:(id,eid)  => api.delete(`/api/matches/${id}/events/${eid}`).then(r => r.data),
  setScore:   (id,data) => api.put(`/api/matches/${id}/score`, data).then(r => r.data.match),
  setMotm:    (id,pid)  => api.put(`/api/matches/${id}/motm`, { player_id: pid }).then(r => r.data.match),
};

export const teamService = {
  getAll:         (params) => api.get('/api/teams', { params }).then(r => r.data.teams),
  getById:        (id)     => api.get(`/api/teams/${id}`).then(r => r.data.team),
  getPlayers:     (id)     => api.get(`/api/teams/${id}/players`).then(r => r.data.players),
  getMyTeam:      ()       => api.get('/api/teams/my-team').then(r => r.data),
  create:         (data)   => api.post('/api/teams', data).then(r => r.data.team),
  update:         (id,d)   => api.put(`/api/teams/${id}`, d).then(r => r.data.team),
  generateInvites:(id,cnt) => api.post(`/api/teams/${id}/invites`, { count: cnt }).then(r => r.data.links),
  getInvites:     (id)     => api.get(`/api/teams/${id}/invites`).then(r => r.data.players),
  setCaptain:     (teamId, playerId) => api.put(`/api/teams/${teamId}/players/${playerId}/set-captain`).then(r => r.data),
  toggleSuspend:  (teamId, playerId) => api.put(`/api/teams/${teamId}/players/${playerId}/toggle-suspend`).then(r => r.data),
};

export const playerService = {
  getAll:        ()         => api.get('/api/players').then(r => r.data.players),
  getById:       (id)       => api.get(`/api/players/${id}`).then(r => r.data.player),
  getTopScorers: (limit=10) => api.get('/api/players/top-scorers', { params:{limit} }).then(r => r.data.scorers),
  getInvite:     (token)    => api.get(`/api/players/invite/${token}`).then(r => r.data.player),
  submitInvite:  (token, d) => api.post(`/api/players/invite/${token}`, d).then(r => r.data),
};

export const paymentService = {
  getStatus:   ()      => api.get('/api/payment/status').then(r => r.data.payment),
  uploadProof: (form)  => api.post('/api/payment/upload-proof', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
};

export const refereeService = {
  getAll:  ()       => api.get('/api/referees').then(r => r.data.referees),
  create:  (data)   => api.post('/api/referees', data).then(r => r.data.referee),
  update:  (id,d)   => api.put(`/api/referees/${id}`, d).then(r => r.data.referee),
  remove:  (id)     => api.delete(`/api/referees/${id}`).then(r => r.data),
};

export const sponsorService = {
  getAll:  ()       => api.get('/api/sponsors/all').then(r => r.data.sponsors),
  create:  (data)   => api.post('/api/sponsors', data).then(r => r.data.sponsor),
  update:  (id,d)   => api.put(`/api/sponsors/${id}`, d).then(r => r.data.sponsor),
  remove:  (id)     => api.delete(`/api/sponsors/${id}`).then(r => r.data),
};

export const groupService = {
  generateSchedules: () => api.post('/api/groups/generate-schedules').then(r => r.data),
};

export const drawService = {
  getState:  ()                    => api.get('/api/draw').then(r => r.data),
  init:      ()                    => api.post('/api/draw/init').then(r => r.data),
  assign:    (teamId, groupLetter) => api.put('/api/draw/assign', { teamId, groupLetter }).then(r => r.data),
  unassign:  (teamId)              => api.put('/api/draw/assign', { teamId, groupLetter: null }).then(r => r.data),
  finalize:  ()                    => api.post('/api/draw/finalize').then(r => r.data),
  reset:     ()                    => api.post('/api/draw/reset').then(r => r.data),
};

export const postService = {
  getPublished: (limit = 6) => api.get('/api/posts', { params: { limit } }).then(r => r.data.posts),
  getById:      (id)         => api.get(`/api/posts/${id}`).then(r => r.data.post),
  getAll:       ()           => api.get('/api/posts/all').then(r => r.data.posts),
  create:       (form)       => api.post('/api/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.post),
  update:       (id, form)   => api.put(`/api/posts/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.post),
  remove:       (id)         => api.delete(`/api/posts/${id}`).then(r => r.data),
};

export const adminService = {
  getDashboard:        ()       => api.get('/api/admin/dashboard').then(r => r.data.stats),
  getPending:          ()       => api.get('/api/admin/teams/pending').then(r => r.data.teams),
  getAllTeams:          ()       => api.get('/api/admin/teams').then(r => r.data.teams),
  approveTeam:         (id)     => api.put(`/api/admin/teams/${id}/approve`).then(r => r.data),
  rejectTeam:          (id)     => api.put(`/api/admin/teams/${id}/reject`).then(r => r.data),
  confirmPayment:      (id)     => api.put(`/api/admin/teams/${id}/payment`).then(r => r.data),
  getAllPlayers:        (params) => api.get('/api/admin/players', { params }).then(r => r.data.players),
  validatePlayer:      (id)     => api.put(`/api/admin/players/${id}/validate`).then(r => r.data),
  suspendPlayer:       (id)     => api.put(`/api/admin/players/${id}/suspend`).then(r => r.data),
  addFine:             (data)   => api.post('/api/admin/fines', data).then(r => r.data),
  getTournament:       ()       => api.get('/api/admin/tournament').then(r => r.data.tournament),
  updateTournament:    (data)   => api.put('/api/admin/tournament', data).then(r => r.data.tournament),
  getReports:          ()       => api.get('/api/admin/reports').then(r => r.data),
  generateKnockout:    ()       => api.post('/api/knockout/generate').then(r => r.data),
  getBracket:          ()       => api.get('/api/knockout/bracket').then(r => r.data.bracket),
};
