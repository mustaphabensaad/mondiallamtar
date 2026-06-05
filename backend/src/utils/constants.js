const ROLES = {
  CAPTAIN: 'captain',
  ADMIN:   'admin',
};

const TEAM_STATUS = {
  PENDING:       'pending',
  APPROVED:      'approved',
  REJECTED:      'rejected',
  DISQUALIFIED:  'disqualified',
};

const PAYMENT_STATUS = {
  UNPAID:         'unpaid',
  PENDING_REVIEW: 'pending_review',
  PAID:           'paid',
};

const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE:      'live',
  FINISHED:  'finished',
  CANCELLED: 'cancelled',
};

const TOURNAMENT_STATUS = {
  REGISTRATION: 'registration',
  GROUP_STAGE:  'group_stage',
  KNOCKOUT:     'knockout',
  FINISHED:     'finished',
};

module.exports = { ROLES, TEAM_STATUS, PAYMENT_STATUS, MATCH_STATUS, TOURNAMENT_STATUS };
