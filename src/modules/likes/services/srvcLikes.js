const sequelize = require('../../../../db/sequelize/sequelize');

exports.toggleLike = async ({ userId, targetId, targetType }) => {
  try {
    console.log('toggleLike called with:', { userId, targetId, targetType });

    // Use Sequelize model directly instead of wrapper
    const Like = sequelize.models.likes;

    // Check if like already exists
    const existing = await Like.findOne({
      where: { userId, targetId: Number(targetId), targetType }
    });

    console.log('Existing like found:', existing?.toJSON?.() || existing);

    if (existing) {
      await existing.destroy();

      // Decrement likes count on the target
      if (targetType === 'post') {
        await sequelize.models.posts.decrement('likesCount', { where: { id: targetId } });
      }

      console.log('Like removed');
      return [false, null]; // Unliked
    } else {
      // Create new like using model directly
      const newLike = await Like.create({
        userId,
        targetId: Number(targetId),
        targetType
      });
      console.log('Created new like:', newLike?.toJSON?.() || newLike);

      // Increment likes count on the target
      if (targetType === 'post') {
        await sequelize.models.posts.increment('likesCount', { where: { id: targetId } });
        console.log('Incremented likesCount for post:', targetId);
      }

      return [true, null]; // Liked
    }
  } catch (error) {
    console.error('toggleLike error:', error);
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
    console.log('getLikesByTarget called with:', { targetId, targetType, targetIdType: typeof targetId });

    const likes = await sequelize.models.likes.findAll({
      where: { targetId: Number(targetId), targetType },
      include: [
        {
          model: sequelize.models.users,
          as: 'user',
          attributes: ['id', 'name', 'profileImage'],
        },
      ],
    });

    console.log('Found likes:', likes.length, likes.map(l => l.toJSON?.() || l));
    return [likes, null];
  } catch (error) {
    console.error('getLikesByTarget error:', error);
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
