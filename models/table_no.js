var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TableNo = new Schema({
  name: String
});

mongoose.model('TableNo', TableNoSchema);


