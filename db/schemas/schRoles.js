const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  const Role = sequelize.define(
    'roles',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.ENUM('superadmin', 'admin', 'user'),
        defaultValue: 'user',
      },
    },
    {
      tableName: 'roles',
      scopes: {
        isAdmin: {
          where: { name: 'admin' },
        },
        isSuperAdmin: {
          where: { name: 'superadmin' },
        },
        isUser: {
          where: { name: 'user' },
        },
      },
    }
  );

  return Role;
};
