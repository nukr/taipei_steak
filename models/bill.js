var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var BillSchema = new Schema({
  dishes: [{name: String, price: Number, quantity: Number}]
  , billNo: Number
  , credit: Boolean
  , discount: Boolean
  , shift: String
  , creator: String
  , orderTime: {type: Date, default: Date.now}
});

mongoose.model('Bill', BillSchema);
