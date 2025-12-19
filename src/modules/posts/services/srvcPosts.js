const sequelize = require('../../../../db/sequelize/sequelize');
const Pagination = require('../../../../helpers/pagination');

/**
 * Create a new post
 */
const create = async (req) => {
  try {
    const { content, mediaUrl } = req.body;
    console.log('Creating post with content:', content, 'and mediaUrl:', mediaUrl);
    //console.log("text : ", req.user);
    const userId = req.user.userId; // Use consistent field name
    //console.log("userId : ", userId);

    const instance = new sequelize.db(sequelize.models.posts);
    const [data, error] = await instance.create({ content, mediaUrl, userId }, { req });
    if (error) return [null, error];
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Get all posts (feed)
 */
const getList = async (req) => {
  try {
    const { sort } = req.body;
    const findQuery = { where: {}, order: [['createdAt', sort || 'DESC']] };

    const pagination = new Pagination(req, findQuery);

    // Apply pagination settings
    const instance = sequelize.models.posts;
    const list = await instance.findAndCountAll(findQuery);

    pagination.setCount(list.count);
    return [{ list: list.rows, pagination }, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Get a single post by ID
 */
const getWithId = async (id) => {
  try {
    const instance = new sequelize.db(sequelize.models.posts);
    return await instance.findOne({ where: { id } });
  } catch (error) {
    return [null, error];
  }
};

/**
 * Update a post (only if owner)
 */
const update = async (req, id) => {
  try {
    const userId = req.user.id;
    const instance = new sequelize.db(sequelize.models.posts);
    const post = await instance.findOne({ where: { id } });
    if (!post || post.userId !== userId) return [null, new Error('Unauthorized')];

    await sequelize.models.posts.update(req.body, { where: { id } });
    return [true, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Delete a post (only if owner)
 */
const deleteRecord = async (id, userId) => {
  try {
    const post = await sequelize.models.posts.findOne({ where: { id } });

    if (!post || post.userId !== userId) {
      return [null, new Error('Unauthorized')];
    }

    await sequelize.models.posts.destroy({ where: { id }, individualHooks: true });

    return [true, null];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Get all posts by a user
 */
const getByUserId = async (userId) => {
  try {
    console.log('Searching for posts with userId:', userId);
    const instance = new sequelize.db(sequelize.models.posts);
    const posts = await instance.findAll({ where: { userId } });
    console.log('Found posts:', posts);
    return [posts, null];
  } catch (error) {
    console.log('Error aya ha :', error);
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
