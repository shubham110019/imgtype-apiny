// routes/convert.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { checkAuthKey } = require('../utils/helpers');

const upload = multer({ storage: multer.memoryStorage() });
const { compressImages } = require('../controllers/compressController.js');

router.post('/', checkAuthKey, upload.array('image', 50), compressImages);

module.exports = router;
