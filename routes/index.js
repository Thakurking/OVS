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
const event = require("../model/event");
/***********Nodemailer***********/
const nodemailer = require("nodemailer");
/***********CSV To JSON***********/
const csv = require("csvtojson");
/********************END OF MODULES********************/

//#region Multer Path And destination settiings for image upload functions
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
//#endregion

//#region user view
// home
router.get("/", async function(req, res) {
  let result = await Candidate.find({});
  let result1 = await event.find({ id: "1" });
  res.render("index", { cad: result, event: result1 });
});

// voting page
router.get("/vote", function(req, res) {
  res.render("voting");
});
//#endregion

//#region authinication middleware

function authToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) res.redirect("/admin");
  else {
    jwt.verify(token, "blkhrt", function(err, decoded) {
      if (err) res.redirect("/admin");
      else {
        req.profile = decoded.data;
        next();
      }
    });
  }
}
//#endregion

//#region admin login / logout

// login page
router.get("/admin", function(req, res) {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "blkhrt", function(err, decoded) {
      if (err) {
      } else res.redirect("/dashboard");
    });
  }
  res.render("login");
});

//login request handle
router.post("/loginAuth", function(req, res) {
  var Admin_Login = JSON.parse(req.body.admin_login);
  Admin.findOne(
    {
      Email: Admin_Login.Email,
      Status: "active",
      Role: { $in: ["admin", "superadmin"] }
    },
    (err, obj) => {
      if (err) {
        console.log(err);
      } else if (obj == null) {
        res.send([false, "no user found"]);
      } else {
        bcrypt.compare(Admin_Login.Password, obj.Password, function(
          err,
          result
        ) {
          if (err) {
            console.log(err);
          } else if (result == false) {
            res.send([false, "password didn't not match"]);
          } else {
            var token = jwt.sign({ data: obj }, "blkhrt", {
              expiresIn: "1h"
            });
            res
              .cookie("token", token, { maxAge: 3600000, httpOnly: true })
              .send([true]);
          }
        });
      }
    }
  );
});

//logout
router.get("/logout", function(req, res) {
  res.clearCookie("token").redirect("/admin");
});

// new admin request
router.post("/new_admin_request", async (req, res) => {
  var admin = JSON.parse(req.body.new_admin);
  await Admin.findOne({ Email: admin.Email }, async (err, obj) => {
    if (err) res.send([false, "soemthing went wrong"]);
    else if (obj != null) res.send([false, "email already exist"]);
    else {
      if (admin.Email != "" && validator.isEmail(admin.Email) == false) {
        res.send([false, "invalid email"]);
      } else if (admin.Password != "" && admin.Password.length < 6) {
        res.send([false, "invalid password"]);
      } else {
        admin.Status = "pending";
        admin.Role = "admin";
        admin.Password = bcrypt.hashSync(admin.Password, "blkhrt");
        await Admin.create(admin, (err, result) => {
          if (err) res.send([false, "something went Wrong"]);
          else
            res.send([
              true,
              "successfully submitted, your will be notified once we approve your request"
            ]);
        });
      }
    }
  });
});

//#endregion

//#region Admin Dashboard Page
router.get("/dashboard", authToken, async function(req, res) {
  let adminProfile = await Admin.findOne({ _id: req.profile }, { Password: 0 });
  let eve = await event.findOne({ id: "1" });
  res.render("dashboard", {
    profile: adminProfile,
    event: eve,
    time: eve.time.split(":"),
    etime: eve.etime.split(":")
  });
});

//event creator
router.post("/createEvent", authToken, function(req, res) {
  event.create(JSON.parse(req.body.event), function(err, obj) {
    if (err) console.log(err);
    else {
      res.send(obj);
    }
  });
});

// update event
router.post("/updateEvent", authToken, function(req, res) {
  console.log(req.body.id, JSON.parse(req.body.event));
  event.updateOne(
    { _id: req.body.id },
    { $set: JSON.parse(req.body.event) },
    function(err, obj) {
      if (err) console.log(err);
      else {
        res.send(obj);
      }
    }
  );
});
//#endregion

//#region Candidate admin Page

// candidate record display
router.get("/candidate", authToken, async function(req, res) {
  await Candidate.find({}, (err, result) => {
    if (err) console.log(err);
    else res.render("candidate", { data: result });
  });
});

//Candidate add request
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

//Candidate delete request
router.post("/delCandidate", authToken, async function(req, res) {
  if (req.body.del_id != null) {
    await Candidate.findOne({ _id: req.body.del_id }, function(err, obj) {
      if (err) console.log(err);
      else {
        if (fs.existsSync(obj.image)) fs.unlinkSync(obj.image);
        if (fs.existsSync(obj.symbol)) fs.unlinkSync(obj.symbol);
      }
    });
    await Candidate.deleteOne({ _id: req.body.del_id }, function(err, result) {
      if (err) console.log(err);
      else res.send([true]);
    });
  } else res.send([false, "record does not exist"]);
});

//Candidate profile image update request
router.post(
  "/updateCandidateImage",
  authToken,
  upload.single("image"),
  async function(req, res) {
    if (req.body.id != null) {
      await Candidate.findOne({ _id: req.body.id }, function(err, obj) {
        if (err) console.log(err);
        else {
          if (fs.existsSync(obj.image)) fs.unlinkSync(obj.image);
        }
      });
      await Candidate.updateOne(
        { _id: req.body.id },
        { $set: { image: req.file.path.replace("\\", "/") } },
        function(err, obj) {
          if (err) console.log(err);
          else res.send([true]);
        }
      );
    } else res.send([false, "record does not exist"]);
  }
);

