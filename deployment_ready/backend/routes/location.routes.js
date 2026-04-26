const express = require('express');
const { getReverseGeocode } = require('../controllers/location.controller');

const router = express.Router();

router.get('/reverse-geocode', getReverseGeocode);

module.exports = router;
