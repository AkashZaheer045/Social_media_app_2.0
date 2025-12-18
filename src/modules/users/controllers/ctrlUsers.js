const base_encoder = require("eb-butler-utils");
const constants = require("../../../../config/constants.json");
const sequelize = require('../../../../db/sequelize/sequelize');
const userService = require('../services/srvcUsers')
const keys_length = constants.keys_length;
const index_separator = keys_length.index_separator;
const { ROLES } = require('../../../../constants/roles');

//--//

const create = async function (req, res, next) {
    try {
        const { email } = req.body;

        // Automatically create username
        req.body.username = email.split('@')[0];

        let userInstance = new sequelize.db(sequelize.models.users);
        const [user, err] = await userInstance.create(req.body);
        if (err) return next(err);

        // If created by superadmin via admin panel
        if (req.role === ROLES.SUPERADMIN) {
            return next(user); // Send it to next step like notification/logging
        }

        // Normal API response
        return res.status(201).json({
            message: 'User created successfully',
            user,
        });
    } catch (error) {
        return next(error);
    }
};

const update = async function (req, res, next) {
    try {
        let userInstance = new sequelize.db(sequelize.models.users);
        const [user, err] = await userInstance.findOne({ where: { id: req.user.userId } });
        if (err) { return next(err) }
        if (!user) return next(404)
        userInstance.model = user;
        let [updatedUser, err2] = await userInstance.update(req.body);
        if (err2) { return next(err2) }
        // update preferences
        return next(updatedUser)


    }
    catch (error) { return next(error) }
};
const login = async function (req, res, next) {
    try {
        let { email, password, device_token, } = req.body

        let access_token, refresh_token, encoded_access_id, encoded_user_id, encoded_role_id, authorization, error;
        //--//
        /* check user exist or not */
        let userInstance = new sequelize.db(sequelize.models.users);
        const [user, err] = await userInstance.findOne({ where: { email: email } });
        if (err) return next(err);
        if (!user) { return next(404) }
        if (!user.validatePassword(password)) { return next(401) }

        // /* check user authorization base on current device and create auth if not exist */
        [authorization, error] = await userService.checkAuthorization(user.id, req);

        if (error) { return next(error) }
        //-iF user not authorization it create the new token generation-//
        if (!authorization) {
            [authorization, error] = await userService.generateAuthorization(user.id, req);
            if (error) { return next(error) }
        }
        //-Assigning the userid and device token to the accesstoken here from db-//
        access_token = authorization.accessToken;
        //-Assigning the userid and device token to the refreshtoken here from db-//
        refresh_token = authorization.refreshToken;

        encoded_user_id = base_encoder.encode(user.id, constants.data_set);
        encoded_access_id = base_encoder.encode(authorization.id, constants.data_set);
        let now = Date.now();
        let accessExpiry = base_encoder.encode(now + 1000 * 60 * 86400, constants.data_set);           // 1 day
        let refreshExpiry = base_encoder.encode(now + 1000 * 86400 * 3, constants.data_set);     // 3 days

        let access_authorization = encoded_user_id + index_separator + encoded_access_id + index_separator + access_token + index_separator + accessExpiry;

        refresh_token = encoded_user_id + index_separator + encoded_access_id + index_separator + refresh_token + index_separator + refreshExpiry;

        return next({
            user: user,
            accessToken: access_authorization,
            refreshToken: refresh_token
        });
    }
    catch (error) { return next(error) }
};
const getUser = async function (req, res, next) {
    try {
        let { userId } = req.user
        let userInstance = new sequelize.db(sequelize.models.users);
        const [user, err] = await userInstance.findOne({
            where: { id: userId }
        });
        if (err) return next(err);
        return next({ user: user });
    }
    catch (error) { return next(error) }
};
const updateEmail = async function (req, res, next) {
    try {
        const { newEmail } = req.body;
        if (!newEmail) return next(400);

        let userInstance = new sequelize.db(sequelize.models.users);
        const [user, err] = await userInstance.findOne({ where: { id: req.user.userId } });
        if (err) return next(err);
        if (!user) return next(404);

        userInstance.model = user;
        const [updatedUser, err2] = await userInstance.update({ email: newEmail });
        if (err2) return next(err2);

        return next({ message: "Email updated successfully:", user: updatedUser });
    } catch (error) {
        return next(error);
    }
};
const forgotPassword = async function (req, res, next) {
    try {
        const email = req.body.email;
        if (!email) return next(new Error("Email is required"));

        // 1. Get user by email
        const [user, err] = await userService.getUserWithEmail(email);
        if (err) return next(err);
        if (!user) return next(new Error("User not found"));

        //console.log("email",user.id);
        // 2. Get existing or create new temp token
        const existingToken = await userService.findOrCreateResetToken(user.id);
        // if (tokenErr) return next(tokenErr);

        // 3. Encode token
        const encoded_token = userService.encodeResetToken(
            user.id,
            existingToken.id,
            existingToken.token,
            existingToken.expiresAt.getTime()
        );

        // TODO: send token via email here

        return next({
            message: "Password reset token generated",
            token: encoded_token
        });

    } catch (error) {
        return next(error);
    }
};
const updatePassword = async function (req, res, next) {
    try {
        const token = req.header("x-reset-token");
        if (!token) return next(new TypeError("Reset token required in header"));

        // 1. Decode token
        let decoded;
        try {
            decoded = userService.decodeCustomToken(token);
        } catch (err) {
            return next(new TypeError("Invalid token"));
        }

        // 2. Check expiry
        if (Date.now() > decoded.expiry) {
            return next(new TypeError("Token expired"));
        }

        // 3. Find token in DB
        let tempTokenInstance = new sequelize.db(sequelize.models.temp_tokens);
        const tempToken = await tempTokenInstance.findOne({
            where: {
                id: decoded.tempTokenId,
                userId: decoded.userId,
                token: decoded.rawToken
            }
        });
        if (!tempToken) return next(new TypeError("Invalid or missing token"));
        if (tempToken.used) return next(new TypeError("Token already used"));

        // 4. Get user
        const user = await userService.findUserById(decoded.userId);
        // console.log("here is the user data",user);
        // if (userErr) return next(userErr);
        if (!user) return next(new TypeError("User not found"));

        // 5. Update password using service
        const { password, confirm_password } = req.body;
        if (!password || !confirm_password) {
            return next(new TypeError("Password and confirm_password required"));
        }
        const updateData = { password, confirmPassword: confirm_password };
        const updatedUser = await userService.updateUser(user, updateData, true);
        console.log("user dataupdated");
        if (!updatedUser) {
            return next(new TypeError("Failed to update password"));
        }

        console.log("Here is the decoded data ", decoded.tempTokenId);
        // 6. Mark token as used
        await userService.markTokenUsed(decoded.tempTokenId);

        return next({ message: "Password updated successfully" });

    } catch (error) {
        return next(error);
    }
};
const refreshToken = async (req, res, next) => {
    try {
        const refresh_token = req.header("x-refresh-token");
        if (!refresh_token) return next(new TypeError("Refresh token required"));

        const refreshParts = refresh_token.split(index_separator);
        if (refreshParts.length !== 4) return next(new TypeError("Invalid refresh token format"));

        const userId = base_encoder.decode(refreshParts[0], constants.data_set);
        const authId = base_encoder.decode(refreshParts[1], constants.data_set);
        const refreshToken = refreshParts[2];
        const refreshExpiry = parseInt(base_encoder.decode(refreshParts[3], constants.data_set), 10);

        if (Date.now() > refreshExpiry)
            return next(new TypeError("Refresh token expired. Please login again."));

        // Validate refresh token from DB
        let authInstance = new sequelize.db(sequelize.models.authorizations);
        const [authRecord] = await authInstance.findOne({
            where: { id: authId, userId: userId, refreshToken: refreshToken }
        });

        if (!authRecord) return next(new TypeError("Invalid refresh token"));

        // Regenerate access token
        authRecord.generateAccessToken();
        await authRecord.save();

        const encoded_user_id = base_encoder.encode(userId, constants.data_set);
        const encoded_auth_id = base_encoder.encode(authId, constants.data_set);
        const newAccessExpiry = base_encoder.encode(Date.now() + 1000 * 60 * 15, constants.data_set); // 15 mins

        const new_access_token = [
            encoded_user_id,
            encoded_auth_id,
            authRecord.accessToken,
            newAccessExpiry
        ].join(index_separator);

        return next({ accessToken: new_access_token });

    } catch (err) {
        return res.status(500).json({ error: "Failed to refresh access token", details: err.message });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json({ users });
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch users", details: err.message });
    }
};
const softDeleteUser = async function (req, res, next) {
    try {
        const userId = req.params.userId || req.user?.userId; // You can use param or logged-in user
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found in request" });
        }

        const userInstance = new sequelize.db(sequelize.models.users);
        const [user, err] = await userInstance.findOne({ where: { id: userId } });
        if (err) return next(err);
        if (!user) return res.status(404).json({ error: "User not found" });

        await user.destroy(); // This will soft-delete the user (set deletedAt)
        return res.status(200).json({ message: "User soft deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: "User soft delete failed", details: err.message });
    }
};
const getUserTotalCount = async (req, res) => {
    try {
        const totalCount = await userService.getUserTotalCount();
        return res.status(200).json({ totalCount });
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch total user count", details: err.message });
    }
};

//--//
module.exports = {
    create,
    update,
    login,
    getUser,
    updateEmail,
    forgotPassword,
    updatePassword,
    refreshToken,
    getAllUsers,
    softDeleteUser,
    getUserTotalCount
};
