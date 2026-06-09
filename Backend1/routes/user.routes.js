const express = require("express");
const router = express.Router();

const { body } = require("express-validator");
const userController = require("../controller/user.controller");
const authMiddleware=require("../middleware/auth.middleware");
router.post(
    "/register",
    [
        body("fullname.firstname")
            .isLength({ min: 3 })
            .withMessage("First name should be at least 3 characters long"),

        body("email")
            .isEmail()
            .withMessage("Invalid Email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password should be at least 6 characters long")
    ],
    userController.registerUser
);
//<---------------Login route---------------------->
router.post("/login",[
    body("email")
        .isEmail()
        .withMessage("Invalid Email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password should be at least 6 characters long")
], userController.loginUser)
module.exports = router;

//<-----------------profile route--------------------->

router.get("/profile",authMiddleware.authUser,userController.getProfile);
//<----------------logOut route-------------------->
router.get(
    "/logout",
    authMiddleware.authUser,
    userController.logoutUser
);
