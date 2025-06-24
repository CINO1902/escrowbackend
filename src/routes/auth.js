const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { hashPassword, comparePassword, signToken, getUserFromToken, loginService } = require('../services/authServices');
const otpModel = require('../models/otpModel');
const { sendOTPEmail } = require('../services/sendEmailService');
const auth = require('../middleware/auth');


router.post(
  '/register',
  [
    body('first_name').notEmpty(),
    body('last_name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('address').optional(),
    body('phone').optional()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { first_name, last_name, email, password, address, phone, profile_picture } = req.body;
    console.log(req.body);
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashed = await hashPassword(password);
    try{
      user = await User.create({ 
        firstName: first_name,
        lastName: last_name,
        email: email.toLowerCase().trim(), 
        password: hashed,
        profile_picture:profile_picture,
        address: address || '',
        phone: phone || ''
      });
   return   res.status(201).json({ token: signToken(user), message: "User Registered successfully" });
    }catch(err){
      console.log(err)
      return res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
   
  }
);

router.post('/login', [body('email').isEmail(), body('password').exists()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array() });

    const { email, password } = req.body;
    const user = await loginService(email, password);
    res.status(200).json({ token: signToken(user), message: "User logged in successfully" , userDetails: user });
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

router.get('/get-user', auth, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized Access", userDetails: null });
    }
    res.status(200).json({ message: "User fetched successfully", userDetails: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error", userDetails: null });
  }
});
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const emailUse = email.toLowerCase().trim();

  // Helper functions
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const getCurrentTimestamp = () => new Date();
  const getExpiryTimestamp = () => new Date(Date.now() + 10 * 60 * 1000);

  const finalOtp = generateOTP();

  try {
    // Remove any previous OTP for this email
    await otpModel.deleteMany({ email: emailUse });
    
    // Create a new OTP document
    await otpModel.create({
      otp: finalOtp,
      email: emailUse,
      date_created: getCurrentTimestamp(),
      date_expired: getExpiryTimestamp()
    });
  } catch (e) {
    console.error(e);
    return res.json({ status: "fail", message: "Something went wrong while saving OTP" });
  }

  try {
    // Use the helper function to send the OTP email
    await sendOTPEmail(emailUse, finalOtp);
    res.status(200).json({ message: "One time password has been sent to your mail" });
  } catch (e) {
    console.error("Error sending email:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/verify-otp", async(req,res)=>{
  const {email, otp} = req.body;
  let emailuse = email.toLowerCase().trim();

  console.log(emailuse)
  try{
      let getdocument =  await otpModel.findOne({email: emailuse});
      const now_date = new Date();
      console.log(now_date)


      if(getdocument){
          if(getdocument.date_expired > now_date){
              if(getdocument.otp != otp){
                  return res.status(500).json({status:'fail', message:"The Otp you entered is incorrect"})
              }else{
                  await User.updateOne({email:emailuse},{$set: {email_verify:true}},{upsert:true})
                  await otpModel.deleteMany({email:emailuse})
                  return res.status(200).json({status:'success', message:"Your email has been verified successfully"})
              }
          }else{
              return res.status(500).json({status:'fail', message:"The Otp has been expired, Request a new one"})
          }
      }else{
          return res.status(500).json({status:'fail', message:"Email does not exist"})
      }
     
      
  }catch(e){
      console.error(e)
      return res.json({status:"fail", message:"something went wrong"})
  }

  
})

module.exports = router;
