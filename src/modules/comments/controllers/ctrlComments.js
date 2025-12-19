const commentService = require('../services/srvcComments');

exports.add = async (req, res, next) => {
  console.log('Request get here ', req.body);
  try {
    const { postId, text, parentId } = req.body;
    const userId = req.user.userId;
    const [comment, err] = await commentService.create({ postId, userId, text, parentId });
    if (err) return next(err);
    // TODO: Notify mentioned users if needed
    return next({ comment });
  } catch (error) {
    return next(error);
  }
};

exports.getByPost = async (req, res, next) => {
  try {
    const { postId } = req.body;
    const [comments, err] = await commentService.getByPost(postId);
    if (err) return next(err);
    return next({ comments });
  } catch (error) {
    return next(error);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const { commentId } = req.body;
    const { text } = req.body;
    const userId = req.user.userId;
    const [comment, err] = await commentService.edit({ commentId, userId, text });
    if (err) return next(err);
    return next({ comment });
  } catch (error) {
    return next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { commentId } = req.body;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const [_result, err] = await commentService.delete({ commentId, userId, isAdmin });
    if (err) return next(err);
    return next({ success: true });
  } catch (error) {
    return next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const { commentId } = req.body;
    const userId = req.user.id;
    const [comment, err] = await commentService.toggleLike({ commentId, userId });
    if (err) return next(err);
    return next({ comment });
  } catch (error) {
    return next(error);
  }
};
