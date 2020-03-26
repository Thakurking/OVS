var express = require("express");
var router = express.Router();
/**********Password Hashing Validator Module**********/
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var validator = require("validator");
/***********Model Modules***********/
const Admin = require("../model/Admin");
/***********Nodemailer***********/
const nodemailer = require("nodemailer");

//Admin Login Page Starter
//START
//=======================================================================================================================================================
router.get("/", function(req, res) {
  // Admin.create({ Email: "ritesh@gmail.com", Password: "12345" }, function(
  //   err,
  //   obj
  // ) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("success");
  //   }
  // });
  res.render("index");
});
//=======================================================================================================================================================
//END

//Admin Login Request Handel
//START
//=======================================================================================================================================================
router.post("/Admin_login", function(req, res) {
  var Admin_Login = JSON.parse(req.body.admin_login);
  Admin.findOne({ Email: Admin_Login.Email }, function(err, obj) {
    if (err) {
      console.log(err);
    } else if (obj == null) {
      res.send([false, "no user found"]);
    } else {
      bcrypt.compare(Admin_Login.Password, obj.Password, function(err, result) {
        if (err) {
          console.log(err);
        } else if (result == false) {
          console.log("password did not match");
        } else {
          var token = jwt.sign({ data: obj._id }, "blkhrt", {
            expiresIn: "1h"
          });
          res
            .cookie("token", token, { maxAge: 3600000, httpOnly: true })
            .send([true]);
          console.log(result);
        }
      });
    }
  });
});
//=======================================================================================================================================================
//END

//TOKEN Middleware
//START
//=======================================================================================================================================================
function authToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) res.redirect("/");
  jwt.verify(token, "blkhrt", function(err, decoded) {
    if (err) console.log(err);
    else {
      req.profile = decoded.data;
      next();
    }
  });
}
//=======================================================================================================================================================
//END

//Logout Handling
//START
//=======================================================================================================================================================
router.get("/logout", function(req, res) {
  res.clearCookie("token").redirect("/");
});
//=======================================================================================================================================================
//END

//dashboard
//START
//=======================================================================================================================================================
router.get("/dashboard", function(req, res) {
  res.render("dashboard");
});
//=======================================================================================================================================================
//END

//home
//START
//=======================================================================================================================================================
router.get("/home", function(req, res) {
  res.render("home");
});
//=======================================================================================================================================================
//END
module.exports = router;
