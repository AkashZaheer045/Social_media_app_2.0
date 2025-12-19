module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    'subscriptions',
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
      stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'stripe_subscription_id',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'status',
      },
      currentPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'current_period_end',
      },
    },
    {
      tableName: 'subscriptions',
      timestamps: true,
    }
  );

  Model.prototype.toJSON = function (options) {
    const attributes = Object.assign({}, this.get());
    return attributes;
  };

  return Model;
};
