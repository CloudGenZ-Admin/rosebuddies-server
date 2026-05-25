const { QuizPreference, Profile } = require('../models');

exports.submitQuiz = async (req, res) => {
  try {
    const { location_data, personality, friendship_goals, availability } = req.body;

    // Find the preference row created during signup
    let quiz = await QuizPreference.findOne({ where: { user_id: req.user.id } });

    // Update with frontend JSON data
    quiz.location_data = location_data || quiz.location_data;
    quiz.personality = personality || quiz.personality;
    quiz.friendship_goals = friendship_goals || quiz.friendship_goals;
    quiz.availability = availability || quiz.availability;
    await quiz.save();

    // Update profile progress
    await Profile.update(
      { onboarding_step: 'QUIZ_DONE' },
      { where: { user_id: req.user.id } }
    );

    res.json({ success: true, message: 'Quiz submitted successfully', data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};