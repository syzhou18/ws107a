var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeauth');

var Schema = mongoose.Schema;
var UserSchema = new Schema({
  username: String,
  password: String,
  firstname: String,
  lastname: String
});


module.exports = mongoose.model('User', UserSchema);