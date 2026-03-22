const { query } = require('../config/db');

const getStats = async () => {
  const users = await query('SELECT COUNT(*)::int AS count FROM users WHERE is_active = TRUE', []);
  const staff = await query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'staff' AND is_active = TRUE", []);
  const appts = await query('SELECT COUNT(*)::int AS count FROM appointments', []);
  const completed = await query("SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'completed'", []);
  const works = await query('SELECT COUNT(*)::int AS count FROM completed_works', []);
  const staffProfiles = await query('SELECT COUNT(*)::int AS count FROM staff_profiles WHERE is_active = TRUE', []);

  return {
    activeUsers: users.rows[0].count,
    activeStaff: staff.rows[0].count,
    totalAppointments: appts.rows[0].count,
    completedAppointments: completed.rows[0].count,
    uploadedWorks: works.rows[0].count,
    activeStaffProfiles: staffProfiles.rows[0].count
  };
};

module.exports = { getStats };
