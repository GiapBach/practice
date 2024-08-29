const express = require('express');
const router = express.Router();
const entriesController = require('../controllers/entriesController');

router.get('/entries', entriesController.fetchEntries);

module.exports = router;
