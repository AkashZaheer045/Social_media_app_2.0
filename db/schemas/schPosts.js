module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'posts',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        field: 'id',
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'content',
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'media_url',
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
        field: 'visibility',
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        field: 'tags',
      },
      likesCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'likes_count',
      },
      commentsCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'comments_count',
      },
    },
    {
      tableName: 'posts',
    }
  );

  Model.prototype.toJSON = function () {
    const attributes = Object.assign({}, this.get());
    return attributes;
  };

  return Model;
};
