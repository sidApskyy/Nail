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

// Serve uploaded files statically
const uploadsPath = path.join(process.cwd(), env.uploads.dir);
console.log('Serving uploads from:', uploadsPath);

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  }
}));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK', data: null });
});

app.get('/debug/uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsPath = path.join(process.cwd(), env.uploads.dir);
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({ 
      success: true, 
      message: 'Uploads directory debug info',
      data: {
        uploadsPath,
        files: files.slice(0, 10), // Show first 10 files
        totalFiles: files.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error reading uploads directory',
      error: error.message 
    });
  }
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
