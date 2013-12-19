var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var EmployeeSchema = new Schema({
  username: String
  , password: String
  , salt: String
  , realname: String
  , phone: String
  , birthday: Date
});

mongoose.model('Employee', EmployeeSchema);
