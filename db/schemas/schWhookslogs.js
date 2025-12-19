module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'whooks_logs',
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
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'event_type',
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'payload',
      },
    },
    {
      tableName: 'whooks_logs',
      timestamps: true,
    }
  );

  Model.prototype.toJSON = function (options) {
    const attributes = Object.assign({}, this.get());
    return attributes;
  };

  return Model;
};
