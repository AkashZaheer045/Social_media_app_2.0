'use strict';
// Get dependencies
const multer = require('multer');
const path = require('path');
const mime = require('mime-types');
const { MulterError } = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '/../uploads/');
    },
    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() +
          '_' +
          Math.random().toString(36).substring(2) +
          '.' +
          mime.extension(file.mimetype)
      );
    },
  }),
  fileFilter: function (req, files, callback, next) {
    let outOfScopeExt = false;
    let allowed = [];
    const type = files.fieldname;
    console.log('**********************************');
    console.log('files:', files);
    if (type && (type === 'image' || type === 'images')) {
      allowed = ['.png', '.bmp', '.ico', '.gif', '.jpg', '.jpeg'];
    } else if (type && type === 'video') {
      allowed = ['.mp3', '.mp4', '.gif', '.mkv', '.flv'];
    } else if (type && type === 'file') {
      allowed = ['.csv', '.xlsx', '.xls', '.pdf'];
    } else if (type && type === 'document') {
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

    const ext = String(path.extname(files.originalname)).trim().toLowerCase();
    console.log('ext', ext);
    if (allowed.toString().indexOf(ext) > -1) {
      console.log('allowed:', allowed);
      if (outOfScopeExt) {
        req.multerFileUploadSuccess = false;
      } else {
        req.multerFileUploadSuccess = true;
      }
      callback(null, true);
    } else {
      console.log('allowed::', allowed);
      outOfScopeExt = true;
      req.multerFileUploadSuccess = false;
      const err = new MulterError('file_format_error');
      return callback(err, false);
    }
  },
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

module.exports = {
  upload,
};
