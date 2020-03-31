const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const VoterSchema = new Schema({
  name: String,
  phone: String,
  email: String,
  aadhar: String
});
module.exports = mongoose.model("Voter", VoterSchema);
