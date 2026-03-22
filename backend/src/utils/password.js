const bcrypt = require('bcrypt');

const hashPassword = async (plain) => bcrypt.hash(plain, 12);
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
