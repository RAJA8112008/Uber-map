const userModel=require("../models/user.model");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");

module.exports.authUser=async(req,res,next)=>{
    const token= req.cookies.token ||
    (req.headers.authorization &&
     req.headers.authorization.split(" ")[1]);
    if(!token){
        return res.status(401).json({error:"Access denied. No token provided."});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
         const user=await userModel.findById(decoded._id);
        if(!user){
            return res.status(401).json({error:"Invalid token."});
        }
        req.user=user;
       return next();
    }catch(error){
        return res.status(400).json({error:"Invalid token."});
    }
}