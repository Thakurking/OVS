/***********START MODULES***********/
var express = require("express");
var router = express.Router();
/**********Password Hashing And Validator Module**********/
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var validator = require("validator");
const fs = require("fs");
var multer = require("multer");
/***********DATABASE Model Modules***********/
const Admin = require("../model/Admin");
const Candidate = require("../model/Candidate");
const Voter = require("../model/Voter");
/***********Nodemailer***********/
const nodemailer = require("nodemailer");
/***********CSV To JSON***********/
// const csv = require("csvtojson");
/********************END OF MODULES********************/

//Multer Path And destination settiings for image upload functions
//START
//=======================================================================================================================================================
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      if (!fs.existsSync("./images")) fs.mkdirSync("./images");
      callback(null, "./images");
    } else if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");
      callback(null, "./uploads");
    } else callback(true, "");
  },
  filename: function(req, file, callback) {
    if (file.mimetype === "image/jpg") callback(null, Date.now() + ".jpg");
    else if (file.mimetype === "image/jpeg")
      callback(null, Date.now() + ".jpeg");
    else if (file.mimetype === "image/png") callback(null, Date.now() + ".png");
    else if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel"
    )
      callback(null, Date.now() + ".csv");
    else callback(true, "");
  }
});
var upload = multer({ storage: storage });
//=======================================================================================================================================================
//END


//#region home or index Page
//=======================================================================================================================================================
router.get("/", function(req, res) {
  res.render("index");
});
//=======================================================================================================================================================
//#endregion

//#region home or index Page
//=======================================================================================================================================================
router.get("/login", function(req, res) {
  res.render("login");
});
//=======================================================================================================================================================
//#endregion

//#region admin or dahsboard Page
//=======================================================================================================================================================
router.get("/admin", function(req, res, next) {
  // ADMIN ID : ritesh@gmail.com
  // PASS : 12345
  // important ----- uncomment and reload the index page once for setting up database
  // Admin.create({ Email: "ritesh@gmail.com", Password: "$2b$08$ZDYPv1F6hssSf6QaNhQPb./6PFuv4FyHuEj4fBYipSAixfcNOPFwi" }, function(
  //   err,
  //   obj
  // ) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("success");
  //   }
  // });
  const token = req.cookies.token;
  if (!token) res.redirect("/login");
  else {
    jwt.verify(token, "blkhrt", function(err, decoded) {
      if (err) res.redirect("/login");
      else {
        res.render("dashboard");
      }
    });
  }
});
//#endregion

// #region login request handel
//=======================================================================================================================================================
router.post("/loginAuth", function(req, res) {
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
          res.send([false, "password did not match"]);
        } else {
          var token = jwt.sign({ data: obj._id }, "blkhrt", {
            expiresIn: "1h"
          });
          res
            .cookie("token", token, { maxAge: 3600000, httpOnly: true })
            .send([true]);
        }
      });
    }
  });
});
//=======================================================================================================================================================
//#endregion

//#region auth TOKEN Middleware
//=======================================================================================================================================================
function authToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) res.redirect("/login");
  else {
    jwt.verify(token, "blkhrt", function(err, decoded) {
      if (err) res.redirect("/login");
      else {
        req.profile = decoded.data;
        next();
      }
    });
  }
}
//=======================================================================================================================================================
//#endregion

//#region Logout Handling
//=======================================================================================================================================================
router.get("/logout", function(req, res) {
  res.clearCookie("token").redirect("/");
});
//=======================================================================================================================================================
//#endregion

//#region Admin Dashboard Page
//=======================================================================================================================================================
router.get("/dashboard", authToken, function(req, res) {
  Admin.findOne({ _id: req.profile }, function(err, obj) {
    if (err) console.log(err);
    else if (obj == null) console.log("no user found");
    else {
      res.render("dashboard", { admin: obj });
    }
  });
});
//=======================================================================================================================================================
//#endregion

//#region Candidate Adding Starter Page
//=======================================================================================================================================================
router.get("/candidate", authToken, function(req, res) {
  Candidate.find({}, (err, result) => {
    if (err) console.log(err);
    else res.render("candidate", { data: result });
  });
});
//=======================================================================================================================================================
//#endregion

//#region Candidate add request
//=======================================================================================================================================================
router.post("/addCandidate", authToken, upload.array("image", 2), function(
  req,
  res
) {
  var imgPath = req.files[0].path;
  var symbPath = req.files[1].path;
  var Candidate_Data = {
    name: req.body.name,
    about: req.body.about,
    phone: req.body.phno,
    email: req.body.email,
    aadhar: req.body.aadhar,
    image: imgPath.replace("\\", "/"),
    party: req.body.party,
    symbol: symbPath.replace("\\", "/")
  };
  if (
    Candidate_Data.name != "" &&
    Candidate_Data.email != "" &&
    Candidate_Data.phone != "" &&
    Candidate_Data.aadhar != "" &&
    Candidate_Data.party != "" &&
    Candidate_Data.about != ""
  ) {
    Candidate.create(Candidate_Data, function(err, result) {
      if (err) console.log(err);
      else res.send([true]);
    });
  } else res.send([false, "feilds cannot be empty"]);
});
//=======================================================================================================================================================
//#endregion


//Voters Adding Starter Page
//START
//=======================================================================================================================================================
router.get("/voter", authToken, function(req, res) {
  Voter.find({}, (err, result) => {
    if (err) console.log(err);
    else res.render("voter", { data: result });
  });
});
//=======================================================================================================================================================
//END


//Voter Add Request
//START
//=======================================================================================================================================================
router.post("/votercreate", authToken, function(req, res) {
  var voter = JSON.parse(req.body.voter);
  console.log(voter);
  if (voter.name != "" && voter.email != "" && voter.phone != "" && voter.aadhar != "") {
    Voter.create(voter, function(err, result) {
      if (err) console.log(err);
      else res.send(result);
    });
  } else res.send([false, "feilds cannot be empty"]);
});
//=======================================================================================================================================================
//END


//Voter Delete Request
//START
//=======================================================================================================================================================
router.post("/voterdel", function(req, res) {
  var d_id = req.body.del_id;
  Voter.remove({ _id: d_id }, function(err, result) {
    if (err) console.log(err);
    else res.send(result);
  });
});
//=======================================================================================================================================================
//END

//Voter Update Request
//START
//=======================================================================================================================================================
router.post("/voterupdate", function(req, res) {
  var Voter_Data = JSON.parse(req.body.voter);
  var u_id = req.body.id;
  Voter.update({ _id: u_id }, { $set: Voter_Data }, function(err, result) {
    if (err) console.log(err);
    else res.send(result);
  });
});
//=======================================================================================================================================================
//END

//#region voting page
//=======================================================================================================================================================
router.get("/vote", function(req, res) {
  res.render("voting");
});
//=======================================================================================================================================================
//#endregion
module.exports = router;