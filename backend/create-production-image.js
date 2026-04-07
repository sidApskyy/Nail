const fs = require('fs');
const path = require('path');

// Create test image on production server
const createProductionImage = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadsDir);
  }
  
  // Create a simple 1x1 pixel PNG (base64 decoded)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk start
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk start
    0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00, // Compressed data
    0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // End of IDAT
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82 // End of PNG
  ]);
  
  const imagePath = path.join(uploadsDir, '1774286972658_image00007.jpeg');
  
  // Write as JPEG (convert PNG to JPEG header)
  const jpegData = Buffer.concat([
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG signature
    Buffer.from([0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]), // JFIF header
    Buffer.from([0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00]), // JFIF info
    Buffer.from([0x00, 0x00]), // Padding
    pngData.slice(8) // Use PNG image data (simplified)
  ]);
  
  fs.writeFileSync(imagePath, jpegData);
  console.log('✅ Created production image at:', imagePath);
  
  return imagePath;
};

// Add endpoint to create image on demand
const setupCreateImageEndpoint = (app) => {
  app.get('/create-test-image', (req, res) => {
    try {
      const imagePath = createProductionImage();
      res.json({
        success: true,
        message: 'Test image created successfully',
        data: {
          imagePath,
          testUrl: '/uploads/1774286972658_image00007.jpeg'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create test image',
        error: error.message
      });
    }
  });
};

module.exports = { createProductionImage, setupCreateImageEndpoint };
