const crypto = require('crypto');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const encryptOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

const verifyOTP = (inputOtp, hashedOtp) => {
    const hashedInput = crypto.createHash('sha256').update(inputOtp).digest('hex');
    return hashedInput === hashedOtp;
};

module.exports = { generateOTP, encryptOTP, verifyOTP };
