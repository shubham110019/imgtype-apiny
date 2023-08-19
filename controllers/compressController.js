const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');
const formatBytes = require('../utils/helpers').formatBytes;

async function compressImages(req, res) {
    try {
        const compressionResults = [];

        for (const file of req.files) {
          const inputBuffer = file.buffer;
          const originalSize = inputBuffer.length;
    
          const quality = parseInt(req.body.quality) || 80; // Quality parameter (default: 80)
    
          const startTime = Date.now();
    
          const format = file.originalname.split('.').pop().toLowerCase(); // Get the desired format from the request body, default to jpeg
    
          const compressedImageBuffer = await sharp(inputBuffer)
            .toFormat(format)
            .jpeg({ quality }) // Always convert to JPEG format before compressing
            .toBuffer();
    
          const endTime = Date.now();
          const compressionTime = endTime - startTime;
    
          const newImageSize = compressedImageBuffer.length;
    
          const renderedImage = await sharp(compressedImageBuffer)
            .toBuffer();
          const renderedImageMetadata = await sharp(renderedImage).metadata();
          const renderedSize = `${renderedImageMetadata.width}x${renderedImageMetadata.height}`;
          const imageHeight = `${renderedImageMetadata.height}px`;
          const imageWidth = `${renderedImageMetadata.width}px`;
    
          const compressionPercentage = ((originalSize - newImageSize) / originalSize) * 100;
    
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
    
          const compressionResult = {
            originalSize: formatBytes(originalSize),
            newImageSize: formatBytes(newImageSize),
            quality,
            compressionTime,
            renderedSize,
            imageHeight,
            imageWidth,
            fileName: file.originalname,
            imageName,
            downloadLink: `data:image/${format};base64,${compressedImageBuffer.toString('base64')}`,
            format, // Store the format for reference
            oldFormat: file.originalname.split('.').pop().toLowerCase(),
            compressionPercentage: compressionPercentage.toFixed(2) + '%',
            lastModifiedDate
          };
    
          compressionResults.push(compressionResult);
        }
    
        const responseObject = { compress: compressionResults };
        res.json(responseObject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred during conversion' });
    }
  }




module.exports = { compressImages };
