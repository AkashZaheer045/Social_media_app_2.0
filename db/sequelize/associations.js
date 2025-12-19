module.exports = function (db) {
  // One user can have many files
  db.users.hasMany(db.file, { foreignKey: 'userId', as: 'files' });

  // Each file belongs to one user
  db.file.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });

  // One user can have many posts
  db.users.hasMany(db.posts, { foreignKey: 'userId', as: 'posts' });

  // Each post belongs to one user
  db.posts.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });

  // Post <-> Comments
  db.posts.hasMany(db.comments, { foreignKey: 'postId', as: 'comments' });
  db.comments.belongsTo(db.posts, { foreignKey: 'postId', as: 'post' });

  // User <-> Comments
  db.users.hasMany(db.comments, { foreignKey: 'userId', as: 'comments' });
  db.comments.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });

  // Comment <-> Replies (self-association)
  db.comments.hasMany(db.comments, {
    foreignKey: 'parentId',
    as: 'replies',
  });
  db.comments.belongsTo(db.comments, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  db.users.belongsTo(db.roles, {
    foreignKey: 'userrole_id',
    as: 'role',
  });
  db.roles.hasMany(db.users, {
    foreignKey: 'userrole_id',
    as: 'users',
  });

  // // One user can have many likes
  // db.users.hasMany(db.likes, { foreignKey: "userId", as: "likes" });

  // // Each like belongs to one user
  // db.likes.belongsTo(db.users, { foreignKey: "userId", as: "user" });

  // // One post can have many likes
  // db.posts.hasMany(db.likes, { foreignKey: "postId", as: "likes" });

  // // Each like belongs to one post
  // db.likes.belongsTo(db.posts, { foreignKey: "postId", as: "post" });
};
