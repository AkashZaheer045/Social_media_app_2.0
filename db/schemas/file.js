module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'file',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // content: {
      //   type: DataTypes.BLOB("long"),
      //   allowNull: false,
      // },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        field: 'user_id', // optional: if your DB column is snake_case
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at', // matches DB column
      },
    },
    {
      tableName: 'files',
      timestamps: true,
      paranoid: true, // ✅ soft delete enabled
      deletedAt: 'deleted_at',
    }
  );
};
