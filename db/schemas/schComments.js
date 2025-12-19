// Backend/db/schemas/schComments.js
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'comments',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        field: 'id',
      },
      postId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'post_id',
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
      parentId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'parent_id',
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'text',
      },
      likes: {
        type: DataTypes.BIGINT.UNSIGNED, // store array of userIds or count
        allowNull: true,
        field: 'likes',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      tableName: 'comments',
      timestamps: true,
      paranoid: true, // enables soft delete
      deletedAt: 'deleted_at',
    }
  );

  Model.prototype.toJSON = function () {
    const attributes = Object.assign({}, this.get());
    return attributes;
  };

  return Model;
};
