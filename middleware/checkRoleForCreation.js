const { ROLES } = require('../utils/roles');

function checkRoleForCreation(req, res, next) {
  try {
    let { role } = req.body;

    // If role is not provided, default to 'user'
    if (!role || typeof role !== 'string' || role.trim() === '') {
      role = 'user';
    }

    role = role.toUpperCase(); // Convert to uppercase (USER, ADMIN...)

    // Validate: only allow USER role to be created via API
    const allowedRoles = [ROLES.USER]; // user = 3
    if (!Object.keys(ROLES).includes(role) || !allowedRoles.includes(ROLES[role])) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // If admin role is requested, only superadmin can do that
    if (ROLES[role] === ROLES.ADMIN && req.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({ message: 'Only superadmin can assign admin role.' });
    }

    // Set correct numeric role in req.body
    req.body.role = ROLES[role];
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = checkRoleForCreation;
