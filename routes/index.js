// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('working');
});

router.use('/convert', require('./convert'));

router.use('/compress', require('./compress'));

module.exports = router;