const sequelize = require('../../../../db/sequelize/sequelize');

exports.create = async ({ postId, userId, text, parentId }) => {
  try {
    const instance = new sequelize.db(sequelize.models.comments);
    const [comment, error] = await instance.create({ postId, userId, text, parentId });
    if (error) return [null, error];

    // Increment commentCount ONLY if it's a top-level comment
    if (!parentId) {
      const Post = sequelize.models.posts;
      await Post.increment('commentsCount', { where: { id: postId } });
    }

    return [comment, null];
  } catch (error) {
    return [null, error];
  }
};

exports.getByPost = async (postId) => {
  try {
    const instance = new sequelize.db(sequelize.models.comments);
    const [comments, error] = await instance.findAll({
      where: { postId, parentId: null },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: sequelize.models.users,
          as: 'user',
          attributes: ['id', 'name', 'userName', 'profileImage'],
          required: false,
        },
        {
          model: sequelize.models.comments,
          as: 'replies',
          required: false,
          include: [
            {
              model: sequelize.models.users,
              as: 'user',
              attributes: ['id', 'name', 'userName', 'profileImage'],
              required: false,
            },
          ],
        },
      ],
    });
    if (error) return [null, error];
    return [comments, null];
  } catch (error) {
    return [null, error];
  }
};

exports.edit = async ({ commentId, userId, text }) => {
  try {
    const Comment = sequelize.models.comments;

    const comment = await Comment.findOne({ where: { id: commentId, userId } });

    if (!comment) return [null, new Error('Unauthorized or not found')];

    const updated = await comment.update({ text });

    return [updated, null];
  } catch (error) {
    return [null, error];
  }
};

exports.delete = async ({ commentId, userId }) => {
  try {
    const Comment = sequelize.models.comments;
    const Post = sequelize.models.posts;

    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) return [null, new Error('Not found')];

    if (String(comment.userId) !== String(userId)) {
      return [null, new Error('Unauthorized')];
    }

    await comment.destroy();

    if (!comment.parentId) {
      await Post.decrement('commentsCount', { where: { id: comment.postId } });
    }

    return [true, null];
  } catch (error) {
    return [null, error];
  }
};

exports.toggleLike = async ({ commentId, userId }) => {
  try {
    const Comment = sequelize.models.comments;
    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) return [null, new Error('Not found')];

    let likes = [];
    try {
      likes = comment.likes ? JSON.parse(comment.likes) : [];
    } catch (e) {
      likes = [];
    }

    if (likes.includes(userId)) {
      likes = likes.filter((id) => id !== userId);
    } else {
      likes.push(userId);
    }

    await comment.update({ likes: JSON.stringify(likes) });
    return [comment, null];
  } catch (error) {
    return [null, error];
  }
};
