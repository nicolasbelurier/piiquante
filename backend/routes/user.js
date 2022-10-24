const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

// Création des différentes routes de l'api en précisant l'ordre des middlewares
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;