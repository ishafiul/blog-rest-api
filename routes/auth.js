const router =  require("express").Router();
const  User =require("../models/User");
require("dotenv").config();
const CryptoJS = require("crypto-js");

//register
router.post('/signup',async (req,res)=>{
    try {
        const hashPassword = CryptoJS.AES.encrypt(req.body.password, process.env.HASH_KEY).toString();
        const newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password: hashPassword,
        })
        const user = await newUser.save();
        res.status(200).json(user);
    }
    catch (err){
        res.status(500).json(err);
    }
})

//login
router.post('/login',async (req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if (!user){
            res.status(401).json({error: "User not found"});
        }
        else{
            const bytes  = CryptoJS.AES.decrypt(user.password, process.env.HASH_KEY);
            const passValidate =bytes.toString(CryptoJS.enc.Utf8);
            if (!passValidate){
                res.status(500).json('wrong username or password!');
            }
            const {password,...others} = user._doc;
            res.status(200).json(others);
        }
    }
    catch (err){
        res.status(404).json(err);
    }
})

module.exports = router;