const express = require('express');
const { login, refreshToken } = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validators');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.post('/login', loginValidator, validate, login);
router.post('/refresh-token', refreshToken);

module.exports = router;
