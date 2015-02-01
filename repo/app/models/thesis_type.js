var mongoose = require('mongoose');

var thesistypeschema = new mongoose.Schema({
  name    : String,
});

module.exports = mongoose.model('Thesistype', thesistypeschema);
