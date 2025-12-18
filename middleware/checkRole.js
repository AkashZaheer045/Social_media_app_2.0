const { ROLES, ROLESGROUP } = require("../constants/roles");

/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if the user has the required role(s) to access a route
 * 
 * @param {number|number[]} allowedRoles - Single role ID or array of role IDs that are allowed
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Single role
 * router.get('/admin-only', checkRole(ROLES.ADMIN), controller);
 * 
 * // Multiple roles
 * router.get('/staff', checkRole([ROLES.ADMIN, ROLES.SUPERADMIN]), controller);
 * 
 * // Using predefined groups
 * router.get('/admins', checkRole(ROLESGROUP.AdminsRole), controller);
 */
function checkRole(allowedRoles) {
    return function (req, res, next) {
        try {
            // Ensure user is authenticated first
            if (!req.role) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required. Please log in."
                });
            }

            // Convert single role to array for consistent handling
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            // Check if user's role is in the allowed roles
            if (!roles.includes(req.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You do not have permission to access this resource."
                });
            }

            return next();
        } catch (err) {
            return next(err);
        }
    };
}

/**
 * Middleware to check if user is a superadmin
 */
const isSuperAdmin = checkRole(ROLES.SUPERADMIN);

/**
 * Middleware to check if user is an admin or superadmin
 */
const isAdmin = checkRole(ROLESGROUP.AdminsRole);

/**
 * Middleware to check if user is authenticated (any role)
 */
const isAuthenticated = checkRole(ROLESGROUP.CommonRoler);

module.exports = {
    checkRole,
    isSuperAdmin,
    isAdmin,
    isAuthenticated,
    ROLES,
    ROLESGROUP
};
