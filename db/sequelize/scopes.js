module.exports = function (db) {
  db.posts.addScope(
    'withoutPassword',
    { attributes: { exclude: ['password'] } },
    { override: true }
  );
  db.posts.addScope(
    'withMinFields',
    {
      attributes: [
        'id',
        'name',
        'email',
        'username',
        'profilePictureUrl',
        'customerNumber',
        'phoneNumber',
      ],
    },
    { override: true }
  );
};
