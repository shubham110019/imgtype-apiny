// routes/convert.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { checkAuthKey } = require('../utils/helpers');

const upload = multer({ storage: multer.memoryStorage() });
const { convertImages } = require('../controllers/convertController');

router.post('/', checkAuthKey, upload.array('image', 50), convertImages);

module.exports = router;
