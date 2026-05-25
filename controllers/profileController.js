const { Profile, QuizPreference } = require('../models');

exports.updateProfile = async (req, res) => {
  try {
    const { last_name, bio, pronouns, age_range } = req.body;
    let avatar_url = null;

    if (req.file) {
      avatar_url = `/uploads/${req.file.filename}`; // Local path 
    }

    const updateData = { last_name, bio, pronouns, age_range, onboarding_step: 'PROFILE_DONE' };
    if (avatar_url) updateData.avatar_url = avatar_url;

    
    await Profile.update(updateData, { where: { user_id: req.user.id } });

    const updatedProfile = await Profile.findOne({ where: { user_id: req.user.id } });

    res.json({ success: true, message: 'Profile completed!', data: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET Profile and Quiz answers (For user to review)
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    const quiz = await QuizPreference.findOne({ where: { user_id: req.user.id } });

    res.json({ success: true, data: { profile, quiz } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};