//Candidate party symbol update request
router.post(
  "/updatePartySymbol",
  authToken,
  upload.single("image"),
  async function(req, res) {
    if (req.body.id != null) {
      await Candidate.findOne({ _id: req.body.id }, function(err, obj) {
        if (err) console.log(err);
        else {
          if (fs.existsSync(obj.symbol)) fs.unlinkSync(obj.symbol);
        }
      });
      await Candidate.updateOne(
        { _id: req.body.id },
        { $set: { symbol: req.file.path.replace("\\", "/") } },
        function(err, obj) {
          if (err) console.log(err);
          else res.send([true]);
        }
      );
    } else res.send([false, "record does not exist"]);
  }
);

//Candidate details update request
router.post(
  "/updatePartySymbol",
  authToken,
  upload.single("image"),
  async function(req, res) {
    if (req.body.id != null) {
      await Candidate.findOne({ _id: req.body.id }, function(err, obj) {
        if (err) console.log(err);
        else {
          if (fs.existsSync(obj.symbol)) fs.unlinkSync(obj.symbol);
        }
      });
      await Candidate.updateOne(
        { _id: req.body.id },
        { $set: { symbol: req.file.path.replace("\\", "/") } },
        function(err, obj) {
          if (err) console.log(err);
          else res.send([true]);
        }
      );
    } else res.send([false, "record does not exist"]);
  }
);

//Candidate details update request
router.post("/candidateDetailUpdate", authToken, async function(req, res) {
  var update = JSON.parse(req.body.update);
  await Candidate.update({ _id: update.id }, { $set: update }, function(
    err,
    obj
  ) {
    if (err) console.log(err);
    else res.send([true]);
  });
});

//#endregion

//#region Voters admin Page

//Voters Arecord display
router.get("/voter", authToken, function(req, res) {
  Voter.find({}, (err, result) => {
    if (err) console.log(err);
    else res.render("voter", { data: result });
  });
});

//Voter Add Request
router.post("/voterCreate", authToken, function(req, res) {
  var voter = JSON.parse(req.body.voter);
  if (
    voter.name != "" &&
    voter.email != "" &&
    voter.phone != "" &&
    voter.aadhar != ""
  ) {
    Voter.create(voter, function(err, result) {
      if (err) console.log(err);
      else res.send([true]);
    });
  } else res.send([false, "fileds cann tbe empty"]);
});

//Voter Delete Request
router.post("/voterDel", function(req, res) {
  var d_id = req.body.del_id;
  Voter.deleteOne({ _id: d_id }, function(err, result) {
    if (err) console.log(err);
    else res.send(result);
  });
});

//Voter Update Request
router.post("/voterupdate", function(req, res) {
  var Voter_Data = JSON.parse(req.body.voter);
  var u_id = req.body.id;
  Voter.update({ _id: u_id }, { $set: Voter_Data }, function(err, result) {
    if (err) console.log(err);
    else res.send(result);
  });
});

//csv data upload voters
router.post("/csvFileUpload", authToken, upload.single("file"), function(
  req,
  res
) {
  var msgData = [];
  csv()
    .fromFile(req.file.path)
    .then(async jsonObj => {
      for (let i = 0; i < jsonObj.length; i++) {
        await Voter.create(jsonObj[i], (err, obj) => {
          msgData[i] = jsonObj[i];
        });
      }
    });
  console.log(msgData);
  res.send(msgData);
});
//voter csv upload
//#endregion

//#region Voters admin Page

//user-groups record display
router.get("/user-groups", authToken, async (req, res) => {
  console.log(req.profile.Status);
  if (req.profile.Role == "superadmin") {
    Admin.find({}, (err, result) => {
      if (err) console.log(err);
      else res.render("user-groups", { data: result });
    });
  } else {
    res.redirect("/dashboard");
  }
});

// user-groups Update Request
router.post("/adminUpdate", (req, res) => {
  var admin = JSON.parse(req.body.admin);
  var id = req.body.id;
  Admin.update({ _id: id }, { $set: admin }, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

// status toggler
router.post("/status_toggle", async (req, res) => {
  var id = req.body.id;
  await Admin.findOne({ _id: id }, (err, obj) => {
    if (err) res.send([false, "something went wrong"]);
    else if (obj == null) res.send([false, "user doesn't exist"]);
    else {
      if (obj.Status == "active") {
        Admin.update(
          { _id: id },
          { $set: { Status: "deactive" } },
          (err, result) => {
            if (err) res.send([false, "something went wrong"]);
            else res.send([true, "updated"]);
          }
        );
      } else {
        Admin.update(
          { _id: id },
          { $set: { Status: "active" } },
          (err, result) => {
            if (err) res.send([false, "something went wrong"]);
            else res.send([true, "updated"]);
          }
        );
      }
    }
  });
});

// admin request accept
router.post("/admin_request_accept", async (req, res) => {
  var id = req.body.id;
  await Admin.updateOne(
    { _id: id },
    { $set: { Status: "active" } },
    (err, result) => {
      if (err) console.log(err);
      else res.send([true]);
    }
  );
});

// admin request reject
router.post("/admin_request_reject", async (req, res) => {
  var id = req.body.id;
  await Admin.deleteOne({ _id: id }, (err, result) => {
    if (err) console.log(err);
    else res.send([true]);
  });
});
//#endregion

module.exports = router;
