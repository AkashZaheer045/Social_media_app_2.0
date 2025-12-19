const fileService = require('../services/srvcFiles');

// 1.Upload a file
const upload = async function (req, res, next) {
  console.log('**********************************');
  try {
    // Assume file is available at req.file (set by multer or similar middleware)
    // and user ID is available at req.user.userId
    const userId = req.user.userId;
    console.log('data of request ');
    const files = req.files;
    if (!files || files.length === 0) return next(new Error('No file uploaded'));

    const results = [];
    for (const file of files) {
      const [data, err] = await fileService.create({
        userId,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadPath: file.path,
        uploadedAt: new Date().toISOString(),
      });
      if (err) return next(err);
      results.push(data);
    }
    return res.json({ success: true, files: results });
  } catch (error) {
    return next(error);
  }
};

// //2. List all files
// const getListItems = async function (req, res, next) {
//     try {
//         let [list, err] = await fileService.getList(req);
//         if (err) return next(err);
//         return res.json(list);
//     } catch (error) {
//         return next(error);
//     }
// };

// //3. Delete a file
// const deleteRecord = async function (req, res, next) {
//     try {
//         let { fileId } = req.body;
//         let userId = req.user.userId;
//         let [result, err] = await fileService.deleteRecord(fileId, userId);
//         if (err) return next(err);
//         return res.json({ success: true, message: 'Deleted' });
//     } catch (error) {
//         return next(error);
//     }
// };

// //4. Get file by ID
// const get = async function (req, res, next) {
//     try {
//         let { fileId } = req.body;
//         let [data, err] = await fileService.getWithId(fileId);
//         if (err) return next(err);
//         if (!data) return next(new TypeError('not_exist'));
//         return res.json(data);
//     } catch (error) {
//         return next(error);
//     }
// };

// //5. Update file metadata
// const update = async function (req, res, next) {
//     try {
//         let fileId = req.body.fileId;
//         let [result, err] = await fileService.update(req, fileId);
//         if (err) return next(err);
//         return res.json({ success: true, message: 'Updated' });
//     } catch (error) {
//         return next(error);
//     }
// };

// //6. Get all files by a user
// const getUserFiles = async function (req, res, next) {
//     try {
//         let userId = req.user.userId;
//         let [files, err] = await fileService.getByUserId(userId);
//         if (err) return next(err);
//         return res.json({ files });
//     } catch (error) {
//         return next(error);
//     }
// };

module.exports = {
  upload,
  // getListItems,
  // deleteRecord,
  // get,
  // update,
  // getUserFiles,
};
