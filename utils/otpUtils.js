// 6-digit random numeric OTP generate karne ke liye
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generateOTP };