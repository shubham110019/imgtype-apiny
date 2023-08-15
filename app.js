const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

// Helper function to convert bytes to a human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Middleware to check for the presence of an authentication key
function checkAuthKey(req, res, next) {
  const authKey = req.headers['auth-key']; // Change 'auth-key' to the actual header name

  if (authKey !== '123') { // Replace 'your-secret-auth-key' with your actual auth key
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

app.post('/convert', checkAuthKey, upload.array('image', 50), async (req, res) => {
  try {

    const conversionResults = [];

    for (const file of req.files) {
      const inputBuffer = file.buffer;
      const originalSize = inputBuffer.length;

      const { format } = req.body; // Use req.body to get format parameter

      const supportedFormats = [
        '3fr', 'arw', 'avif', 'bmp', 'cr2', 'cr3', 'crw', 'dcr', 'dng', 'eps',
        'erf', 'gif', 'heic', 'heif', 'icns', 'ico', 'jfif', 'jpeg', 'jpg', 'mos',
        'mrw', 'nef', 'odd', 'odg', 'orf', 'pef', 'png', 'ppm', 'ps', 'psd', 'raf',
        'raw', 'rw2', 'tif', 'tiff', 'webp', 'x3f', 'xcf', 'xps', 'svg'
      ];

      if (!format || !supportedFormats.includes(format)) {
        return res.status(400).json({ error: 'Invalid output format' });
      }

      const startTime = Date.now();

      let imageBuffer = inputBuffer;

      if (format !== 'svg') {
        imageBuffer = await sharp(inputBuffer)
          .toFormat(format)
          .toBuffer();
      }

      const endTime = Date.now();
      const conversionTime = endTime - startTime;

      const newImageSize = imageBuffer.length;

      const imageBase64 = imageBuffer.toString('base64');
      const imageSrc = `data:image/${format};base64,${imageBase64}`;
      const downloadLink = imageSrc;

      let renderedImageSize = '';

      if (format !== 'svg') {
        const renderedImage = await sharp(imageBuffer)
          .toFormat(format)
          .toBuffer();
        const renderedImageMetadata = await sharp(renderedImage).metadata();
        renderedImageSize = `${renderedImageMetadata.width}x${renderedImageMetadata.height}`;
        imageHeight = `${renderedImageMetadata.height}px`;
        imageWidth = `${renderedImageMetadata.width}px`;
      } else {
        const svgMetadata = await sharp(inputBuffer).metadata();
        renderedImageSize = `${svgMetadata.width}x${svgMetadata.height}`;
        imageHeight = `${svgMetadata.height}px`;
        imageWidth = `${svgMetadata.width}px`;
      }

      const conversionResult = {
        originalSize: formatBytes(originalSize),
        newImageSize: formatBytes(newImageSize),
        renderedSize: renderedImageSize,
        imageHeight,
        imageWidth,
        conversionTime,
        downloadLink,
        format,
        imageSrc,
        oldFormat: file.originalname.split('.').pop().toLowerCase()
      };

      conversionResults.push(conversionResult);
      
    }

    const responseObject = { convert: conversionResults };
    // Send the entire conversionResults array as the response
    res.json(responseObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during conversion' });
  }
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
