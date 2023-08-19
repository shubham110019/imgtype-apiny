const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');
const formatBytes = require('../utils/helpers').formatBytes;

async function convertImages(req, res) {
    try {
        const conversionResults = [];
        const alyErrors = [];
        let maxImageUploadErrorShown = false;
    
        const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 5MB in bytes
        const MAX_IMAGES = 10;
    
        for (const file of req.files) {
          const inputBuffer = file.buffer;
          const originalSize = inputBuffer.length;
    
          const { format } = req.body; // Use req.body to get format parameter
    
          console.log(originalSize);
    
          if (originalSize > MAX_IMAGE_SIZE) {
            alyErrors.push({
              error: `${file.originalname} this image size is more than 4mb`,
            });
            continue; // Skip to the next file
          }
    
          if (req.files.length > MAX_IMAGES) {
            alyErrors.push({
              error: `max image upload 10`,
            });
            maxImageUploadErrorShown = true; // Set the flag to true to prevent showing the error again
            break; // Break out of the loop
          }
    
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
    
          const originalFilename = file.originalname;
          const imageName = originalFilename.split('.').slice(0, -1).join('.');
    
           // Create a temporary file to access its path
      const tempFilePath = path.join(os.tmpdir(), file.originalname);
      fs.writeFileSync(tempFilePath, file.buffer);
    
      // Get the last modified date of the temporary file
      const fileStats = fs.statSync(tempFilePath);
      const lastModifiedDate = fileStats.mtime;
    
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
    
          const conversionResult = {
            originalSize: formatBytes(originalSize),
            newImageSize: formatBytes(newImageSize),
            renderedSize: renderedImageSize,
            imageHeight,
            imageName,
            imageWidth,
            conversionTime,
            downloadLink,
            format,
            imageSrc,
            fileName: file.originalname, 
            oldFormat: file.originalname.split('.').pop().toLowerCase(),
            lastModifiedDate,
          };
    
          conversionResults.push(conversionResult);
          
        }
    
        const responseObject = { convert: conversionResults,
          errors: alyErrors
         };
        // Send the entire conversionResults array as the response
        res.json(responseObject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred during conversion' });
    }
  }




module.exports = { convertImages };
