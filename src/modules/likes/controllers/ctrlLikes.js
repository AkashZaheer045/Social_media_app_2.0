const likeService = require('../services/srvcLikes');

exports.toggleLike = async (req, res, next) => {
  try {
    const { targetId, targetType } = req.body; // targetType: 'post' or 'comment'
    const userId = req.user.userId;
    const [liked, err] = await likeService.toggleLike({ userId, targetId, targetType });
    if (err) return next(err);
    return next({ liked });
  } catch (error) {
    return next(error);
  }
};

exports.toggleComment = async (req, res, next) => {
  try {
    const { commentId } = req.body;
    const userId = req.user.userId;
    const [liked, err] = await likeService.toggleLike({
      userId,
      targetId: commentId,
      targetType: 'comment',
    });
    if (err) return next(err);
    return next({ liked });
  } catch (error) {
    return next(error);
  }
};

exports.getByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const [likes, err] = await likeService.getLikesByTarget({
      targetId: postId,
      targetType: 'post',
    });
    if (err) return next(err);
    return next({ likes });
  } catch (error) {
    return next(error);
  }
};

exports.getByComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const [likes, err] = await likeService.getLikesByTarget({
      targetId: commentId,
      targetType: 'comment',
    });
    if (err) return next(err);
    return next({ likes });
  } catch (error) {
    return next(error);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const [likes, err] = await likeService.getLikesByUser({ userId });
    if (err) return next(err);
    return next({ likes });
  } catch (error) {
    return next(error);
  }
};

exports.getByUserAndPost = async (req, res, next) => {
  try {
    const { userId, postId } = req.params;
    const [liked, err] = await likeService.checkUserLike({
      userId,
      targetId: postId,
      targetType: 'post',
    });
    if (err) return next(err);
    return next({ liked });
  } catch (error) {
    return next(error);
  }
};

exports.getByUserAndComment = async (req, res, next) => {
  try {
    const { userId, commentId } = req.params;
    const [liked, err] = await likeService.checkUserLike({
      userId,
      targetId: commentId,
      targetType: 'comment',
    });
    if (err) return next(err);
    return next({ liked });
  } catch (error) {
    return next(error);
  }
};

exports.countLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const [count, err] = await likeService.countLikes({ targetId: postId, targetType: 'post' });
    if (err) return next(err);
    return next({ count });
  } catch (error) {
    return next(error);
  }
};
