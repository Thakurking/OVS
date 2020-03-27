const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CandidateSchema = new Schema({
    FullName: String,
    About: String,
    Phone: String,
    Email: String,
    Aadhar: String,
    Image: String,
    Symbol: String
});
module.exports = mongoose.model("Candidate", CandidateSchema);
