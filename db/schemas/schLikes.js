module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'likes',
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
      targetId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'target_id',
      },
      targetType: {
        type: DataTypes.ENUM('post', 'comment'),
        allowNull: false,
        field: 'target_type',
      },
    },
    {
      tableName: 'likes',
      timestamps: true,
    }
  );

  return Model;
};
