const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
module.exports.registerUser = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {

        const { fullname, email, password } = req.body;
         const isUserAlreadyExist = await userModel.findOne({ email });

        if (isUserAlreadyExist) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }
        const hashedPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword
        });

        const token = user.generateAuthToken();

        return res.status(201).json({
            token,
            user
        });

    } catch (error) {
        next(error);
    }
};

//<-----------------Login controller---------------------->
module.exports.loginUser=async(req,res,next)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  const {email,password}=req.body;
  const user=await userModel.findOne({email}).select("+password");

  if(!user){
    return res.status(400).json({error:"Invalid email or password"});
  }
  const isMatch=await user.comparePassword(password);
  if(!isMatch){
    return res.status(400).json({error:"Invalid email or password"});
  }
  const token=user.generateAuthToken();
  res.cookie("token",token);
  return res.status(200).json({token,user});
}


//<-----------------Profile controller--------------------->
module.exports.getProfile=async(req,res,next)=>{
  res.status(200).json({user:req.user});
  }

  //<-----------------logout controller-------------------->
module.exports.logoutUser = async (req, res, next) => {

    try {

        const token =
            req.cookies?.token ||
            (req.headers.authorization &&
                req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(400).json({
                message: "Token not found"
            });
        }

        await blacklistTokenModel.create({
            token
        });

        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        next(error);
    }
};