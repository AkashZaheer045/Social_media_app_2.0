module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'intent_logs',
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
        references: {
          model: 'users',
          key: 'id',
        },
      },
      tempToken: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'temp_token',
      },
    },
    {
      tableName: 'intent_logs',
      timestamps: true,
    }
  );

  Model.prototype.toJSON = function (options) {
    const attributes = Object.assign({}, this.get());
    return attributes;
  };

  return Model;
};
