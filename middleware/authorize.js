/**
 * Role-based authorization middleware.
 * Usage: authorize('admin'), authorize('vendor', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Role '${req.user?.role}' is not authorized for this action`)
      );
    }
    next();
  };
};
