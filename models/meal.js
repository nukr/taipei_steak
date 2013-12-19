var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MealSchema = new Schema({
  name: String
  , order: Number
  , category: String
  , price: Number
  , remark: String
});

mongoose.model('Meal', MealSchema);

