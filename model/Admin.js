const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const adminSchema = new Schema({
  Email: String,
  Password: String,
  Role: String,
  Status: String
});
module.exports = mongoose.model("Admin", adminSchema);
