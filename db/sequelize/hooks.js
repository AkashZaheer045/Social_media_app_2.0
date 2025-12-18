//--//
let dbInstance = require('./instance');
//--//

const toLowerCase = function (str) {
    return String(str).toLowerCase();
};


//--//
module.exports = function (db) {
    //--//

    db.users.addHook("beforeCreate", function (instance) {
        if (instance.changed("password")) {
            instance.hashPassword();
            instance.hashConfirmPassword();
        }
    });

    db.users.addHook("beforeUpdate", function (instance) {
        if (instance.changed("password")) {
            instance.hashPassword();
            instance.hashConfirmPassword();
        }
    });

    db.authorizations.addHook("beforeCreate", function (instance) {
        instance.generateAccessToken();
        instance.generatePasswordToken();
    });


    db.temp_tokens.addHook("beforeCreate", function (instance) {
        instance.generateAccessToken();
    });

    // Hooks for roles
    db.roles.addHook('beforeCreate', (role, options) => {
        if (role.name === 'superadmin') {
            throw new Error('Cannot create superadmin role via API.');
        }
    });
    db.roles.addHook("afterCreate", function (role) {
        console.log(`Role created: ${role.name}`);
    });
    db.roles.addHook("afterUpdate", function (role) {
        console.log(`Role updated: ${role.name}`);
    });
    db.roles.addHook("afterDestroy", function (role) {
        console.log(`Role deleted: ${role.name}`);
    });
};
