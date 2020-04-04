const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const eventSchema = new Schema({
  id: String,
  header: String,
  orgby: String,
  date: String,
  time: String,
  edate: String,
  etime: String,
  showResult: Boolean,
  showCandidates: Boolean,
  showHome: Boolean
});
module.exports = mongoose.model("event", eventSchema);
