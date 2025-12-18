
const sequelize = require('../../../../db/sequelize/sequelize');
const constants = require("./../../../../config/constants.json");
const keys_length = constants.keys_length;
const base_encoder = require('eb-butler-utils');
const { Op } = require('sequelize')
/* DB Instances */


/**
 * 
 * @param {*} data contains all user data which will ne inserted in db
 * @returns inserted record
 */
const create = async (data) => {
    try {
        let userInstance = new sequelize.db(sequelize.models.users);

        return await userInstance.create(data);
    }
    catch (error) { return (error); }
}
const updateUser = async (user, updateData, omitNull = true) => {
    try {
        let userInstance = new sequelize.db(sequelize.models.users);

        userInstance.model = user
        if (omitNull)
            return await userInstance.update(updateData);
        else
            return await userInstance.update(updateData, {
                omitNull: false
            });
    }
    catch (error) { return (error); }
}


/**
 * 
 * @param {*} email to find in db   
 * @returns user if record exist else null
 */
const getUserWithEmail = async (email) => {
    try {
        let userInstance = new sequelize.db(sequelize.models.users);

        return await userInstance.findOne({ where: { email: email } });
    } catch { }
}

// Find user by ID
const findUserById = async (id) => {
    const userInstance = new sequelize.db(sequelize.models.users);
    const [user, err] = await userInstance.findOne({ where: { id } });
    if (err) throw err;
    return user;
}

// Find user by ID with role information included
const findUserWithRoleById = async (id) => {
    try {
        const user = await sequelize.models.users.findOne({
            where: { id },
            attributes: { exclude: ['password', 'confirmPassword'] },
            include: [{
                model: sequelize.models.roles,
                as: 'role',
                attributes: ['id', 'name']
            }]
        });
        return user;
    } catch (error) {
        throw error;
    }
}

/**
 * 
 * @param {*} user_id auto generated unique user id to find record
 * @param {*} req 
 * @returns it return null if no record found and row if record found and also a error object
 */
const checkAuthorization = async function (userId, req) {
    try {
        const authorizationsKeysInstance = new sequelize.db(sequelize.models.authorizations);

        return await authorizationsKeysInstance.findOne({
            where: {
                userId: userId,
                deviceType: req.body.deviceType ? req.body.deviceType : null,
                deviceToken: req.body.deviceToken ? req.body.deviceToken : null,
            }
        });
    }
    catch (error) { return [undefined, error]; }
};
const checkResetToken = async function (token) {
    try {
        let userInstance = new sequelize.db(sequelize.models.users);

        return await userInstance.findOne({
            where: {
                resetPasswordToken: token,
                resetTokenExpiry: {
                    [Op.gt]: Date.now()
                }
            }
        });
    }
    catch (error) { return [undefined, error]; }
};
const checkRefreshToken = async function (token) {
    try {
        let authorizationsKeysInstance = new sequelize.db(sequelize.models.authorizations);

        return await authorizationsKeysInstance.findOne({
            where: {
                refreshToken: token
            }
        });
    }
    catch (error) { return [undefined, error]; }
};
/**
 * 
 * @param {*} userId auto generated unique user id to find record
 * @param {*} req 
 * @returns it returns inserted row which contains access token and some other info about device etc
 */
const generateAuthorization = async function (userId, req) {
    let body = {
        userId: userId,
        deviceType: req.body.deviceType || null,
        deviceToken: req.body.deviceToken || null
    };
    try {

        const authorizationsKeysInstance = new sequelize.db(sequelize.models.authorizations);
        const authorization = authorizationsKeysInstance.build(body);

        authorization.generateAccessToken();
        authorization.generatePasswordToken(); // <-- this line is critical

        await authorization.save();
        return [authorization, null];

    }
    catch (error) { return [undefined, error]; }
};
const updateAuth = async (authorization, data) => {
    try {
        let authorizationsKeysInstance = new sequelize.db(sequelize.models.authorizations);

        authorizationsKeysInstance.model = authorization
        return await authorizationsKeysInstance.update(data);

    }
    catch (error) { return (error); }
}

/**
 * Decodes a custom encoded token (for reset, access, etc.)
 * @param {string} token
 * @returns { userId, tempTokenId, rawToken, expiry }
 */
const decodeCustomToken = (token) => {
    const index_separator = keys_length.index_separator;
    const parts = token.split(index_separator);
    if (parts.length !== 4) throw new Error("Invalid token format");
    const userId = base_encoder.decode(parts[0], constants.data_set);
    const tempTokenId = base_encoder.decode(parts[1], constants.data_set);
    const rawToken = parts[2];
    const expiry = parseInt(base_encoder.decode(parts[3], constants.data_set), 10);

    return {
        userId,
        tempTokenId,
        rawToken,
        expiry
    };
}


// Find or create token
const findOrCreateResetToken = async (userId) => {
    const tempTokenInstance = new sequelize.db(sequelize.models.temp_tokens);
    let [existing, error] = await tempTokenInstance.findOne({ where: { userId, used: false } });
    if (error) throw error;
    //   console.log("Get the exisiting token",existing);

    const now = Date.now();
    const expiresAt = new Date(now + 50 * 60 * 1000); // 50 mins

    if (!existing || new Date(existing.expiresAt).getTime() < now) {
        const [newToken] = await tempTokenInstance.create({ userId, expiresAt });
        console.log("get fresh token", newToken)
        return newToken;
    }

    return existing;
}

// Encode reset token
const encodeResetToken = function (userId, tokenId, rawToken, expiry) {
    const index_separator = keys_length.index_separator;
    return [
        base_encoder.encode(userId, constants.data_set),
        base_encoder.encode(tokenId, constants.data_set),
        rawToken,
        base_encoder.encode(expiry, constants.data_set)
    ].join(index_separator);
}

// Mark token as used
const markTokenUsed = async (tempTokenId) => {
    await sequelize.models.temp_tokens.update(
        { used: true },
        { where: { id: tempTokenId } }
    );
}

const getAllUsers = async () => {
    const users = await sequelize.models.users.findAll();
    return users;
}

const getUserCount = async () => {
    // Count all users, including soft-deleted ones
    return await sequelize.models.users.count({ paranoid: false });
};

const getUserTotalCount = async () => {
    // Single DB hit: count all users, including soft-deleted
    const totalCount = await sequelize.models.users.count({
        where: {
            deleted_at: {
                [Op.or]: [null, { [Op.ne]: null }]
            }
        }
    });
    return totalCount;
};

module.exports =
{
    create,
    updateUser,
    getUserWithEmail,
    checkAuthorization,
    generateAuthorization,
    checkResetToken,
    checkRefreshToken,
    updateAuth,
    decodeCustomToken,
    markTokenUsed,
    encodeResetToken,
    findOrCreateResetToken,
    findUserById,
    findUserWithRoleById,
    getAllUsers,
    getUserCount,
    getUserTotalCount


}