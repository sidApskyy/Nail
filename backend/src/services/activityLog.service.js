const activityRepo = require('../repositories/activityLog.repository');

const log = async ({ userId, action, entityType, entityId }) =>
  activityRepo.create({ userId, action, entityType, entityId });

const listAll = async () => activityRepo.listAll();

module.exports = { log, listAll };
