const bcrypt = require('bcryptjs');
const { User, Profile, QuizPreference, RefreshToken, VerificationToken } = require('../models');
const { generateTokens } = require('../utils/tokenUtils');
const { generateOTP } = require('../utils/otpUtils');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "dummy");


exports.register = async (req, res) => {
  try {
    const { email, phone_number, password, first_name } = req.body;
    
    let existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    
    if (phone_number) {
      let existingPhone = await User.findOne({ where: { phone_number } });
      if (existingPhone) return res.status(400).json({ message: 'Phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({ email, phone_number, password_hash, auth_provider: 'LOCAL' });

    await Profile.create({ user_id: user.id, first_name, onboarding_step: 'SIGNUP' });
    await QuizPreference.create({ user_id: user.id });

    // Generate Raw OTP
    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    // Hash OTP before saving
    const otpSalt = await bcrypt.genSalt(10);
    const hashed_otp = await bcrypt.hash(otp, otpSalt);

    await VerificationToken.create({ 
      user_id: user.id, 
      token: hashed_otp, 
      type: 'EMAIL_VERIFICATION', 
      expires_at 
    });

 
    let responsePayload = { 
      success: true, 
      message: 'User registered. Please verify OTP.', 
      userId: user.id,
      otp: otp 
    };

    res.status(201).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY EMAIL OTP
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verifications = await VerificationToken.findAll({
      where: { user_id: user.id, type: 'EMAIL_VERIFICATION', is_used: false }
    });

    let matchedVerification = null;

    for (const v of verifications) {
      const isMatch = await bcrypt.compare(otp, v.token);
      if (isMatch && v.expires_at > new Date()) {
        matchedVerification = v;
        break;
      }
    }

    if (!matchedVerification) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.is_verified = true;
    await user.save();

    matchedVerification.is_used = true;
    await matchedVerification.save();

    const { accessToken, refreshToken } = generateTokens(user.id);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at });

    res.json({ success: true, message: 'Email verified successfully!', accessToken, refreshToken, userId: user.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body; 
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    await VerificationToken.update(
      { is_used: true },
      { where: { user_id: user.id, type: type, is_used: false } }
    );

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const otpSalt = await bcrypt.genSalt(10);
    const hashed_otp = await bcrypt.hash(otp, otpSalt);

    await VerificationToken.create({ 
      user_id: user.id, 
      token: hashed_otp, 
      type: type, 
      expires_at 
    });

   
    let responsePayload = { 
      success: true, 
      message: 'New OTP generated successfully',
      newotp: otp
    };

    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.password_hash) {
      return res.status(400).json({ message: 'Invalid credentials or login via Google' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email via OTP first' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at });

    res.json({ success: true, accessToken, refreshToken, userId: user.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. GOOGLE LOGIN (Mock testing bypass )
exports.googleLogin = async (req, res) => {
  try {
    const { token, mock_email, mock_name, mock_google_id } = req.body;

    let email, google_id, first_name;

    // If no token is provided, safely fallback to Mock data directly
    if (!token) {
      if (!mock_email) {
         return res.status(400).json({ message: 'For local testing, mock_email is required in body' });
      }
      console.log(` [MOCK AUTH] Logging in via Mock Google Account: ${mock_email}`);
      email = mock_email;
      google_id = mock_google_id || `mock-google-${Date.now()}`;
      first_name = mock_name || "GoogleUser";
    } 
    else {
      // Real Google Verification Flow
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
      });

      const payload = ticket.getPayload();
      email = payload.email;
      google_id = payload.sub;
      first_name = payload.given_name;
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({ 
        email, 
        google_id, 
        auth_provider: 'GOOGLE', 
        is_verified: true 
      });
      await Profile.create({ user_id: user.id, first_name, onboarding_step: 'SIGNUP' });
      await QuizPreference.create({ user_id: user.id });
    } else {
      if (!user.google_id) {
        user.google_id = google_id;
        user.auth_provider = 'GOOGLE';
        user.is_verified = true;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at });

    res.json({ success: true, accessToken, refreshToken, userId: user.id });
  } catch (error) {
    console.error(" Google Auth Error:", error.message);
    res.status(401).json({ success: false, message: 'Invalid Google Token or Server Error' });
  }
};

// 6. FORGOT PASSWORD 
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const otpSalt = await bcrypt.genSalt(10);
    const hashed_otp = await bcrypt.hash(otp, otpSalt);

    await VerificationToken.create({ 
      user_id: user.id, 
      token: hashed_otp, 
      type: 'PASSWORD_RESET', 
      expires_at 
    });

    // Directly sending raw otp in response payload
    let responsePayload = { 
       success: true,
       message: 'Password reset OTP generated',
       otp: otp 
    };

    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verifications = await VerificationToken.findAll({
      where: { user_id: user.id, type: 'PASSWORD_RESET', is_used: false }
    });

    let matchedVerification = null;

    for (const v of verifications) {
      const isMatch = await bcrypt.compare(otp, v.token);
      if (isMatch && v.expires_at > new Date()) {
        matchedVerification = v;
        break;
      }
    }

    if (!matchedVerification) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

   
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    
    
    if (!user.is_verified) {
      user.is_verified = true;
      console.log(` [SYSTEM] User ${email} auto-verified during password reset.`);
    }
    
    await user.save();

    matchedVerification.is_used = true;
    await matchedVerification.save();

    res.json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. LOGOUT
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await RefreshToken.update({ is_revoked: true }, { where: { token: refreshToken } });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};