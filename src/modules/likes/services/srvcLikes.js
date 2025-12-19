const sequelize = require('../../../../db/sequelize/sequelize');

exports.toggleLike = async ({ userId, targetId, targetType }) => {
  try {
    const instance = new sequelize.db(sequelize.models.likes);
    const [existing] = await instance.findOne({ where: { userId, targetId, targetType } });
    if (existing) {
      await existing.destroy();
      return [false, null]; // Unliked
    } else {
      const [_like, error] = await instance.create({ userId, targetId, targetType });
      if (error) return [null, error];
      return [true, null]; // Liked
    }
  } catch (error) {
    return [null, error];
  }
};

exports.countLikes = async ({ targetId, targetType }) => {
  try {
    const count = await sequelize.models.likes.count({ where: { targetId, targetType } });
    return [count, null];
  } catch (error) {
    return [null, error];
  }
};

exports.getLikesByTarget = async ({ targetId, targetType }) => {
  try {
    const likes = await sequelize.models.likes.findAll({
      where: { targetId, targetType },
      include: [
        {
          model: sequelize.models.users,
          as: 'user',
          attributes: ['id', 'name', 'profileImage'],
        },
      ],
    });
    return [likes, null];
  } catch (error) {
    return [null, error];
  }
};

exports.getLikesByUser = async ({ userId }) => {
  try {
    const likes = await sequelize.models.likes.findAll({ where: { userId } });
    return [likes, null];
  } catch (error) {
    return [null, error];
  }
};

exports.checkUserLike = async ({ userId, targetId, targetType }) => {
  try {
    const like = await sequelize.models.likes.findOne({ where: { userId, targetId, targetType } });
    return [!!like, null];
  } catch (error) {
    return [null, error];
  }
};
