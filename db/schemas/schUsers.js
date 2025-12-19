const crypto = require('crypto');
module.exports = function (sequelize, DataTypes) {
  const isUnique = function (field) {
    return function (value, next) {
      const Model = sequelize.models.users;
      const query = {};
      query[field] = value;
      Model.findOne({
        where: query,
        attributes: ['id'],
      }).then((obj) => {
        if (obj && obj.id) {
          next(field + ": '" + value + "' is already taken");
        } else {
          next();
        }
      });
    };
  };
  const Model = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        field: 'id',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '', // or remove defaultValue and always provide a name
        field: 'name',
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_image',
      },
      email: {
        type: DataTypes.STRING,
        unique: { args: true },
        allowNull: false,
        defaultValue: '',
        validate: {
          isEmail: true,
          isUnique: isUnique('email'),
        },
        field: 'email',
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'user_name',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'phone',
      },

      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified',
      },

      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'stripe_customer_id',
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'passWord',
      },
      confirmPassword: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1, // or 0, as you prefer
        field: 'active',
      },
      userrole_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 3, // Assuming 3 is the ID for 'user'
        field: 'userrole_id',
        references: {
          model: 'roles',
          key: 'id',
        },
      },
    },
    {
      tableName: 'users',
      validate: {
        bothPasswordsEquals: function () {
          if (this.changed('password')) {
            if (this.password !== this.confirmPassword) {
              throw Error('Password and Confirm Password should be equal');
            }
          }
        },
      },
    }
  );

  //--//
  Model.prototype.toJSON = function (options) {
    const attributes = Object.assign({}, this.get());
    delete attributes.password;
    delete attributes.confirmPassword;
    return attributes;
  };

  Model.prototype.hashPassword = function () {
    if (this.password) {
      this.password = crypto.createHash('sha1').update(this.password).digest('hex');
    }
  };
  Model.prototype.hashConfirmPassword = function () {
    if (this.confirmPassword) {
      this.confirmPassword = crypto.createHash('sha1').update(this.confirmPassword).digest('hex');
    }
  };
  Model.prototype.validatePassword = function (password) {
    password = String(password).trim();
    const passwordHash = crypto.createHash('sha1').update(password).digest('hex');
    const hashedPassword = String(this.password).trim();
    return passwordHash === hashedPassword;
  };
  return Model;
};
