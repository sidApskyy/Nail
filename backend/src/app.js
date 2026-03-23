const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');

const { env } = require('./config/env');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(
  cors({
    origin: env.security.corsOrigin,
    credentials: true
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure uploads directory exists and serve files statically
const fs = require('fs');
const uploadsPath = path.join(process.cwd(), env.uploads.dir);

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  console.log('Creating uploads directory:', uploadsPath);
  fs.mkdirSync(uploadsPath, { recursive: true });
} else {
  console.log('Uploads directory exists:', uploadsPath);
}

// Serve uploaded files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cache-Control', 'public, max-age=86400');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static(uploadsPath));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK', data: null });
});

// Direct test image route
app.get('/test-image', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const imagePath = path.join(uploadsPath, '1774286972658_image00007.jpeg');
  
  if (fs.existsSync(imagePath)) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cache-Control', 'public, max-age=86400');
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Test image not found',
      data: { 
        imagePath,
        uploadsPath,
        directoryExists: fs.existsSync(uploadsPath)
      }
    });
  }
});

app.get('/debug/uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsPath = path.join(process.cwd(), env.uploads.dir);
  
  // Check if directory exists
  if (!fs.existsSync(uploadsPath)) {
    return res.status(404).json({ 
      success: false, 
      message: 'Uploads directory does not exist',
      data: {
        uploadsPath,
        suggestion: 'Directory will be created when first file is uploaded'
      }
    });
  }
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({ 
      success: true, 
      message: 'Uploads directory debug info',
      data: {
        uploadsPath,
        files: files.slice(0, 10), // Show first 10 files
        totalFiles: files.length,
        directoryExists: true
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error reading uploads directory',
      error: error.message,
      data: {
        uploadsPath,
        directoryExists: fs.existsSync(uploadsPath)
      }
    });
  }
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
