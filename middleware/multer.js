// middleware/multer.js

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { MulterError } = require('multer');

const uploadPath = path.join(__dirname, '/uploads/');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  },
});

// Custom file filter based on fieldname
const fileFilter = (req, file, callback) => {
  let allowed = [];
  const field = file.fieldname;
  const ext = path.extname(file.originalname).toLowerCase();

  if (field === 'image' || field === 'images') {
    allowed = ['.png', '.bmp', '.ico', '.gif', '.jpg', '.jpeg', '.webp'];
  } else if (field === 'video') {
    allowed = ['.mp3', '.mp4', '.gif', '.mkv', '.flv'];
  } else if (field === 'file') {
    allowed = ['.csv', '.xlsx', '.xls', '.pdf', '.docs', '.txt'];
  } else if (field === 'document') {
    allowed = [
      '.docx',
      '.doc',
      '.odt',
      '.csv',
      '.xlsx',
      '.xls',
      '.pdf',
      '.png',
      '.bmp',
      '.ico',
      '.gif',
      '.jpg',
      '.jpeg',
    ];
  }

  if (allowed.includes(ext)) {
    req.multerFileUploadSuccess = true;
    return callback(null, true);
  } else {
    req.multerFileUploadSuccess = false;
    const error = new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
    return callback(error, false);
  }
};

// Upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
