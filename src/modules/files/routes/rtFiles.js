const express = require('express');
const fileController = require('../controllers/ctrlFiles');
const upload = require('../../../../middleware/multer');
const router = express.Router();
// 1. Upload a file
router.post('/upload', upload.array('file', 2), fileController.upload);

// // 2. Update a file (only if owner)
// router.post("/update", fileController.update);

// // 3. List all files
// router.post("/list", fileController.getListItems);

// // 4. Get a single file by ID
// router.post("/get", fileController.get);

// // 5. Delete a file (only if owner)
// router.post("/soft-delete", fileController.deleteRecord);

// // 6. Get all files by a user
// router.post("/user-files", fileController.getUserFiles);

module.exports = router;
