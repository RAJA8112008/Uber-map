const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.authUser = async (req, res, next) => {

    try {

        const token =
            req.cookies?.token ||
            (req.headers.authorization &&
                req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(401).json({
                error: "Access denied. No token provided."
            });
        }

        const isBlacklisted =
            await blacklistTokenModel.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await userModel.findById(
            decoded._id
        );

        if (!user) {
            return res.status(401).json({
                error: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Invalid token"
        });

    }
};

module.exports.authCaptain=async(req,res,next)=>{
    try {
        const token =
            req.cookies?.token ||
            (req.headers.authorization &&
                req.headers.authorization.split(" ")[1]); 
        if (!token) {
            return res.status(401).json({
                error: "Access denied. No token provided."
            });
        }
        const isBlacklisted =
            await blacklistTokenModel.findOne({ token });

        if (isBlacklisted) {    
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        const captain = await captainModel.findById(
            decoded._id
        );
        if (!captain) {
            return res.status(401).json({
                error: "Captain not found"
            });
        }
        req.captain = captain;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid token"
        });
    }
}