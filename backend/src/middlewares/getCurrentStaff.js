const userRepo = require('../repositories/user.repository');
const staffProfileRepo = require('../repositories/staffProfile.repository');

const getCurrentStaff = async (req, res, next) => {
  try {
    // Get current staff profile from user
    const currentStaff = await staffProfileRepo.findCurrentStaff(req.user.id);
    
    if (currentStaff) {
      // Override user data with staff profile data for data creation
      req.effectiveUser = {
        id: req.user.id, // Keep original user ID for permissions
        name: currentStaff.name,
        email: currentStaff.email,
        phone: currentStaff.phone,
        staffProfileId: currentStaff.id
      };
    } else {
      // Fallback to original user
      req.effectiveUser = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        staffProfileId: null
      };
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentStaff };
