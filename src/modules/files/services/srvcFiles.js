const sequelize = require('../../../../db/sequelize/sequelize');
const Pagination = require('../../../../helpers/pagination');

/**
 * Create a new file record
 */
const create = async (fileData) => {
  try {
    // fileData: { userId, originalName, fileName, mimeType, size, uploadPath, uploadedAt }
    const instance = new sequelize.db(sequelize.models.file);
    const [data, error] = await instance.create(fileData);
    if (error) return [null, error];
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Get all files (with pagination)
 */
const getList = async (req) => {
  try {
    const { sort } = req.body;
    const findQuery = { where: {}, order: [['createdAt', sort || 'DESC']] };
    const pagination = new Pagination(req, findQuery);
    const instance = sequelize.models.files;
    const list = await instance.findAndCountAll(findQuery);
    pagination.setCount(list.count);
    return [{ list: list.rows, pagination }, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Get a single file by ID
 */
const getWithId = async (id) => {
  try {
    const instance = new sequelize.db(sequelize.models.files);
    return await instance.findOne({ where: { id } });
  } catch (error) {
    return [null, error];
  }
};

/**
 * Update a file record (only if owner)
 */
const update = async (req, id) => {
  try {
    const userId = req.user.userId;
    const instance = new sequelize.db(sequelize.models.files);
    const file = await instance.findOne({ where: { id } });
    if (!file || file.userId !== userId) return [null, new Error('Unauthorized')];
    await sequelize.models.files.update(req.body, { where: { id } });
    return [true, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Delete a file record (only if owner)
 */
const deleteRecord = async (id, userId) => {
  try {
    const file = await sequelize.models.files.findOne({ where: { id } });
    if (!file || file.userId !== userId) {
      return [null, new Error('Unauthorized')];
    }
    await sequelize.models.files.destroy({ where: { id }, individualHooks: true });
    return [true, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Get all files by a user
 */
const getByUserId = async (userId) => {
  try {
    const instance = new sequelize.db(sequelize.models.files);
    const files = await instance.findAll({ where: { userId } });
    return [files, null];
  } catch (error) {
    return [null, error];
  }
};

module.exports = {
  create,
  getList,
  getWithId,
  update,
  deleteRecord,
  getByUserId,
};
