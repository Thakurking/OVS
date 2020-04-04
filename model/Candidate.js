const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CandidateSchema = new Schema({
  name: String,
  about: String,
  phone: String,
  email: String,
  aadhar: String,
  image: String,
  party: String,
  symbol: String,
  score: Number
});
module.exports = mongoose.model("Candidate", CandidateSchema);
